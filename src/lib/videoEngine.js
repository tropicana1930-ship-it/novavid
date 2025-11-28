import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export class VideoEngine {
  constructor() {
    this.ffmpeg = new FFmpeg();
    this.loaded = false;
  }

  async load() {
    if (this.loaded) return;
    
    // Cargamos el núcleo de FFmpeg desde un CDN rápido
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    // Escuchamos logs para debugging
    this.ffmpeg.on('log', ({ message }) => {
      console.log('FFmpeg Log:', message);
    });

    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    
    this.loaded = true;
  }

  /**
   * Convierte un array de URLs de imágenes en un video MP4
   */
  async createVideo({ images, durationPerSlide = 2, transition = 'fade' }) {
    if (!this.loaded) await this.load();

    const width = 1280;
    const height = 720;
    const fps = 30;

    // 1. Escribir imágenes en el sistema de archivos virtual
    // Convertimos las imágenes a un tamaño estándar para evitar errores
    for (let i = 0; i < images.length; i++) {
      const fileName = `img${i}.jpg`;
      await this.ffmpeg.writeFile(fileName, await fetchFile(images[i]));
    }

    // 2. Construir el comando complejo de FFmpeg
    // Este comando hace zoom pan (Ken Burns) o crossfade simple
    // Para simplificar esta versión v1, haremos un slideshow simple de alta calidad
    
    // Comando básico: input images -> video
    const command = [
      '-framerate', `1/${durationPerSlide}`, // 1 imagen cada X segundos
      '-i', 'img%d.jpg',                     // Patrón de entrada (img0.jpg, img1.jpg...)
      '-c:v', 'libx264',                     // Codec de video estándar
      '-r', '30',                            // 30 FPS de salida
      '-pix_fmt', 'yuv420p',                 // Formato de pixel compatible con todo
      '-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`, // Escalar y centrar
      'output.mp4'                           // Archivo de salida
    ];

    console.log("🎬 Renderizando video con comando:", command);
    await this.ffmpeg.exec(command);

    // 3. Leer el archivo generado
    const data = await this.ffmpeg.readFile('output.mp4');
    
    // 4. Limpieza (Borrar archivos temporales para no llenar memoria)
    for (let i = 0; i < images.length; i++) {
      await this.ffmpeg.deleteFile(`img${i}.jpg`);
    }

    // 5. Retornar URL del video
    return URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
  }
}

// Singleton: una única instancia para toda la app
export const videoEngine = new VideoEngine();