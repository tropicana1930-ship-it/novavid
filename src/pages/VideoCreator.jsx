import React, { useState } from 'react';
import { Helmet } from "react-helmet-async";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Plus, Trash2, Video, Music, Clock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const VideoCreator = () => {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [projectName, setProjectName] = useState('');

  const maxDuration = user?.plan === 'free' ? 8 : user?.plan === 'premium' ? 13 : 18;

  const handleAddImages = () => {
    // Simulating image selection for demonstration
    const newImages = [
      'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
      'https://images.unsplash.com/photo-1682687221038-404670e01d46',
      'https://images.unsplash.com/photo-1682687220063-4742bd7fd538'
    ];
    
    setImages([...images, ...newImages]);
    toast({
      title: "Images Added",
      description: "3 sample images have been added to your project."
    });
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleCreateVideo = () => {
    if (images.length === 0) {
      toast({
        title: "No images",
        description: "Please add images to create a video.",
        variant: "destructive"
      });
      return;
    }

    if (!projectName.trim()) {
      toast({
        title: "Project Name Required",
        description: "Please name your project before creating.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Video Creation Started",
      description: `Creating "${projectName}" with ${images.length} images. This may take a moment...`
    });

    // Simulate processing
    setTimeout(() => {
      toast({
        title: "Success!",
        description: "Video created successfully! (Simulation)",
      });
    }, 2000);
  };

  const transitions = [
    'Fade', 'Slide', 'Zoom', 'Wipe', 'Dissolve', 'Cross Fade'
  ];

  const effects = [
    'Ken Burns', 'Parallax', 'Glitch', 'VHS', 'Film Grain', 'Light Leaks'
  ];

  return (
    <DashboardLayout>
      <Helmet>
        <title>Video Creator - NovaVid</title>
        <meta name="description" content="Create stunning videos from your images with transitions and effects." />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Video Creator</h1>
            <p className="text-gray-400">Turn your images into amazing videos</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl px-6 py-3">
            <div className="text-sm text-gray-400 mb-1">Max Duration</div>
            <div className="text-2xl font-bold text-blue-400 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {maxDuration}s
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <Label htmlFor="projectName" className="text-white mb-2">Project Name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Awesome Video"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Images ({images.length})</h3>
                <Button onClick={handleAddImages} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Images
                </Button>
              </div>

              {images.length === 0 ? (
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center">
                  <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Add Images</h3>
                  <p className="text-gray-400 mb-6">Upload images to create your video</p>
                  <Button onClick={handleAddImages} className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Browse Files
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group aspect-video">
                      <img 
                        src={img} 
                        alt={`Scene ${idx + 1}`} 
                        className="w-full h-full object-cover rounded-lg border border-gray-700"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveImage(idx)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={handleCreateVideo} className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
              <Video className="w-5 h-5 mr-2" />
              Create Video
            </Button>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Transitions</h3>
              <div className="space-y-2">
                {transitions.map((transition) => (
                  <button
                    key={transition}
                    className="w-full text-left px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors hover:text-blue-400"
                  >
                    {transition}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Effects</h3>
              <div className="space-y-2">
                {effects.map((effect) => (
                  <button
                    key={effect}
                    className="w-full text-left px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors hover:text-blue-400"
                  >
                    {effect}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Music className="w-5 h-5" />
                Background Music
              </h3>
              <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-white/10">
                Choose Music
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VideoCreator;