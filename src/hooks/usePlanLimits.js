import { useAuth } from '@/contexts/AuthContext';

export const usePlanLimits = () => {
  const { user } = useAuth();

  const PLANS = {
    free: {
      name: 'Free Starter',
      videoDuration: 8,      
      canUploadMusic: false, 
      musicLibrary: 'basic', 
      allowCloudSave: false, 
      maxProjects: 3,
      aiAssistant: false,
      advancedAIFeatures: false,
      maxAICredits: 100 
    },
    premium: {
      name: 'Premium Creator',
      videoDuration: 13,     
      canUploadMusic: true,  
      musicLibrary: 'varied',
      allowCloudSave: true,
      maxProjects: 20,
      aiAssistant: false,
      advancedAIFeatures: true, 
      maxAICredits: 500
    },
    pro: {
      name: 'Pro Studio',
      videoDuration: 18,     
      canUploadMusic: true,  
      musicLibrary: 'unlimited',
      allowCloudSave: true,
      maxProjects: 9999,
      aiAssistant: true, 
      advancedAIFeatures: true,
      maxAICredits: 9999
    }
  };
  
  const isTrialActive = () => {
    if (!user?.trial_ends_at) return false;
    const now = new Date();
    const trialEnd = new Date(user.trial_ends_at);
    return now < trialEnd;
  };

  const currentPlanKey = isTrialActive() ? 'pro' : (user?.plan || 'free');
  const currentLimits = PLANS[currentPlanKey];

  return {
    ...currentLimits,
    planKey: currentPlanKey,
    isTrial: isTrialActive(),
    checkPermission: (featureName) => {
      return currentLimits[featureName] === true;
    }
  };
};