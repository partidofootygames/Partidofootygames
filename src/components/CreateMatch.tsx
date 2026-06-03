import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Users, Trophy } from 'lucide-react';

export default function CreateMatch() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: '5 vs 5',
    date: '',
    startTime: '',
    venue: '',
    maxPlayers: 10,
    pricePerPlayer: 0,
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'matches'), {
        title: formData.title,
        type: formData.type,
        date: formData.date,
        startTime: formData.startTime,
        venue: { name: formData.venue },
        maxPlayers: Number(formData.maxPlayers),
        pricePerPlayer: Number(formData.pricePerPlayer),
        description: formData.description,
        organizerId: auth.currentUser.uid,
        organizerName: auth.currentUser.displayName,
        players: [auth.currentUser.uid], // Organizer joins by default
        createdAt: serverTimestamp(),
        status: 'open'
      });
      navigate('/');
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Er is een fout opgetreden bij het aanmaken van de wedstrijd.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Terug naar Dashboard
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-inner shrink-0">
              <Trophy className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Nieuwe Wedstrijd</h1>
              <p className="text-slate-500 font-medium">Organiseer een potje voetbal en nodig spelers uit.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Titel van de Wedstrijd</label>
              <input
                required
                type="text"
                name="title"
                placeholder="bijv. Vrijdagmiddag Potje"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Locatie</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    required
                    type="text"
                    name="venue"
                    placeholder="Stadion / Veldnaam"
                    value={formData.venue}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Type Spel</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium appearance-none cursor-pointer"
                >
                  <option value="5 vs 5">5 vs 5</option>
                  <option value="7 vs 7">7 vs 7</option>
                  <option value="11 vs 11">11 vs 11</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Datum</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    required
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Tijd</label>
                <input
                  required
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Max. Spelers</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    required
                    type="number"
                    name="maxPlayers"
                    min="2"
                    max="22"
                    value={formData.maxPlayers}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Prijs per Speler (€)</label>
                <input
                  required
                  type="number"
                  name="pricePerPlayer"
                  min="0"
                  step="0.5"
                  value={formData.pricePerPlayer}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Beschrijving / Extra Info</label>
              <textarea
                name="description"
                placeholder="bijv. Kunstgras, neem een hesje mee..."
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest py-4 px-6 rounded-2xl transition-all hover:-translate-y-1 cursor-pointer disabled:opacity-70 shadow-lg shadow-emerald-200 mt-4"
            >
              {loading ? 'Aanmaken...' : 'Wedstrijd Aanmaken'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
