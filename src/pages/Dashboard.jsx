import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Video, Image, Music, Plus, Clock, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(6);
        
        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        // Only show toast if it's not a simple "no data" case
        if (error.code !== 'PGRST116') {
           toast({
             title: "Connection Issue",
             description: "Could not load projects. Please check your connection.",
             variant: "destructive"
           });
        }
      } finally {
        setLoadingProjects(false);
      }
    };

    if (user) {
      fetchProjects();
    }
  }, [user]);

  const getTrialDaysLeft = () => {
    if (!user.trial_ends_at) return 0;
    const trialEnd = new Date(user.trial_ends_at);
    const now = new Date();
    const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  const planFeatures = {
    free: { videoLength: 8, storage: '1GB', musicTracks: 10, uploadMusic: false },
    premium: { videoLength: 13, storage: '10GB', musicTracks: 100, uploadMusic: true },
    pro: { videoLength: 18, storage: 'Unlimited', musicTracks: 'Unlimited', uploadMusic: true }
  };

  const currentPlan = planFeatures[user.plan] || planFeatures.free;

  return (
    <DashboardLayout>
      <Helmet>
        <title>Dashboard - NovaVid</title>
        <meta name="description" content="Manage your NovaVid projects and access all editing tools from your dashboard." />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name}!</h1>
            <p className="text-gray-400">Ready to create something amazing?</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Credits</div>
            <div className="text-2xl font-bold text-blue-400">{user.credits}</div>
          </div>
        </div>

        {user.plan === 'free' && getTrialDaysLeft() > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-white" />
              <div>
                <div className="text-white font-semibold">Trial Active</div>
                <div className="text-white/90 text-sm">{getTrialDaysLeft()} days left in your free trial</div>
              </div>
            </div>
            <Link to="/pricing">
              <Button className="bg-white text-blue-600 hover:bg-gray-100">
                Upgrade Now
              </Button>
            </Link>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-1">Plan</div>
            <div className="text-white text-xl font-bold capitalize">{user.plan}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-1">Video Length</div>
            <div className="text-white text-xl font-bold">{currentPlan.videoLength}s max</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-1">Storage</div>
            <div className="text-white text-xl font-bold">{currentPlan.storage}</div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/video-creator">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 cursor-pointer shadow-lg hover:shadow-xl transition-all"
              >
                <Video className="w-12 h-12 text-white mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Create Video</h3>
                <p className="text-white/80">Turn images into videos</p>
              </motion.div>
            </Link>

            <Link to="/image-editor">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl p-8 cursor-pointer shadow-lg hover:shadow-xl transition-all"
              >
                <Image className="w-12 h-12 text-white mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Edit Images</h3>
                <p className="text-white/80">Apply filters & effects</p>
              </motion.div>
            </Link>

            <Link to="/audio-studio">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-8 cursor-pointer shadow-lg hover:shadow-xl transition-all"
              >
                <Music className="w-12 h-12 text-white mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Audio Studio</h3>
                <p className="text-white/80">Generate & edit audio</p>
              </motion.div>
            </Link>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Recent Projects</h2>
            <Link to="/projects">
              <Button variant="outline" className="border-gray-700 text-white hover:bg-white/10">
                View All
              </Button>
            </Link>
          </div>

          {loadingProjects ? (
             <div className="flex justify-center py-12">
               <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
             </div>
          ) : projects.length === 0 ? (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
              <Plus className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
              <p className="text-gray-400 mb-6">Start creating your first project</p>
              <Link to="/video-creator">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Create Project
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 cursor-pointer hover:border-blue-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold mb-1">{project.name}</h3>
                      <p className="text-gray-400 text-sm capitalize">{project.type}</p>
                    </div>
                    {project.type === 'video' && <Video className="w-5 h-5 text-blue-400" />}
                    {project.type === 'image' && <Image className="w-5 h-5 text-cyan-400" />}
                    {project.type === 'audio' && <Music className="w-5 h-5 text-purple-400" />}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;