import React, { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { updateProfileImage } from "../lib/userService";
import { 
  Camera, LogOut, 
  Loader2, Settings, Edit3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // 1. Real-time Subscription to User Data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const userDoc = doc(db, "users", currentUser.uid);
        
        try {
            // Ensure standard initialization if user doesn't exist
            const snap = await getDoc(userDoc);
            if (!snap.exists()) {
              await setDoc(userDoc, {
                 uid: currentUser.uid,
                 displayName: currentUser.displayName || "New Player",
                 photoURL: currentUser.photoURL || "",
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
        } catch (initErr) {
            console.error("Initialization error", initErr);
        }

        const unsubDoc = onSnapshot(userDoc, (docSnap) => {
          if (docSnap.exists()) {
            setUser({ uid: currentUser.uid, ...docSnap.data() });
          }
          setLoading(false);
        }, (error) => {
            console.error("Snapshot error", error);
            setLoading(false);
        });
        return () => unsubDoc();
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // 2. Handlers
  const handleSignOut = () => signOut(auth).then(() => navigate("/login"));

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && user) {
      setUploading(true);
      try {
        await updateProfileImage(user.uid, e.target.files[0]);
      } catch (err) {
        alert("Failed to upload image");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleUpdateField = async (field: string, value: string) => {
    if (user) {
        try {
            await updateDoc(doc(db, "users", user.uid), { [field]: value });
        } catch (err) {
            console.error("Failed to update field", err);
            alert("Failed to update profile field: " + err);
        }
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans p-4 md:p-8 flex flex-col overflow-x-hidden">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20v-2a4 4 0 0 0-3-3.87"/><path d="M4 20v-2a4 4 0 0 1 3-3.87"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 hidden sm:block">Athlete Hub <span className="text-emerald-600">Pro</span></h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-full flex items-center gap-2 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:inline-block">Status: Online</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest sm:hidden">Online</span>
          </div>
          <button onClick={handleSignOut} className="p-2 hover:bg-slate-200 rounded-full transition-colors cursor-pointer" title="Log Out">
            <LogOut className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Bento Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-6 gap-6 flex-1 max-w-6xl mx-auto w-full pb-10">
        
        {/* PROFILE CARD (Main Bento Tile) */}
        <div className="md:col-span-5 md:row-span-4 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 z-10">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${isEditing ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'}`}
              title={isEditing ? "Save Profile" : "Edit Profile"}
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative w-32 h-32 mb-6 group cursor-pointer z-0">
            <div className="w-full h-full rounded-[2rem] bg-emerald-100 overflow-hidden border-4 border-white shadow-xl flex items-center justify-center">
              {user?.photoURL ? (
                <img src={user.photoURL} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600/50"><path d="M20 20v-2a4 4 0 0 0-3-3.87"/><path d="M4 20v-2a4 4 0 0 1 3-3.87"/><circle cx="12" cy="7" r="4"/></svg>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-[2rem]">
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                </div>
              )}
            </div>
            {isEditing && (
              <label className="absolute -bottom-2 -right-2 bg-emerald-600 p-2.5 rounded-xl text-white shadow-lg border-2 border-white cursor-pointer hover:bg-emerald-700 transition-colors">
                <Camera className="w-4 h-4" />
                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
            )}
          </div>

          <div className="mt-4 flex-1">
            {isEditing ? (
               <input 
                 className="w-full text-4xl font-black text-slate-900 tracking-tight leading-none mb-2 uppercase border-b-2 border-emerald-500 outline-none pb-1 bg-transparent"
                 defaultValue={user?.displayName}
                 onBlur={(e) => handleUpdateField("displayName", e.target.value)}
                 onKeyDown={(e) => { if(e.key === 'Enter') e.currentTarget.blur(); }}
                 placeholder="Your Name"
               />
            ) : (
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2 uppercase break-words">
                {user?.displayName?.split(' ')?.map((n:string, i:number) => <React.Fragment key={i}>{n}<br/></React.Fragment>) || "NEW PLAYER"}
              </h1>
            )}
            
            {isEditing ? (
              <select 
                className="text-sm font-bold uppercase tracking-widest mb-6 w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-700 cursor-pointer"
                value={user?.position || "Unassigned"}
                onChange={(e) => handleUpdateField("position", e.target.value)}
              >
                <option value="Unassigned">Unassigned</option>
                <option value="Striker">Striker</option>
                <option value="Midfielder">Midfielder</option>
                <option value="Defender">Defender</option>
                <option value="Goalkeeper">Goalkeeper</option>
              </select>
            ) : (
              <p className="text-emerald-600 font-bold uppercase tracking-widest text-sm mb-6">
                {user?.position || "Unassigned"}
              </p>
            )}
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-500 font-medium bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Level {user?.stats?.level || 1} Pro Member</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 font-medium bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                <span>Active Profile</span>
              </div>
            </div>
          </div>
        </div>

        {/* STATS TILES */}
        <div className="md:col-span-3 md:row-span-2 bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm flex flex-col justify-between overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Experience</span>
          </div>
          <div>
            <div className="text-5xl font-black text-slate-900">{user?.stats?.matchesPlayed || 0}</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Matches Played</div>
          </div>
        </div>

        <div className="md:col-span-4 md:row-span-2 bg-emerald-900 text-white border border-emerald-800 rounded-[2.5rem] p-6 shadow-xl flex flex-col justify-between overflow-hidden relative">
           <svg className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 rotate-12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
           <div className="flex justify-between items-start z-10">
            <div className="p-2 bg-white/20 text-white rounded-xl backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            </div>
            <span className="text-[0.65rem] font-bold text-emerald-300 uppercase tracking-widest">Scoring</span>
          </div>
          <div className="z-10">
            <div className="text-5xl font-black">{user?.stats?.goals || 0}</div>
            <div className="text-sm font-bold text-emerald-300 uppercase tracking-wider">Career Goals</div>
          </div>
        </div>

        {/* RELIABILITY CHART TILE */}
        <div className="md:col-span-7 md:row-span-2 bg-white border border-slate-200 rounded-[3rem] p-8 shadow-sm flex flex-col sm:flex-row items-center gap-8">
          <div className="relative w-28 h-28 shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="transparent" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-emerald-500" strokeDasharray={`${user?.stats?.reliabilityScore || 100}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="transparent" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-black text-slate-800">{user?.stats?.reliabilityScore || 100}%</span>
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h4 className="text-xl font-black text-slate-800 mb-1">Reliability Score</h4>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">Consistently attends scheduled matches and performs above average metrics.</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
              <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold uppercase tracking-wide">Reliable</div>
              <div className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-xs font-bold uppercase tracking-wide">Verified</div>
            </div>
          </div>
        </div>

        {/* ABOUT / BIO TILE */}
        <div className="md:col-span-7 md:row-span-2 bg-slate-100 border border-slate-200 rounded-[2.5rem] p-8">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Player Biography</h3>
          {isEditing ? (
             <textarea 
               className="w-full p-4 bg-white border border-slate-200 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-emerald-500 h-32 resize-none text-slate-700 font-medium"
               placeholder="Talk about your playstyle..."
               defaultValue={user?.bio}
               onBlur={(e) => handleUpdateField("bio", e.target.value)}
             />
          ) : (
            <p className="text-lg font-medium text-slate-700 leading-relaxed italic">
              "{user?.bio || "No bio added yet. Tell people how you play!"}"
            </p>
          )}
        </div>

        {/* FOOTER ACTION TILE / MVP */}
        <div className="md:col-span-5 md:row-span-2 bg-emerald-600 rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center shadow-lg shadow-emerald-200 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 text-emerald-500/20 w-48 h-48">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <h3 className="text-white font-black text-2xl mb-1 relative z-10">MVP Awards</h3>
          <div className="text-6xl font-black text-white my-3 relative z-10 drop-shadow-md">
            {user?.stats?.mvpCount || 0}
          </div>
          <p className="text-emerald-100 font-bold text-sm uppercase tracking-widest relative z-10 w-full">Player of the Match</p>
        </div>

      </div>
    </div>
  );
}

