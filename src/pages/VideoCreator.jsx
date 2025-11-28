// Reemplaza toda la función handleCreateVideo en src/pages/VideoCreator.jsx

const handleCreateVideo = async () => {
  if (images.length === 0) return;
  
  if (!projectName.trim()) {
    toast({ title: "Name Required", description: "Please name your project.", variant: "destructive" });
    return;
  }

  // --- LÓGICA DE COBRO DE CRÉDITOS POR RENDERIZADO (Costo: 20) ---
  const renderCost = 20; 
  if (user) {
      const success = await useCredits(renderCost);
      if (!success) {
          toast({ 
              title: "Sin Créditos", 
              description: `Necesitas ${renderCost} créditos para renderizar este video.`, 
              variant: "destructive" 
          });
          return; // Detener el proceso si no hay créditos
      }
  }
  // ----------------------------------------------------------------

  setIsRendering(true);
  setFinalVideoUrl(null);
  
  try {
    toast({ title: "Rendering & Saving...", description: "Processing video engine and saving to cloud..." });
    
    // 1. Llamar al motor (FFmpeg)
    const blobUrl = await videoEngine.createVideo({
      images,
      durationPerSlide,
      transition: selectedTransition
    });

    setFinalVideoUrl(blobUrl);

    // 2. GUARDAR PROYECTO EN SUPABASE
    if (user) {
      toast({ title: "Subiendo a la Nube...", description: "Guardando proyecto y assets." });
        
      const videoBlob = await fetch(blobUrl).then(r => r.blob());
      const videoFile = new File([videoBlob], `${projectName}.mp4`, { type: 'video/mp4' });

      // Subir Video a Storage (usa el búnker 'assets')
      const publicVideoUrl = await ProjectService.uploadAsset(videoFile, user.id);

      // Guardar Proyecto en DB
      const projectConfig = {
        images: images,
        settings: {
          duration: durationPerSlide,
          transition: selectedTransition
        }
      };

      await ProjectService.saveProject({
        userId: user.id,
        project: {
          name: projectName,
          type: 'video',
          content: projectConfig,
          thumbnailUrl: images[0] || null,
          videoUrl: publicVideoUrl 
        }
      });

      toast({ 
        title: "Success!", 
        description: "Video renderizado y guardado en la nube.", 
        className: "bg-green-600 text-white border-none" 
      });
    } else {
      toast({ title: "Render Complete", description: "Video listo (No guardado - Inicia sesión).", className: "bg-green-600 text-white border-none" });
    }

  } catch (error) {
    console.error(error);
    // --- REEMBOLSO DE CRÉDITOS si la llamada falla ---
    if (user) {
        await useCredits(-renderCost); 
    }
    // --------------------------------------------------
    toast({ title: "Error", description: "Error al crear o guardar video. Créditos reembolsados.", variant: "destructive" });
  } finally {
    setIsRendering(false);
  }
};