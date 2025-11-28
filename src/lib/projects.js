import { supabase } from './supabase';

export const ProjectService = {
  
  // 1. Guardar o Actualizar un Proyecto
  async saveProject({ userId, project }) {
    if (!userId) throw new Error("User ID required");

    const projectData = {
      user_id: userId,
      name: project.name || 'Untitled Project',
      type: project.type, // 'video', 'image', 'audio'
      content: project.content, // Aquí va el JSON de la línea de tiempo o configuración
      thumbnail_url: project.thumbnailUrl,
      updated_at: new Date().toISOString()
    };

    if (project.id) {
      // Actualizar existente
      const { data, error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', project.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Crear nuevo
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // 2. Cargar un proyecto específico
  async getProject(projectId) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // 3. Subir archivos generados (Videos/Imágenes) al Storage
  async uploadAsset(file, userId) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('assets') // Asegúrate de crear este bucket en Supabase
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
    return data.publicUrl;
  }
};