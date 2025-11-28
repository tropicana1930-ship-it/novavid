import React, { useState, useEffect } from 'react';
import { ProjectService } from '@/lib/projects'; // 👈 IMPORTANTE: Servicio de guardado
import { Helmet } from "react-helmet-async";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Plus, Trash2, Video, Music, Clock, Play, Pause, Film, Wand2, Sparkles, Bot, Download, Loader2, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { openai, handleAIError } from '@/lib/ai';
// 👇 Importamos el motor real
import { videoEngine } from '@/lib/videoEngine';

const VideoCreator = () => {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [projectName, setProjectName] = useState('');
  
  // Configuración
  const [selectedTransition, setSelectedTransition] = useState('Fade');
  const [selectedEffect, setSelectedEffect] = useState('None');
  const [durationPerSlide, setDurationPerSlide] = useState(2);
  
  // Estados IA y Renderizado
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [finalVideoUrl, setFinalVideoUrl] = useState(null);

  // Estados Reproductor
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);

  const maxDuration = user?.plan === 'free' ? 8 : user?.plan === 'premium' ? 13 : 18;
  const transitions = ['Fade', 'Slide', 'Zoom', 'Wipe', 'Dissolve', 'Cross Fade'];
  const effects = ['None', 'Ken Burns', 'Parallax', 'Glitch', 'VHS', 'Film Grain'];

  // Efecto Slideshow
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

  // IA Director
  const handleAIMagic = async () => {
    if (!aiPrompt.trim()) {
      toast({ title: "Empty Prompt", description: "Describe your video vision first!", variant: "destructive" });
      return;
    }
    setIsAiLoading(true);
    try {
      if (!openai) throw new Error("AI not configured");
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: `You are a video editor AI. Analyze description. Return JSON: {"transition": "string", "effect": "string", "duration": number}. Duration 1-5.` },
          { role: "user", content: aiPrompt }
        ]
      });
      const result = JSON.parse(response.choices[0].message.content);
      setSelectedTransition(result.transition || 'Fade');
      setSelectedEffect(result.effect || 'None');
      setDurationPerSlide(result.duration || 2);
      toast({ title: "✨ Magic Applied!", description: `Style: ${result.transition}, Speed: ${result.duration}s` });
    } catch (error) {
      handleAIError(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  // 🚀 RENDERIZADO REAL + GUARDADO EN NUBE
  const handleCreateVideo = async () => {
    if (images.length === 0) return;
    
    // 1. Validar nombre
    if (!projectName.trim()) {
      toast({ title: "Name Required", description: "Please name your project.", variant: "destructive" });
      return;
    }

    setIsRendering(true);
    setFinalVideoUrl(null);
    
    try {
      toast({ title: "Rendering & Saving...", description: "Processing video engine and saving to cloud..." });
      
      // 2. Llamar al motor (FFmpeg)
      const url = await videoEngine.createVideo({
        images,
        durationPerSlide,
        transition: selectedTransition
      });

      setFinalVideoUrl(url);

      // 3. GUARDAR PROYECTO EN SUPABASE (Lógica Pro)
      if (user) {
        const projectConfig = {
          images: images,
          settings: {
            duration: durationPerSlide,
            transition: selectedTransition,
            effect: selectedEffect
          }
        };

        await ProjectService.saveProject({
          userId: user.id,
          project: {
            name: projectName,
            type: 'video',
            content: projectConfig,
            thumbnailUrl: images[0] || null // Primera imagen como portada
          }
        });

        toast({ 
          title: "Success!", 
          description: "Video rendered and project saved to cloud.", 
          className: "bg-green-600 text-white border-none" 
        });
      } else {
        toast({ title: "Render Complete", description: "Video ready (Not saved - Login required)." });
      }

    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not create or save video.", variant: "destructive" });
    } finally {
      setIsRendering(false);
    }
  };

  // Helpers de imágenes
  const handleAddImages = () => {
    const newImages = [
      'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1682687221038-404670e01d46?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=1000&auto=format&fit=crop'
    ];
    setImages([...images, ...newImages]);
  };
  const handleRemoveImage = (index, e) => {
    e.stopPropagation();
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  const togglePlay = () => images.length > 0 && setIsPlaying(!isPlaying);

  return (
    <DashboardLayout>
      <Helmet><title>Video Creator - NovaVid</title></Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Video Studio Pro</h1>
            <p className="text-gray-400">Real 1080p Rendering Engine</p>
          </div>
          {/* Si ya hay video renderizado, mostrar botón de descarga */}
          {finalVideoUrl && (
            <a href={finalVideoUrl} download={`${projectName}.mp4`}>
              <Button className="bg-green-600 hover:bg-green-700 animate-pulse">
                <Download className="w-5 h-5 mr-2" /> Download MP4
              </Button>
            </a>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Project Name & AI */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <Label className="text-white mb-2">Project Name</Label>
                <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="My Awesome Movie" className="bg-gray-800 border-gray-700 text-white" />
              </div>
              <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-xl p-4 relative overflow-hidden">
                <Label className="text-indigo-300 mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Director</Label>
                <div className="flex gap-2">
                  <Input value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g. 'Fast action movie'" className="bg-black/30 border-indigo-500/30 text-white" />
                  <Button onClick={handleAIMagic} disabled={isAiLoading} size="icon" className="bg-indigo-500 hover:bg-indigo-600 text-white shrink-0">
                    {isAiLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* PREVIEW AREA */}
            <div className="bg-black border border-gray-800 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center shadow-2xl group">
              {isRendering ? (
                <div className="text-center">
                  <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
                  <p className="text-white font-semibold">Rendering & Saving...</p>
                  <p className="text-gray-400 text-sm">Uploading to cloud</p>
                </div>
              ) : (
                <AnimatePresence mode='wait'>
                  {images.length > 0 ? (
                    <motion.img
                      key={currentFrame}
                      src={images[currentFrame]}
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full object-cover absolute inset-0"
                    />
                  ) : (
                    <div className="text-center text-gray-600 flex flex-col items-center">
                      <Film className="w-16 h-16 mb-4 opacity-50" />
                      <p>Timeline Empty</p>
                    </div>
                  )}
                </AnimatePresence>
              )}
              
              {!isRendering && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between z-10">
                   <div className="text-white font-mono text-sm">{currentFrame + 1} / {images.length}</div>
                   <Button onClick={togglePlay} variant="ghost" className="text-white hover:bg-white/20 rounded-full w-12 h-12 p-0 border border-white/30">
                     {isPlaying ? <Pause className="fill-white w-5 h-5" /> : <Play className="fill-white ml-1 w-5 h-5" />}
                   </Button>
                   <div className="text-xs text-gray-400 font-mono">{durationPerSlide}s/clip</div>
                </div>
              )}
            </div>

            {/* TIMELINE */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Timeline</h3>
                <Button onClick={handleAddImages} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" /> Add Clips
                </Button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700">
                  {images.map((img, idx) => (
                    <div key={idx} onClick={() => { setCurrentFrame(idx); setIsPlaying(false); }} className={`relative group flex-shrink-0 w-32 aspect-video cursor-pointer border-2 rounded-lg overflow-hidden ${currentFrame === idx ? 'border-blue-500' : 'border-gray-700'}`}>
                      <img src={img} className="w-full h-full object-cover" />
                      <button onClick={(e) => handleRemoveImage(idx, e)} className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
            
            <Button 
              onClick={handleCreateVideo} 
              disabled={isRendering || images.length === 0} 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg py-6 shadow-lg"
            >
              {isRendering ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              {isRendering ? "Processing..." : "Export & Save Project"}
            </Button>
          </div>

          {/* Configuración Lateral */}
          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Render Settings</h3>
              <div className="space-y-4">
                <div>
                   <Label className="text-gray-400 text-xs uppercase mb-2 block">Duration per Slide</Label>
                   <input type="range" min="0.5" max="5" step="0.5" value={durationPerSlide} onChange={(e) => setDurationPerSlide(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                   <div className="text-right text-blue-400 text-sm mt-1">{durationPerSlide}s</div>
                </div>
                <div>
                   <Label className="text-gray-400 text-xs uppercase mb-2 block">Transition (Visual only in v1)</Label>
                   <div className="grid grid-cols-2 gap-2">
                     {transitions.map(t => (
                       <button key={t} onClick={() => setSelectedTransition(t)} className={`text-xs p-2 rounded border ${selectedTransition === t ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-transparent text-gray-400'}`}>{t}</button>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VideoCreator;