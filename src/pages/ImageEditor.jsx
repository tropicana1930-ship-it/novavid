import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from "react-helmet-async";
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import { Upload, Type, Square, Download, Wand2, Eraser, Image as ImageIcon, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import * as fabric from 'fabric';
import { openai, handleAIError } from '@/lib/ai';

const ImageEditor = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  
  // Estados de filtros
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  
  // Estados de IA
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');

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

  // 2. Manejar subida de imagen (MÉTODO NATIVO ROBUSTO)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !canvas) return;

    const reader = new FileReader();

    reader.onload = (f) => {
      const dataUrl = f.target.result;
      
      // Creamos un elemento de imagen HTML estándar primero
      const imgObj = new Image();
      imgObj.src = dataUrl;
      imgObj.crossOrigin = "anonymous"; // Importante para evitar problemas de CORS

      imgObj.onload = () => {
        // Creamos la imagen de Fabric a partir del elemento HTML cargado
        const imgInstance = new fabric.Image(imgObj);

        // Escalar para ajustar al canvas (80% del tamaño)
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
         toast({ title: "Error", description: "La imagen no pudo ser interpretada.", variant: "destructive" });
      };
    };
    
    reader.readAsDataURL(file);
    e.target.value = ''; // Limpiar input
  };

  // 3. Herramientas de Edición
  const addText = () => {
    const text = new fabric.IText('Doble click para editar', {
      left: 100, top: 100,
      fontFamily: 'arial', fill: '#ffffff', fontSize: 24
    });
    canvas.add(text);
    canvas.setActiveObject(text);
  };

  const addRect = () => {
    const rect = new fabric.Rect({
      left: 150, top: 150, fill: 'rgba(59, 130, 246, 0.5)', 
      width: 100, height: 100
    });
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

  // 5. Análisis de IA
  const handleAnalyzeImage = async () => {
    if (!canvas?.getObjects().length) {
      toast({ title: "Canvas Empty", description: "Upload an image first.", variant: "destructive" });
      return;
    }
    
    // Obtenemos imagen en baja calidad para la IA
    const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 0.5 });
    
    setIsAnalyzing(true);
    try {
      if (!openai) throw new Error("AI not configured");
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Describe this image and suggest creative edits." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      });
      setAiAnalysis(response.choices[0].message.content);
    } catch (error) {
      handleAIError(error);
      toast({ title: "AI Error", description: "No se pudo analizar la imagen.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadImage = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: 'png', quality: 1 });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'novavid-edit.png';
    link.click();
  };

  return (
    <DashboardLayout>
      <Helmet><title>Pro Image Editor - NovaVid</title></Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Pro Studio</h1>
            <p className="text-gray-400">Layer-based editing with AI assistance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={deleteSelected} disabled={!selectedObject}>
              <Eraser className="w-4 h-4 mr-2" /> Delete
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={downloadImage}>
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LIENZO */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex items-center justify-center relative min-h-[500px]">
            <canvas ref={canvasRef} className="border border-gray-700 shadow-2xl" />
            
            {!canvas?.getObjects().length && (
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <p className="text-gray-500 mb-4">Canvas is empty</p>
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
                <TabsTrigger value="ai">AI</TabsTrigger>
              </TabsList>

              <TabsContent value="tools" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={addText} className="text-white border-gray-700 hover:bg-gray-800">
                    <Type className="w-4 h-4 mr-2" /> Text
                  </Button>
                  <Button variant="outline" onClick={addRect} className="text-white border-gray-700 hover:bg-gray-800">
                    <Square className="w-4 h-4 mr-2" /> Rectangle
                  </Button>
                  <Button variant="outline" onClick={() => canvas.isDrawingMode = !canvas.isDrawingMode} className="text-white border-gray-700 hover:bg-gray-800">
                    <Sparkles className="w-4 h-4 mr-2" /> Draw
                  </Button>
                  <Button variant="outline" onClick={() => document.getElementById('imgUpload').click()} className="text-white border-gray-700 hover:bg-gray-800">
                    <ImageIcon className="w-4 h-4 mr-2" /> Image
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="adjust" className="space-y-6 mt-4">
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                  <div className="mb-4">
                    <div className="flex justify-between mb-2 text-white text-sm">
                      <span>Brightness</span> <span>{(brightness * 100).toFixed(0)}%</span>
                    </div>
                    <Slider value={[brightness * 100]} min={-100} max={100} step={1} onValueChange={(val) => setBrightness(val[0] / 100)} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-white text-sm">
                      <span>Contrast</span> <span>{(contrast * 100).toFixed(0)}%</span>
                    </div>
                    <Slider value={[contrast * 100]} min={-100} max={100} step={1} onValueChange={(val) => setContrast(val[0] / 100)} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="space-y-4 mt-4">
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                  <Button onClick={handleAnalyzeImage} disabled={isAnalyzing} className="w-full bg-purple-600 hover:bg-purple-700 mb-4">
                    {isAnalyzing ? <Wand2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                    Analyze Canvas
                  </Button>
                  {aiAnalysis && (
                    <div className="bg-black/30 p-3 rounded-lg text-sm text-gray-300 max-h-60 overflow-y-auto">
                      {aiAnalysis}
                    </div>
                  )}
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