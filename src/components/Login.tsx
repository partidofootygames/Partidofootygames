import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUserData = async (user: any, displayName: string) => {
    const userDoc = doc(db, 'users', user.uid);
    const snap = await getDoc(userDoc);
    
    if (!snap.exists()) {
      await setDoc(userDoc, {
        uid: user.uid,
        displayName: displayName || "New Player",
        photoURL: user.photoURL || "",
        bio: "",
        position: "Unassigned",
        stats: {
          level: 1,
          matchesPlayed: 0,
          goals: 0,
          mvpCount: 0,
          reliabilityScore: 100
        }
      });
    }

    const lbDoc = doc(db, 'leaderboard', user.uid);
    const lbSnap = await getDoc(lbDoc);
    if (!lbSnap.exists()) {
        await setDoc(lbDoc, {
            xp: 0,
            displayName: displayName || "New Player",
            photoURL: user.photoURL || ""
        });
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await createUserData(result.user, result.user.displayName || "New Player");
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setError('Login cancelled. Please try again.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-in is not enabled. Please enable it in the Firebase Console > Authentication > Sign-in method.');
      } else {
        setError(err.message || 'Failed to login with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* OVERLAY */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => navigate('/')}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
      />
      
      {/* MODAL */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-sm bg-[#050b15] border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col items-center z-10 max-h-[90vh] overflow-y-auto"
      >
        <img src="https://i.ibb.co/TDLxT8V8/Adobe-Express-file.png" alt="Partido Logo" className="h-24 md:h-32 mb-6 shrink-0 object-contain drop-shadow-2xl" />
        
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">
          Join Us
        </h2>
        <p className="text-slate-400 text-xs text-center mb-6 font-medium">
          Log in to track your stats and climb the leaderboard.
        </p>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-500 text-xs px-3 py-2 rounded-lg font-bold w-full text-center">
            {error}
          </div>
        )}

        <button 
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white hover:bg-slate-200 text-black transition-colors py-3 md:py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
          {loading ? 'Processing...' : 'Continue with Google'}
        </button>

        <div className="mt-6 flex flex-col items-center gap-4 w-full">
            <button 
            type="button"
            onClick={() => navigate('/')}
            className="text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer border-b border-transparent hover:border-white"
            >
            Doorgaan zonder inloggen
            </button>
        </div>
      </motion.div>
    </div>
  );
}
