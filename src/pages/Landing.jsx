import React from 'react';
import { Helmet } from "react-helmet-async";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Video, Image, Music, Wand2, Cloud, Zap } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950">
      <Helmet>
        <title>NovaVid - Professional Multimedia Editing Platform</title>
        <meta name="description" content="Create stunning videos, edit images, and generate AI-powered audio with NovaVid's comprehensive multimedia editing suite." />
      </Helmet>

      <nav className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-white">NovaVid</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/pricing">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Pricing
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-6xl font-bold text-white mb-6">
            Create Stunning Content with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> AI-Powered Tools</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Professional multimedia editing suite with advanced AI features. Edit videos, images, and audio all in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8">
                Start 5-Day Free Trial
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-white/10 text-lg px-8">
                View Pricing
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20"
        >
          <img className="w-full rounded-2xl shadow-2xl border border-gray-800" alt="NovaVid Dashboard Preview" src="https://images.unsplash.com/photo-1696389500310-cd6d247cb609" />
        </motion.div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white text-center mb-12">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-8 hover:border-blue-500/50 transition-all">
              <Video className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Video Creation</h3>
              <p className="text-gray-400">Create professional videos from images with transitions, effects, and customizable durations.</p>
            </div>
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-8 hover:border-blue-500/50 transition-all">
              <Image className="w-12 h-12 text-cyan-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Image Editing</h3>
              <p className="text-gray-400">Advanced filters, effects, color correction, and AI-powered object removal tools.</p>
            </div>
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-8 hover:border-blue-500/50 transition-all">
              <Music className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Audio Studio</h3>
              <p className="text-gray-400">Generate AI voices, access royalty-free music, and upload your own audio tracks.</p>
            </div>
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-8 hover:border-blue-500/50 transition-all">
              <Wand2 className="w-12 h-12 text-pink-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">AI Assistant</h3>
              <p className="text-gray-400">Get intelligent editing suggestions and automate complex tasks with AI.</p>
            </div>
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-8 hover:border-blue-500/50 transition-all">
              <Cloud className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Cloud Storage</h3>
              <p className="text-gray-400">Store projects safely in the cloud with full edit history and version control.</p>
            </div>
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-8 hover:border-blue-500/50 transition-all">
              <Zap className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Advanced Editing</h3>
              <p className="text-gray-400">Separate tracks, adjust speed, reverse videos, and apply professional effects.</p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-cyan-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Create?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of creators using NovaVid to produce professional content. Start your 5-day free trial today!
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-950 border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2025 NovaVid. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;