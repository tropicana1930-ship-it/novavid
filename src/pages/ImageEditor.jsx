import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from "react-helmet-async";
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import { Upload, Type, Square, Download, Wand2, Eraser, Image as ImageIcon, Sparkles, Loader2, PlusCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import * as fabric from 'fabric';
import { openai, handleAIError, generateImage } from '@/lib/ai';
import { useAuth } from '@/contexts/AuthContext';

const ImageEditor = () => {
  const { useCredits } = useAuth();
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  
  // Estados de filtros
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  
  // Estados de IA
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState(''); 

  // 1. Inicializar Canvas
  useEffect(() => {
    const initCanvas = new fabric.Canvas(canvasRef.current, {
      height: 500,
      width: 800,
      backgroundColor: '#1f2937', 
      selection: true,
    });
    
    initCanvas.on('selection:created', (e) => setSelectedObject(e.selected[0]));
    initCanvas.on('selection:updated', (e) => setSelectedObject(e.selected[0]));
    initCanvas.on('selection:cleared', () => setSelectedObject(null));

    setCanvas(initCanvas);

    return () => {
      initCanvas.dispose();
    };
  }, []);

  // 2. Carga de Imagen (Método Nativo Robusto)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const dataUrl = f.target.result;
      const imgObj = new Image();
      imgObj.src = dataUrl;
      imgObj.crossOrigin = "anonymous";

      imgObj.onload = () => {
        const imgInstance = new fabric.Image(imgObj);
        const scaleFactor = Math.min(
          (canvas.width * 0.8) / imgInstance.width, 
          (canvas.height * 0.8) / imgInstance.height
        );
        imgInstance.scale(scaleFactor);
        canvas.centerObject(imgInstance);
        canvas.add(imgInstance);
        canvas.setActiveObject(imgInstance);
        canvas.renderAll();
      };
      
      imgObj.onerror = () => {
         toast({ title: "Error", description: "No se pudo cargar la imagen.", variant: "destructive" });
      };
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 3. Herramientas Básicas
  const addText = () => {
    const text = new fabric.IText('Texto', { left: 100, top: 100, fontFamily: 'arial', fill: '#ffffff', fontSize: 24 });
    canvas.add(text);
    canvas.setActiveObject(text);
  };

  const addRect = () => {
    const rect = new fabric.Rect({ left: 150, top: 150, fill: 'rgba(59, 130, 246, 0.5)', width: 100, height: 100 });
    canvas.add(rect);
  };

  const deleteSelected = () => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      canvas.discardActiveObject();
      activeObjects.forEach((obj) => canvas.remove(obj));
    }
  };

  // 4. Filtros
  const applyFilters = () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj || !obj.isType('image')) return;

    const brightnessFilter = new fabric.Image.filters.Brightness({ brightness: parseFloat(brightness) });
    const contrastFilter = new fabric.Image.filters.Contrast({ contrast: parseFloat(contrast) });

    obj.filters = [brightnessFilter, contrastFilter];
    obj.applyFilters();
    canvas.renderAll();
  };

  useEffect(() => {
    applyFilters();
  }, [brightness, contrast]);

  // --- 5. FUNCIONES DE IA (NUEVAS) ---

  // A. Ajuste Inteligente (Texto -> Filtros)
  const handleSmartAdjust = async () => {
    if (!aiPrompt.trim()) return;
    
    const cost = 2;
    const hasCredits = await useCredits(cost);
    if (!hasCredits) {
       toast({ title: "Sin Créditos", description: `Necesitas ${cost} créditos.`, variant: "destructive" });
       return;
    }

    setIsAiLoading(true);
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an image editor. Based on user description, return JSON with 'brightness' (-1 to 1) and 'contrast' (-1 to 1). Example: 'darker' -> {\"brightness\": -0.3, \"contrast\": 0.1}" },
          { role: "user", content: aiPrompt }
        ]
      });
      
      const result = JSON.parse(response.choices[0].message.content);
      if (result.brightness) setBrightness(result.brightness);
      if (result.contrast) setContrast(result.contrast);
      toast({ title: "Ajuste Aplicado", description: "Filtros actualizados por IA." });
    } catch (e) {
      handleAIError(e);
      await useCredits(-cost); // Reembolso
    } finally {
      setIsAiLoading(false);
    }
  };

  // B. Generar Elemento (Texto -> DALL-E -> Canvas)
  const handleGenerateElement = async () => {
    if (!aiPrompt.trim()) return;

    const cost = 15;
    const hasCredits = await useCredits(cost);
    if (!hasCredits) {
       toast({ title: "Sin Créditos", description: `Generar cuesta ${cost} créditos.`, variant: "destructive" });
       return;
    }

    setIsAiLoading(true);
    try {
      const imageUrl = await generateImage(aiPrompt + ", isolated object on transparent background style, high quality");
      
      fabric.Image.fromURL(imageUrl, (img) => {
        img.scaleToWidth(200);
        canvas.centerObject(img);
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
      toast({ title: "Elemento Generado", description: "Imagen añadida al canvas." });
    } catch (e) {
      handleAIError(e);
      await useCredits(-cost); // Reembolso
    } finally {
      setIsAiLoading(false);
    }
  };

  const downloadImage = () => {
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL({ format: 'png', quality: 1 });
    link.download = 'novavid-edit.png';
    link.click();
  };

  return (
    <DashboardLayout>
      <Helmet><title>Pro Image Editor - NovaVid</title></Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Pro Studio</h1>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={deleteSelected} disabled={!selectedObject}><Eraser className="w-4 h-4 mr-2" /> Delete</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={downloadImage}><Download className="w-4 h-4 mr-2" /> Export</Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LIENZO */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center relative min-h-[500px]">
            <canvas ref={canvasRef} />
            {!canvas?.getObjects().length && (
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <Button className="pointer-events-auto bg-blue-600" onClick={() => document.getElementById('imgUpload').click()}>
                    <Upload className="w-4 h-4 mr-2" /> Upload Image
                 </Button>
                 <input type="file" id="imgUpload" className="hidden" accept="image/*" onChange={handleImageUpload} />
               </div>
            )}
          </div>

          {/* HERRAMIENTAS */}
          <div className="space-y-6">
            <Tabs defaultValue="tools" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-900 border border-gray-800">
                <TabsTrigger value="tools">Tools</TabsTrigger>
                <TabsTrigger value="adjust">Adjust</TabsTrigger>
                <TabsTrigger value="ai">AI Magic</TabsTrigger>
              </TabsList>

              <TabsContent value="tools" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={addText} className="text-white border-gray-700 hover:bg-gray-800"><Type className="w-4 h-4 mr-2" /> Text</Button>
                  <Button variant="outline" onClick={addRect} className="text-white border-gray-700 hover:bg-gray-800"><Square className="w-4 h-4 mr-2" /> Rect</Button>
                  <Button variant="outline" onClick={() => canvas.isDrawingMode = !canvas.isDrawingMode} className="text-white border-gray-700 hover:bg-gray-800"><Sparkles className="w-4 h-4 mr-2" /> Draw</Button>
                  <Button variant="outline" onClick={() => document.getElementById('imgUpload').click()} className="text-white border-gray-700 hover:bg-gray-800"><ImageIcon className="w-4 h-4 mr-2" /> Image</Button>
                </div>
              </TabsContent>

              <TabsContent value="adjust" className="space-y-6 mt-4">
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                  <div className="mb-4">
                    <div className="flex justify-between mb-2 text-white text-sm"><span>Brightness</span></div>
                    <Slider value={[brightness * 100]} min={-100} max={100} step={1} onValueChange={(val) => setBrightness(val[0] / 100)} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-white text-sm"><span>Contrast</span></div>
                    <Slider value={[contrast * 100]} min={-100} max={100} step={1} onValueChange={(val) => setContrast(val[0] / 100)} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="space-y-4 mt-4">
                <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-4 rounded-xl border border-purple-500/30">
                  <label className="text-xs text-purple-300 uppercase font-bold mb-2 block">Describe el cambio o elemento</label>
                  <Input 
                    value={aiPrompt} 
                    onChange={(e) => setAiPrompt(e.target.value)} 
                    placeholder="Ej: 'Hazlo más oscuro' o 'Un dragón neón'" 
                    className="bg-black/40 border-purple-500/30 text-white mb-3"
                  />
                  
                  <div className="grid grid-cols-1 gap-2">
                    <Button onClick={handleSmartAdjust} disabled={isAiLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                      {isAiLoading ? <Loader2 className="animate-spin mr-2"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                      Ajustar Estilo (2 pts)
                    </Button>
                    <Button onClick={handleGenerateElement} disabled={isAiLoading} variant="outline" className="w-full border-purple-500 text-purple-300 hover:bg-purple-900/50">
                      {isAiLoading ? <Loader2 className="animate-spin mr-2"/> : <PlusCircle className="mr-2 h-4 w-4"/>}
                      Generar Elemento (15 pts)
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">Powered by GPT-4 & DALL-E 3</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ImageEditor;