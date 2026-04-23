import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!error) setProfile(data);
  };

  // Helper to update the public profile (username, full_name, etc.)
  const updateProfile = async (updates) => {
    if (!user) return { error: 'Not logged in' };
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (!error) setProfile(data);
    return { data, error };
  };

  // Helper to update Auth credentials (email, password)
  const updateAuth = async (attributes) => {
    return await supabase.auth.updateUser(attributes);
  };

  const addXP = async (amount) => {
    if (!user || !profile) return;
    const newXP = (profile.xp || 0) + amount;
    setProfile({ ...profile, xp: newXP }); 
    await supabase.from('profiles').update({ xp: newXP }).eq('id', user.id);
  };

  const login = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const logout = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, profile, setProfile, addXP, updateProfile, updateAuth, login, logout, loading, supabase }}>
      {!supabase ? (
        <div style={{ background: '#000', color: '#ff4444', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', textAlign: 'center' }}>
          <div>
            <h1>ERROR: ENV_KEYS_NOT_FOUND</h1>
            <p>Vite is unable to read your .env file.</p>
          </div>
        </div>
      ) : !loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);