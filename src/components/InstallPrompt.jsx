import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 left-6 z-50 bg-blue-600 text-white p-4 rounded-xl shadow-xl flex items-center gap-4 max-w-sm"
        >
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1">Install NovaVid</h3>
            <p className="text-xs text-blue-100">Install our app for offline access and a better experience.</p>
          </div>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={handleInstall}
            className="bg-white text-blue-600 hover:bg-gray-100 whitespace-nowrap"
          >
            <Download className="w-4 h-4 mr-2" />
            Install
          </Button>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-blue-200 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;