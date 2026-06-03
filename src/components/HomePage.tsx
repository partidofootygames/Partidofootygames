import React, { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { doc, setDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { 
  Trophy, 
  Flame, 
  Users, 
  Clock, 
  Target, 
  Puzzle, 
  LayoutGrid, 
  ChevronRight,
  Globe
} from "lucide-react";

import AdBanner from "./AdBanner";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [onlineCount, setOnlineCount] = useState(1);
  const navigate = useNavigate();

  // Check of de gebruiker is ingelogd
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Timer Effect
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diff = tomorrow.getTime() - now.getTime();
      
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      
      setTimeLeft(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Presence Effect (Self)
  useEffect(() => {
    const sessionId = Math.random().toString(36).substring(2, 15);
    const presenceRef = doc(db, 'presence', sessionId);

    const updatePresence = async () => {
      try {
        await setDoc(presenceRef, { lastActive: Date.now() });
      } catch (e) {
        console.error("Presence error", e);
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 30000); // 30s heartbeat

    const cleanup = () => {
      deleteDoc(presenceRef).catch(() => {});
    };
    window.addEventListener('beforeunload', cleanup);

    return () => {
      clearInterval(interval);
      cleanup();
      window.removeEventListener('beforeunload', cleanup);
    };
  }, []);

  // Presence Counter
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const threshold = Date.now() - 60000;
        const q = query(collection(db, 'presence'), where('lastActive', '>', threshold));
        const snapshot = await getDocs(q);
        setOnlineCount(Math.max(1, snapshot.size));
      } catch (e) {
        console.error("Count error", e);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#050b15] text-white font-sans">
      {/* --- NAVBAR --- */}
      <nav className="border-b border-white/10 bg-[#050b15]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
               <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-bold text-black">P</div>
               <span className="font-black tracking-tighter text-xl">PARTIDO</span>
            </Link>
            <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
              <Link to="/" className="text-white">Home</Link>
              <Link to="#" className="hover:text-white transition">Bingo</Link>
              <Link to="#" className="hover:text-white transition">Tenaball</Link>
              <Link to="#" className="hover:text-white transition">Missing 11</Link>
              <Link to="#" className="hover:text-white transition">Leaderboard</Link>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button className="p-2 hover:bg-white/5 rounded-lg border border-white/10 flex items-center gap-2 uppercase font-bold cursor-pointer">
              <Globe className="w-4 h-4" /> EN
            </button>
            {user ? (
               <Link to="/profile" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition cursor-pointer">
                 {user.photoURL ? (
                    <img src={user.photoURL} className="w-6 h-6 rounded-full" alt="Profile" />
                 ) : (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-black">
                       {user.displayName?.charAt(0) || "U"}
                    </div>
                 )}
                 Profiel
               </Link>
            ) : (
               <button onClick={() => navigate("/login")} className="bg-white hover:bg-slate-200 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition cursor-pointer">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                  Inloggen
               </button>
            )}
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-bold text-orange-500">0</span>
              <span className="text-slate-400 uppercase text-[10px]">streak</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* --- HERO SECTION --- */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
            <Trophy className="w-3 h-3" /> Daily Football Mini-Games
          </div>
          <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter">
            PLAY. <span className="text-white font-black">SHARE.</span> <span className="text-emerald-500">DOMINATE.</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">
            The daily home of football trivia. Build your streak, climb the leaderboard, and bully your group chat with the share button.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <button className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-full font-black flex items-center gap-2 transition transform hover:scale-105 cursor-pointer">
              Play today's Bingo <ChevronRight className="w-5 h-5" />
            </button>
            <button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-4 rounded-full font-black flex items-center gap-2 transition cursor-pointer">
              <Trophy className="w-5 h-5 text-yellow-500" /> Leaderboard
            </button>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <StatCard icon={<Clock className="text-yellow-500 w-4 h-4"/>} label="Resets In" value={timeLeft} />
          <StatCard icon={<Users className="text-emerald-500 w-4 h-4"/>} label="Online Now" value={onlineCount.toString()} isLive />
          <StatCard icon={<Flame className="text-orange-500 w-4 h-4"/>} label="Your Streak" value="0" />
        </div>

        {/* --- AD BANNER --- */}
        <AdBanner dataAdSlot="1234567891" />

        {/* --- WORLD CUP BANNER --- */}
        <div className="bg-gradient-to-r from-blue-900/40 to-emerald-900/40 border border-yellow-500/30 rounded-3xl p-8 mb-12 flex items-center justify-between relative overflow-hidden">
           <div className="flex items-center gap-8 relative z-10">
              <img src="https://upload.wikimedia.org/wikipedia/en/e/e3/2026_FIFA_World_Cup_logo.svg" className="h-20 opacity-80 filter brightness-0 invert" alt="WC2026" />
              <div>
                <div className="bg-yellow-500 text-black px-2 py-0.5 rounded text-[10px] font-black inline-block mb-2">FIFA WORLD CUP 2026</div>
                <h2 className="text-3xl font-black italic">KICK-OFF <span className="text-white/50">COUNTDOWN</span></h2>
                <div className="flex gap-4 mt-4">
                  <TimeBox unit="Days" value="08" />
                  <TimeBox unit="Hours" value="06" />
                  <TimeBox unit="Min" value="24" />
                  <TimeBox unit="Sec" value="12" />
                </div>
              </div>
           </div>
           <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-2xl text-center z-10">
              <div className="text-yellow-500 font-black text-sm mb-2">PREDICT</div>
              <div className="text-[10px] text-white/60 mb-4 uppercase font-bold">Group Stage</div>
              <button className="bg-yellow-500 hover:bg-yellow-400 transition-colors text-black px-4 py-2 rounded font-black text-xs cursor-pointer">Play Now</button>
           </div>
        </div>

        {/* --- PROGRESS BAR --- */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-black text-xl">1</div>
            <div className="flex-1">
              <div className="flex justify-between items-end mb-1">
                <span className="font-black text-lg uppercase tracking-tight">Newbie</span>
                <span className="text-slate-400 text-xs font-bold uppercase">0 XP</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="w-0 h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">0 badges unlocked · Play any game to earn XP</p>
            </div>
          </div>
        </div>

        {/* --- GAME GRID --- */}
        <div className="space-y-8">
          <div className="flex justify-between items-end">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Pick Your Game</h2>
            <div className="text-emerald-500 text-xs font-bold flex items-center gap-2">TRENDING TODAY <Flame className="w-4 h-4"/></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <GameCard 
              title="Football Bingo" 
              desc="Match daily players to 16 squares. One card. Same for everyone."
              icon={<Target className="w-8 h-8 text-rose-500" />}
              tag="DAILY"
              color="border-rose-500/20"
            />
            <GameCard 
              title="Tenaball" 
              desc="Name the Top 10. A ranked football trivia puzzle — 3 lives, 2 hints."
              icon={<LayoutGrid className="w-8 h-8 text-blue-500" />}
              tag="DAILY"
              color="border-blue-500/20"
            />
            <GameCard 
              title="Missing 11" 
              desc="Iconic line-ups, missing players. Guess the squad."
              icon={<Puzzle className="w-8 h-8 text-lime-500" />}
              tag="PUZZLE"
              color="border-lime-500/20"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ icon, label, value, isLive = false }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center space-y-1">
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {icon} {label}
      </div>
      <div className="text-xl font-black flex items-center gap-2">
        {isLive && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>}
        {value}
      </div>
    </div>
  );
}

function TimeBox({ unit, value }: any) {
  return (
    <div className="text-center">
      <div className="bg-white/10 w-12 h-12 rounded flex items-center justify-center text-xl font-black mb-1">{value}</div>
      <div className="text-[10px] text-slate-500 font-bold uppercase">{unit}</div>
    </div>
  );
}

function GameCard({ title, desc, icon, tag, color }: any) {
  return (
    <div className={`bg-white/5 border ${color} p-6 rounded-3xl hover:bg-white/10 transition group cursor-pointer`}>
      <div className="flex justify-between items-start mb-6">
        <div className="bg-white/10 p-3 rounded-2xl group-hover:scale-110 transition transition-transform">
          {icon}
        </div>
        <div className="bg-yellow-500 text-black px-2 py-0.5 rounded text-[10px] font-black uppercase">
          {tag}
        </div>
      </div>
      <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tight group-hover:text-emerald-500 transition">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed mb-6">{desc}</p>
    </div>
  );
}
