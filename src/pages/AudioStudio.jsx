import React, { useState } from 'react';
import { Helmet } from "react-helmet-async";
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play, Download, Mic, Wand2, Music } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { openai } from '@/lib/ai';

const AudioStudio = () => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('alloy');
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Voces disponibles en OpenAI
  const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      toast({ title: "Error", description: "Please enter text to generate speech.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      if (!openai) throw new Error("AI not connected");

      const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice,
        input: text,
      });

      // Convertir respuesta a Blob reproducible
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedAudioUrl(url);
      
      toast({ title: "Success", description: "Audio generated successfully!" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to generate audio.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <Helmet><title>Audio Studio - NovaVid</title></Helmet>
      
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">AI Voice Studio</h1>
          <div className="flex gap-2">
            <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm border border-blue-600/50">
              TTS Engine: OpenAI v1
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Panel de Entrada */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
            <label className="text-white font-semibold flex items-center gap-2">
              <Mic className="w-4 h-4" /> Text to Speech
            </label>
            <Textarea 
              placeholder="Enter your script here..." 
              className="h-40 bg-gray-950 border-gray-700 text-white"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            
            <div className="space-y-2">
              <label className="text-gray-400 text-sm">Select Voice Persona</label>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  {voices.map(v => (
                    <SelectItem key={v} value={v} className="capitalize hover:bg-gray-700">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerateSpeech} 
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? <Wand2 className="w-4 h-4 animate-spin mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
              {isGenerating ? "Synthesizing..." : "Generate Voice"}
            </Button>
          </div>

          {/* Panel de Resultados */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center space-y-6">
            {generatedAudioUrl ? (
              <>
                <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
                   <Music className="w-10 h-10 text-green-400" />
                </div>
                <audio controls src={generatedAudioUrl} className="w-full" />
                <Button variant="outline" className="w-full border-gray-700 text-white" onClick={() => {
                   const a = document.createElement('a');
                   a.href = generatedAudioUrl;
                   a.download = `voice-${voice}.mp3`;
                   a.click();
                }}>
                  <Download className="w-4 h-4 mr-2" /> Download MP3
                </Button>
              </>
            ) : (
              <div className="text-center text-gray-500">
                <Music className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Generated audio will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AudioStudio;