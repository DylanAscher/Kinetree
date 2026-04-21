import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. PULL VARIABLES
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. TELEMETRY CHECK (Open your Browser Console to see this)
console.log("--- KINETREE SUPABASE TELEMETRY ---");
console.log("URL FOUND:", supabaseUrl || "❌ MISSING (UNDEFINED)");
console.log("KEY FOUND:", supabaseAnonKey ? "✅ EXISTS" : "❌ MISSING");

// 3. DEFUSE THE CRASH
// We only initialize if the variables exist. If not, we create a 'null' client 
// so the app doesn't explode, then we show an error message in the UI later.
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

  const login = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const logout = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, profile, login, logout, loading, supabase }}>
      {!supabase ? (
        <div style={{ background: '#000', color: '#ff4444', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', textAlign: 'center' }}>
          <div>
            <h1>ERROR: ENV_KEYS_NOT_FOUND</h1>
            <p>Vite is unable to read your .env file.</p>
            <p style={{ color: '#555' }}>Check console for telemetry logs.</p>
          </div>
        </div>
      ) : !loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);