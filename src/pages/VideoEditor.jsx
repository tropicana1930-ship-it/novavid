import React from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import DashboardLayout from '@/components/DashboardLayout';
import { Upload, Play, Pause, SkipBack, SkipForward, Volume2, Scissors, Wand2, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { openai, handleAIError } from '@/lib/ai';

const VideoEditor = () => {
  const [speed, setSpeed] = React.useState([1]);
  const [volume, setVolume] = React.useState([100]);

  const handleAIAction = async (action) => {
    toast({ title: "AI Processing", description: `Requesting AI to ${action}...` });
    
    // Simulation of video processing using AI suggestions
    try {
      const suggestions = await openai.getEditingSuggestions(`I want to ${action} for a video clip.`);
      toast({ 
        title: "AI Suggestion", 
        description: suggestions.content.slice(0, 100) + "..." 
      });
    } catch (error) {
      handleAIError(error);
    }
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>Video Editor - NovaVid</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Video Editor</h1>
          <p className="text-gray-400">Enhanced with intelligent suggestions</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 aspect-video flex items-center justify-center">
              <div className="text-center">
                <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Upload Video</h3>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Select Video
                </Button>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button variant="outline" size="icon" className="border-gray-700 text-white"><SkipBack className="w-5 h-5" /></Button>
                <Button size="icon" className="bg-blue-600 w-12 h-12"><Play className="w-6 h-6" /></Button>
                <Button variant="outline" size="icon" className="border-gray-700 text-white"><SkipForward className="w-5 h-5" /></Button>
              </div>
              <div className="h-24 bg-gray-800 rounded-lg flex items-center px-4">
                <div className="text-gray-400 text-sm">Timeline</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
             <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-blue-500/30 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                AI Smart Tools
              </h3>
              <div className="space-y-3">
                <Button onClick={() => handleAIAction('auto-color grade')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Auto Color Grade
                </Button>
                <Button onClick={() => handleAIAction('remove silence')} variant="outline" className="w-full border-indigo-500/30 text-white hover:bg-indigo-500/20">
                  <Scissors className="w-4 h-4 mr-2" />
                  Smart Cut Silence
                </Button>
                <Button onClick={() => handleAIAction('enhance audio')} variant="outline" className="w-full border-indigo-500/30 text-white hover:bg-indigo-500/20">
                  <Volume2 className="w-4 h-4 mr-2" />
                  AI Audio Cleanup
                </Button>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Speed Control</h3>
              <div className="space-y-4">
                 <Slider value={speed} onValueChange={setSpeed} min={0.25} max={4} step={0.25} className="w-full" />
                 <div className="flex justify-between"><span className="text-xs text-gray-400">0.25x</span><span className="text-xs text-gray-400">4x</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VideoEditor;