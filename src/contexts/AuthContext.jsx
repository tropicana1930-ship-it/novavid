import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      if (data) {
        setUser({ ...data, email: authUser.email });
      } else {
        // Handle case where profile might not exist yet (rare edge case in race conditions)
        setUser({ 
          id: authUser.id, 
          email: authUser.email,
          name: authUser.user_metadata?.full_name || 'User',
          plan: 'free',
          credits: 0
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Profile fetch is handled by onAuthStateChange
      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });
      
      return { success: true };
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      // 1. Sign up in Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Registration failed');

      // 2. Create profile in public.users
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 5);

      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: email,
          name: name,
          plan: 'free',
          credits: 100,
          trial_ends_at: trialEndsAt.toISOString()
        }]);

      if (profileError) throw profileError;

      toast({
        title: "Welcome to NovaVid!",
        description: "Your account has been created. Enjoy 100 free credits!",
      });

      return { success: true };
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateUserPlan = async (plan) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ plan })
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => ({ ...prev, plan }));
      
      toast({
        title: "Plan Updated",
        description: `You are now on the ${plan} plan.`,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const useCredits = async (amount) => {
    if (!user || user.credits < amount) return false;

    try {
      const newCredits = user.credits - amount;
      const { error } = await supabase
        .from('users')
        .update({ credits: newCredits })
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => ({ ...prev, credits: newCredits }));
      return true;
    } catch (error) {
      console.error('Error using credits:', error);
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUserPlan,
    useCredits
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};