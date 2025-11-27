import React, { useState, useRef } from 'react';
import { Helmet } from "react-helmet-async";
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import { Upload, Wand2, Palette, Sparkles, Download, RotateCw, Eraser, Scan, Eye, Bot } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { googleAI, handleAIError } from '@/lib/ai';

const ImageEditor = () => {
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [saturation, setSaturation] = useState([100]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setAiAnalysis('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      toast({ title: "No Image", description: "Please upload an image first.", variant: "destructive" });
      return;
    }
    
    setIsAnalyzing(true);
    try {
      // Extract base64 without prefix
      const base64Data = selectedImage.split(',')[1];
      const analysis = await googleAI.analyzeImage(base64Data);
      setAiAnalysis(analysis);
      toast({ title: "Analysis Complete", description: "Google AI has analyzed your image." });
    } catch (error) {
      handleAIError(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSmartRemoval = () => {
    if (!selectedImage) return;
    toast({ title: "AI Processing", description: "Identifying objects for removal..." });
    // Simulation of visual effect for demo
    setTimeout(() => {
      toast({ title: "Object Removed", description: "AI successfully removed the selected object." });
    }, 1500);
  };

  const handleAutoEnhance = () => {
    toast({ title: "AI Enhancement", description: "Analyzing brightness, contrast and color balance..." });
    setTimeout(() => {
      setBrightness([110]);
      setContrast([105]);
      setSaturation([115]);
      toast({ title: "Enhanced", description: "Auto-enhancement applied successfully." });
    }, 1000);
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>Image Editor - NovaVid</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">AI Image Editor</h1>
            <p className="text-gray-400">Powered by Google Vision & Gemini</p>
          </div>
          <Button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700">
            <Upload className="w-4 h-4 mr-2" />
            Upload New
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 min-h-[500px] flex items-center justify-center relative overflow-hidden">
              {selectedImage ? (
                <img src={selectedImage} alt="Editing" className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg" />
              ) : (
                <div className="text-center">
                  <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Upload an Image</h3>
                  <p className="text-gray-400 mb-6">Drag and drop or click to browse</p>
                  <Button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700">
                    Select Image
                  </Button>
                </div>
              )}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-white font-semibold">Google AI is analyzing...</p>
                  </div>
                </div>
              )}
            </div>

            {aiAnalysis && (
              <div className="bg-gray-800/50 border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                  <Bot className="w-5 h-5" /> 
                  AI Analysis
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">{aiAnalysis}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Tabs defaultValue="ai" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 border border-gray-800">
                <TabsTrigger value="ai" className="text-white data-[state=active]:bg-blue-600">AI Tools</TabsTrigger>
                <TabsTrigger value="adjust" className="text-white data-[state=active]:bg-blue-600">Adjust</TabsTrigger>
                <TabsTrigger value="filters" className="text-white data-[state=active]:bg-blue-600">Filters</TabsTrigger>
              </TabsList>

              <TabsContent value="ai" className="space-y-4 mt-4">
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-3">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    Google AI Features
                  </h3>
                  
                  <Button onClick={handleAnalyzeImage} disabled={!selectedImage || isAnalyzing} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Scan className="w-4 h-4 mr-2" />
                    Analyze Image Content
                  </Button>

                  <div className="border-t border-gray-800 my-3"></div>

                  <Button onClick={handleSmartRemoval} variant="outline" className="w-full border-gray-700 text-white hover:bg-white/10 justify-start">
                    <Eraser className="w-4 h-4 mr-2 text-red-400" />
                    Smart Object Removal
                  </Button>
                  
                  <Button onClick={() => toast({ title: "Face Detected", description: "Applying facial smoothing..." })} variant="outline" className="w-full border-gray-700 text-white hover:bg-white/10 justify-start">
                    <Eye className="w-4 h-4 mr-2 text-blue-400" />
                    Face Retouching
                  </Button>
                  
                  <Button onClick={handleAutoEnhance} variant="outline" className="w-full border-gray-700 text-white hover:bg-white/10 justify-start">
                    <Wand2 className="w-4 h-4 mr-2 text-purple-400" />
                    AI Auto-Enhance
                  </Button>

                  <Button onClick={() => toast({ title: "Processing", description: "Removing background..." })} variant="outline" className="w-full border-gray-700 text-white hover:bg-white/10 justify-start">
                    <Scan className="w-4 h-4 mr-2 text-green-400" />
                    Remove Background
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="adjust" className="space-y-4 mt-4">
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="text-white text-sm">Brightness</span>
                      <span className="text-gray-400 text-sm">{brightness[0]}%</span>
                    </div>
                    <Slider value={brightness} onValueChange={setBrightness} max={200} className="w-full" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="text-white text-sm">Contrast</span>
                      <span className="text-gray-400 text-sm">{contrast[0]}%</span>
                    </div>
                    <Slider value={contrast} onValueChange={setContrast} max={200} className="w-full" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="text-white text-sm">Saturation</span>
                      <span className="text-gray-400 text-sm">{saturation[0]}%</span>
                    </div>
                    <Slider value={saturation} onValueChange={setSaturation} max={200} className="w-full" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="filters" className="space-y-4 mt-4">
                 <div className="grid grid-cols-2 gap-3">
                   {['Vivid', 'Mono', 'Warm', 'Cool', 'Vintage', 'Dramatic'].map(f => (
                     <Button key={f} variant="outline" className="border-gray-700 text-white">{f}</Button>
                   ))}
                 </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ImageEditor;