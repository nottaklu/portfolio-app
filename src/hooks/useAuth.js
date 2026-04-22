import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// SHA-256 hash for MPIN
async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + '_portfolio_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Auth state machine:
 * 'loading' → checking session
 * 'login'   → no session, show login
 * 'set-mpin'→ logged in, no MPIN set yet
 * 'mpin'    → logged in, MPIN set, need to verify
 * 'ready'   → authenticated + MPIN verified
 */
export function useAuth() {
  const [authState, setAuthState] = useState('loading');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Check existing session on mount ──
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const prof = await fetchProfile(session.user.id);
          setProfile(prof);
          // Has MPIN? → ask for it. No MPIN? → set one.
          setAuthState(prof?.mpin_hash ? 'mpin' : 'set-mpin');
        } else {
          setAuthState('login');
        }
      } catch (err) {
        console.error('Session check failed:', err);
        setAuthState('login');
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setAuthState('login');
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  // ── Fetch profile ──
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
    return data;
  };

  // ── Login (username + password) ──
  const login = useCallback(async (username, password, displayName) => {
    setLoading(true);
    setError('');

    const email = `${username}@portfolio.app`;

    try {
      if (displayName) {
        // Sign up
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpErr) throw signUpErr;

        const userId = data.user?.id;
        if (!userId) throw new Error('Signup failed — no user returned');

        // Create profile
        const { error: profErr } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            username: username.toLowerCase(),
            display_name: displayName,
          });
        if (profErr) throw profErr;

        setUser(data.user);
        const prof = { id: userId, username, display_name: displayName, mpin_hash: null };
        setProfile(prof);
        setAuthState('set-mpin');
      } else {
        // Sign in
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInErr) {
          if (signInErr.message.includes('Invalid login')) {
            throw new Error('Wrong username or password');
          }
          throw signInErr;
        }

        setUser(data.user);
        const prof = await fetchProfile(data.user.id);
        setProfile(prof);
        setAuthState(prof?.mpin_hash ? 'mpin' : 'set-mpin');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Set MPIN (first time) ──
  const setMpin = useCallback(async (pin) => {
    setLoading(true);
    setError('');

    try {
      const hash = await hashPin(pin);
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ mpin_hash: hash })
        .eq('id', user.id);

      if (updateErr) throw updateErr;

      setProfile((prev) => ({ ...prev, mpin_hash: hash }));
      setAuthState('ready');
    } catch (err) {
      setError(err.message || 'Failed to set MPIN');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── Verify MPIN ──
  const verifyMpin = useCallback(async (pin) => {
    setLoading(true);
    setError('');

    try {
      const hash = await hashPin(pin);
      if (hash === profile?.mpin_hash) {
        setAuthState('ready');
      } else {
        setError('Wrong MPIN');
      }
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // ── Logout ──
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setAuthState('login');
    setError('');
  }, []);

  return {
    authState,
    user,
    profile,
    loading,
    error,
    login,
    setMpin,
    verifyMpin,
    logout,
  };
}
