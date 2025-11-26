import { toast } from '@/components/ui/use-toast';

const SYNC_QUEUE_KEY = 'novavid_sync_queue';

export const syncManager = {
  queueAction(action) {
    const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    queue.push({
      ...action,
      timestamp: Date.now(),
    });
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    toast({
      title: "Saved for later",
      description: "You are offline. Action queued for sync when online.",
    });
  },

  async processQueue() {
    if (!navigator.onLine) return;

    const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    if (queue.length === 0) return;

    toast({
      title: "Syncing...",
      description: `Processing ${queue.length} offline actions.`,
    });

    // In a real app, you would loop through and execute API calls here.
    // For this demo, we'll simulate processing.
    
    setTimeout(() => {
      localStorage.setItem(SYNC_QUEUE_KEY, '[]');
      toast({
        title: "Sync Complete",
        description: "All offline actions have been processed.",
      });
    }, 1500);
  },

  initListener() {
    window.addEventListener('online', () => {
      this.processQueue();
    });
  }
};