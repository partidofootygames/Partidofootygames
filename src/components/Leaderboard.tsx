import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal } from 'lucide-react';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  
  useEffect(() => {
    // We listen to the top 50 players sorted by XP descending.
    // Note: This requires a composite index if combining order and filters, but here it's simple orderBy.
    const q = query(collection(db, 'leaderboard'), orderBy('xp', 'desc'), limit(50));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeaders(docs);
      
      if (auth.currentUser) {
          const index = docs.findIndex(d => d.id === auth.currentUser!.uid);
          setCurrentUserRank(index !== -1 ? index + 1 : null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Leaderboard error:", error);
      // Fallback or handle missing index error
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getRankStyle = (index: number) => {
      if (index === 0) return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      if (index === 1) return "text-slate-300 bg-slate-300/10 border-slate-300/20";
      if (index === 2) return "text-amber-600 bg-amber-600/10 border-amber-600/20";
      return "text-slate-500 bg-white/5 border-white/5";
  };

  return (
    <div className="min-h-screen bg-[#050b15] text-white font-sans flex flex-col items-center py-12 px-4 relative overflow-hidden">
      
      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 font-bold mb-8 hover:text-emerald-500 transition-colors cursor-pointer uppercase text-xs tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Hub
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full text-yellow-500 text-[10px] font-bold uppercase tracking-wider mb-4">
            <Trophy className="w-3 h-3" /> Global Ranking
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter mb-2 uppercase">The <span className="text-emerald-500">Leaderboard</span></h1>
          <p className="text-slate-400 font-medium">Earn XP by playing games and climbing the ranks.</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md overflow-hidden shadow-2xl relative">
            {loading ? (
                <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest">Loading ranks...</div>
            ) : (
                <div className="flex flex-col">
                    {leaders.map((leader, idx) => (
                        <div key={leader.id} className={`flex items-center p-4 border-b border-white/5 transition hover:bg-white/5 ${auth.currentUser?.uid === leader.id ? 'bg-emerald-500/10' : ''}`}>
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center font-black text-sm md:text-base border mr-4 shrink-0 ${getRankStyle(idx)}`}>
                                {idx < 3 ? <Medal className="w-4 h-4 md:w-5 md:h-5" /> : idx + 1}
                            </div>
                            
                            {leader.photoURL ? (
                                <img src={leader.photoURL} className="w-10 h-10 rounded-full object-cover mr-4 border border-white/10" alt="Avatar" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-500 font-black mr-4 uppercase border border-emerald-500/30">
                                    {leader.displayName?.charAt(0) || "U"}
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <h3 className="font-black truncate uppercase tracking-tight text-white">{leader.displayName || 'Unknown Player'}</h3>
                            </div>

                            <div className="text-right">
                                <div className="font-black text-emerald-500 text-lg md:text-xl">{leader.xp || 0}</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">XP</div>
                            </div>
                        </div>
                    ))}
                    
                    {leaders.length === 0 && (
                        <div className="p-12 text-center text-slate-400">
                            Be the first to get some XP!
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* STICKY BOTTOM CURRENT USER (if not in top) */}
        {!loading && auth.currentUser && currentUserRank === null && (
            <div className="sticky bottom-4 mt-8 bg-black/80 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center z-20">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm border border-slate-700 bg-slate-800 text-slate-400 mr-4">
                    --
                </div>
                
                {auth.currentUser.photoURL ? (
                    <img src={auth.currentUser.photoURL} className="w-10 h-10 rounded-full object-cover mr-4" alt="Avatar" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-500 font-black mr-4 uppercase">
                        {auth.currentUser.displayName?.charAt(0) || "U"}
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <h3 className="font-black truncate uppercase tracking-tight text-emerald-400">{auth.currentUser.displayName || 'You'}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Keep playing to rank up</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
