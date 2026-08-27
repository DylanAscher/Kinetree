import React, { createContext, useContext, useState } from 'react';

const USER_KEY = 'iterarbor_local_user';
const PROFILE_KEY = 'iterarbor_local_profile';

const readValue = (key) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

const writeValue = (key, value) => {
  if (value === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readValue(USER_KEY));
  const [profile, setProfile] = useState(() => readValue(PROFILE_KEY));

  const createLocalUser = (email) => {
    const localUser = {
      id: `local-${btoa(email).replace(/=/g, '')}`,
      email,
    };
    const localProfile = {
      username: email.split('@')[0],
      full_name: '',
      tier: 'Free',
      xp: 0,
      avatar_url: '',
    };
    setUser(localUser);
    setProfile(localProfile);
    writeValue(USER_KEY, localUser);
    writeValue(PROFILE_KEY, localProfile);
  };

  const login = async (email) => {
    createLocalUser(email);
    return { error: null };
  };

  const logout = async () => {
    setUser(null);
    setProfile(null);
    writeValue(USER_KEY, null);
    writeValue(PROFILE_KEY, null);
    return { error: null };
  };

  const updateProfile = async (updates) => {
    const nextProfile = { ...profile, ...updates };
    setProfile(nextProfile);
    writeValue(PROFILE_KEY, nextProfile);
    return { data: nextProfile, error: null };
  };

  const updateAuth = async (attributes) => {
    if (!user) return { error: new Error('No local user is signed in.') };
    const nextUser = { ...user, ...attributes };
    setUser(nextUser);
    writeValue(USER_KEY, nextUser);
    return { data: { user: nextUser }, error: null };
  };

  const addXP = async (amount) => {
    if (!user || !profile) return;
    await updateProfile({ xp: (profile.xp || 0) + amount });
  };

  return (
    <AuthContext.Provider value={{ user, profile, setProfile, addXP, updateProfile, updateAuth, login, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
