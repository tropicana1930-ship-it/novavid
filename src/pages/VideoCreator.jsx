import React, { useState, useEffect, useRef } from 'react';
import { ProjectService } from '@/lib/projects';
import { Helmet } from "react-helmet-async";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Usar textarea para descripciones largas
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Plus, Trash2, Play, Pause, Wand2, Sparkles, Download, Loader2, Save, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { openai, handleAIError } from '@/lib/ai';
import { videoEngine } from '@/lib/videoEngine';

const VideoCreator = () => {
  const { user, useCredits } = useAuth();
  const fileInputRef = useRef(null); 
  const aiImageInputRef = useRef(null); 

  const [images, setImages] = useState([]);
  const [projectName, setProjectName] = useState('');
  
  // AI Config
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiBaseImage, setAiBaseImage] = useState(null); 
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Render Config
  const [selectedTransition, setSelectedTransition] = useState('Fade');
  const [durationPerSlide, setDurationPerSlide] = useState(2);
  const [isRendering, setIsRendering] = useState(false);
  const [finalVideoUrl, setFinalVideoUrl] = useState(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);

  const transitions = ['Fade', 'Slide', 'Zoom', 'Wipe', 'Dissolve', 'Cross Fade'];

  useEffect(() => {
    let interval;
    if (isPlaying && images.length > 0) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= images.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, durationPerSlide * 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, images, durationPerSlide]);

  // --- 1. IA: DIRECTOR DE VIDEO (IMAGEN + TEXTO) ---
  const handleAiBaseImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAiBaseImage(url);
      toast({ title: "Imagen de Referencia Cargada", description: "La IA analizará esta imagen para el estilo." });
    }
  };

  const handleAIMagic = async () => {
    if (!aiPrompt.trim() && !aiBaseImage) {
      toast({ title: "Falta Información", description: "Describe tu video o sube una imagen base.", variant: "destructive" });
      return;
    }

    const creditCost = 5;
    const success = await useCredits(creditCost);
    if (!success) {
      toast({ title: "Sin Créditos", variant: "destructive" });
      return;
    }

    setIsAiLoading(true);
    try {
      if (!openai) throw new Error("AI not configured");
      
      let messages = [];
      
      if (aiBaseImage) {
        messages = [
            {
                role: "user",
                content: [
                    { type: "text", text: `Actúa como un director de cine experto. El usuario quiere un video basado en esta IMAGEN y esta descripción: "${aiPrompt}". Define el mejor estilo. Devuelve SOLO un JSON: {"transition": "string", "duration": number}. Transition debe ser una de: [Fade, Slide, Zoom, Wipe, Dissolve]. Duration entre 1 y 5.` },
                    { type: "image_url", image_url: { url: aiBaseImage } }
                ]
            }
        ];
      } else {
        messages = [
            { role: "system", content: "You are a video editor AI. Return JSON: {\"transition\": \"string\", \"duration\": number}." },
            { role: "user", content: `Create style for: ${aiPrompt}` }
        ];
      }

      const response = await openai.chat.completions.create({
        model: aiBaseImage ? "gpt-4o" : "gpt-3.5-turbo",
        messages: messages
      });

      const jsonString = response.choices[0].message.content.match(/\{[\s\S]*\}/)?.[0] || "{}";
      const result = JSON.parse(jsonString);

      setSelectedTransition(result.transition || 'Fade');
      setDurationPerSlide(result.duration || 2);
      
      toast({ title: "✨ Estilo Aplicado", description: `Transición: ${result.transition}, Duración: ${result.duration}s` });

    } catch (error) {
      handleAIError(error);
      await useCredits(-creditCost);
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- 2. RENDER Y NUBE (Con cobro) ---
  const handleCreateVideo = async () => {
    if (images.length === 0) return;
    if (!projectName.trim()) {
      toast({ title: "Nombre Requerido", variant: "destructive" });
      return;
    }

    const renderCost = 20; 
    if (user) {
        const success = await useCredits(renderCost);
        if (!success) {
            toast({ title: "Sin Créditos", description: `Necesitas ${renderCost} créditos.`, variant: "destructive" });
            return; 
        }
    }

    setIsRendering(true);
    setFinalVideoUrl(null);
    
    try {
      toast({ title: "Procesando...", description: "Creando video y guardando en la nube." });
      
      const blobUrl = await videoEngine.createVideo({ images, durationPerSlide, transition: selectedTransition });
      setFinalVideoUrl(blobUrl);

      if (user) {
        const videoBlob = await fetch(blobUrl).then(r => r.blob());
        const videoFile = new File([videoBlob], `${projectName}.mp4`, { type: 'video/mp4' });
        const publicVideoUrl = await ProjectService.uploadAsset(videoFile, user.id);

        await ProjectService.saveProject({
          userId: user.id,
          project: {
            name: projectName,
            type: 'video',
            content: { images, settings: { duration: durationPerSlide, transition: selectedTransition } },
            thumbnailUrl: images[0],
            videoUrl: publicVideoUrl 
          }
        });
        toast({ title: "¡Guardado!", className: "bg-green-600 text-white" });
      }
    } catch (error) {
      if (user) await useCredits(-renderCost);
      toast({ title: "Error", description: "Falló el renderizado.", variant: "destructive" });
    } finally {
      setIsRendering(false);
    }
  };

  const handleTimelineUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) setImages(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  return (
    <DashboardLayout>
      <Helmet><title>Video Creator - NovaVid</title></Helmet>
      
      <input type="file" ref={fileInputRef} onChange={handleTimelineUpload} multiple accept="image/*" className="hidden" />
      <input type="file" ref={aiImageInputRef} onChange={handleAiBaseImageUpload} accept="image/*" className="hidden" />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">AI Video Studio</h1>
          {finalVideoUrl && (
            <a href={finalVideoUrl} download={`${projectName}.mp4`}>
              <Button className="bg-green-600 hover:bg-green-700"><Download className="mr-2 h-4 w-4"/> Descargar</Button>
            </a>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* PANEL AI DIRECTOR */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-indigo-400 w-5 h-5" />
                <h3 className="text-white font-semibold">Director de IA</h3>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                {/* 1. Subir Imagen Base */}
                <div 
                  onClick={() => aiImageInputRef.current.click()}
                  className="border-2 border-dashed border-indigo-500/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-500/10 h-32 relative overflow-hidden group"
                >
                  {aiBaseImage ? (
                    <img src={aiBaseImage} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                  ) : (
                    <>
                      <ImageIcon className="text-indigo-400 mb-2" />
                      <span className="text-xs text-indigo-200 text-center px-2">Subir Imagen Referencia</span>
                    </>
                  )}
                </div>

                {/* 2. Prompt y Botón */}
                <div className="md:col-span-2 flex flex-col gap-3">
                  <Textarea 
                    value={aiPrompt} 
                    onChange={(e) => setAiPrompt(e.target.value)} 
                    placeholder="Describe cómo quieres el video: 'Estilo cinematográfico, lento, nostálgico...'" 
                    className="bg-black/30 border-indigo-500/30 text-white h-full resize-none" 
                  />
                  <Button 
                    onClick={handleAIMagic} 
                    disabled={isAiLoading} 
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isAiLoading ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2 w-4 h-4" />}
                    Diseñar Estilo (5 pts)
                  </Button>
                </div>
              </div>
            </div>

            {/* PREVISUALIZADOR */}
            <div className="bg-black border border-gray-800 rounded-xl aspect-video relative flex items-center justify-center overflow-hidden">
                {isRendering && (
                    <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-2"/>
                        <p className="text-white">Renderizando...</p>
                    </div>
                )}
                
                <AnimatePresence mode='wait'>
                  {images.length > 0 ? (
                    <motion.img 
                        key={currentFrame} 
                        src={images[currentFrame]} 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="w-full h-full object-cover"
                    />
                  ) : (
                    <p className="text-gray-600">Línea de tiempo vacía</p>
                  )}
                </AnimatePresence>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-blue-400">
                        {isPlaying ? <Pause /> : <Play />}
                    </button>
                    <span className="text-white font-mono text-sm pt-0.5">{currentFrame + 1} / {images.length || 0}</span>
                </div>
            </div>

            {/* TIMELINE */}
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <div className="flex justify-between mb-2">
                    <Label className="text-white">Timeline</Label>
                    <Button size="sm" onClick={() => fileInputRef.current.click()} variant="secondary">
                        <Plus className="w-3 h-3 mr-1" /> Clips
                    </Button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((img, i) => (
                        <div key={i} className={`w-24 h-16 shrink-0 relative border-2 rounded cursor-pointer overflow-hidden ${currentFrame === i ? 'border-blue-500' : 'border-gray-700'}`} onClick={() => setCurrentFrame(i)}>
                            <img src={img} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>

            <Button onClick={handleCreateVideo} disabled={isRendering || images.length === 0} className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700">
                {isRendering ? "Procesando..." : "Renderizar (20 Créditos)"}
            </Button>
          </div>

          {/* AJUSTES LATERALES */}
          <div className="space-y-4">
             <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                <Label className="text-white mb-2 block">Nombre del Proyecto</Label>
                <Input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Mi Video..." className="bg-gray-800 text-white mb-6"/>
                
                <Label className="text-white mb-2 block">Duración por Clip ({durationPerSlide}s)</Label>
                <input type="range" min="1" max="5" step="0.5" value={durationPerSlide} onChange={e => setDurationPerSlide(Number(e.target.value))} className="w-full accent-blue-500 mb-6" />

                <Label className="text-white mb-2 block">Transición</Label>
                <div className="grid grid-cols-2 gap-2">
                    {transitions.map(t => (
                        <button key={t} onClick={() => setSelectedTransition(t)} className={`text-xs p-2 rounded border ${selectedTransition === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                            {t}
                        </button>
                    ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VideoCreator;