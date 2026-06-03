import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Trophy, Shield, Zap } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = doc(db, 'users', user.uid);
      const snap = await getDoc(userDoc);
      
      if (!snap.exists()) {
        await setDoc(userDoc, {
          uid: user.uid,
          displayName: user.displayName || "New Player",
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
      navigate('/profile');
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-10 text-center">
        
        <div className="flex justify-center gap-4 mb-8">
           <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-inner">
              <Trophy className="w-7 h-7 text-emerald-600" />
           </div>
           <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center shadow-inner">
              <Zap className="w-7 h-7 text-amber-500" />
           </div>
           <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center shadow-inner">
              <Shield className="w-7 h-7 text-slate-500" />
           </div>
        </div>

        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-3">
          Athlete Hub
        </h1>
        <p className="text-slate-500 mb-10 font-medium">
          Sign in to manage your stats and connect with your team.
        </p>
        
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest py-4 px-6 rounded-2xl transition-all hover:scale-105 cursor-pointer disabled:opacity-70 disabled:hover:scale-100 shadow-md shadow-emerald-200"
        >
           {loading ? 'Authenticating...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
}
