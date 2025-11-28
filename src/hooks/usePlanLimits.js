import { useAuth } from '@/contexts/AuthContext';

export const usePlanLimits = () => {
  const { user } = useAuth();

  // Configuración de los planes según tu documento
  const PLANS = {
    free: {
      name: 'Free Starter',
      videoDuration: 8,      // Máximo 8 segundos
      canUploadMusic: false, // No puede subir música propia
      musicLibrary: 'basic', // Solo librería básica
      allowCloudSave: false, // No guarda en nube (ejemplo)
      maxProjects: 3
    },
    premium: {
      name: 'Premium Creator',
      videoDuration: 13,     // Máximo 13 segundos
      canUploadMusic: true,  // Con restricciones (implementar lógica extra si se requiere)
      musicLibrary: 'varied',
      allowCloudSave: true,
      maxProjects: 20
    },
    pro: {
      name: 'Pro Studio',
      videoDuration: 18,     // Máximo 18 segundos
      canUploadMusic: true,  // Sin restricciones
      musicLibrary: 'unlimited',
      allowCloudSave: true,
      maxProjects: 9999
    }
  };

  // Determinar si está en periodo de prueba (5 días)
  const isTrialActive = () => {
    if (!user?.trial_ends_at) return false;
    const now = new Date();
    const trialEnd = new Date(user.trial_ends_at);
    return now < trialEnd;
  };

  // Lógica principal: Si está en trial, le damos beneficios PRO, si no, su plan real
  const currentPlanKey = isTrialActive() ? 'pro' : (user?.plan || 'free');
  const currentLimits = PLANS[currentPlanKey];

  return {
    ...currentLimits,
    planKey: currentPlanKey,
    isTrial: isTrialActive(),
    // Función auxiliar para verificar límites en la UI
    checkPermission: (featureName) => {
      // Ejemplo: checkPermission('canUploadMusic')
      return currentLimits[featureName] === true;
    }
  };
};