import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Timer, SkipForward } from 'lucide-react';

const PLAYERS = {
  easy: [
    { name: "Lionel Messi", traits: ["Barcelona", "PSG", "Argentina", "Ballon d'Or", "World Cup", "Champions League", "Attacker"] },
    { name: "Cristiano Ronaldo", traits: ["Real Madrid", "Juventus", "Manchester United", "Portugal", "Ballon d'Or", "Champions League", "Premier League", "Serie A", "Attacker"] },
    { name: "Neymar", traits: ["Barcelona", "PSG", "Brazil", "Champions League", "Attacker"] },
    { name: "Kylian Mbappe", traits: ["PSG", "Real Madrid", "France", "World Cup", "Attacker"] },
    { name: "Erling Haaland", traits: ["Borussia Dortmund", "Manchester City", "Norway", "Champions League", "Premier League", "Attacker"] },
    { name: "Kevin De Bruyne", traits: ["Chelsea", "Wolfsburg", "Manchester City", "Belgium", "Champions League", "Premier League", "Midfielder"] },
    { name: "Virgil van Dijk", traits: ["Celtic", "Southampton", "Liverpool", "Netherlands", "Champions League", "Premier League", "Defender"] },
    { name: "Robert Lewandowski", traits: ["Borussia Dortmund", "Bayern Munich", "Barcelona", "Poland", "Champions League", "Attacker"] },
    { name: "Luka Modric", traits: ["Tottenham", "Real Madrid", "Croatia", "Ballon d'Or", "Champions League", "Premier League", "Midfielder"] },
    { name: "Mohamed Salah", traits: ["Chelsea", "Roma", "Liverpool", "Egypt", "Champions League", "Premier League", "Serie A", "Attacker"] },
    { name: "Harry Kane", traits: ["Tottenham", "Bayern Munich", "England", "Premier League", "Attacker"] },
    { name: "Jude Bellingham", traits: ["Borussia Dortmund", "Real Madrid", "England", "Champions League", "Midfielder"] },
    { name: "Vinicius Junior", traits: ["Real Madrid", "Brazil", "Champions League", "Attacker"] },
    { name: "Alisson Becker", traits: ["Roma", "Liverpool", "Brazil", "Champions League", "Premier League", "Serie A", "Goalkeeper"] },
    { name: "Ederson", traits: ["Benfica", "Manchester City", "Brazil", "Champions League", "Premier League", "Goalkeeper"] },
    { name: "Sergio Ramos", traits: ["Sevilla", "Real Madrid", "PSG", "Spain", "World Cup", "Champions League", "Defender"] },
    { name: "Karim Benzema", traits: ["Lyon", "Real Madrid", "France", "Ballon d'Or", "Champions League", "Attacker"] },
    { name: "Toni Kroos", traits: ["Bayer Leverkusen", "Bayern Munich", "Real Madrid", "Germany", "World Cup", "Champions League", "Midfielder"] }
  ],
  medium: [
    { name: "Johan Cruyff", traits: ["Ajax", "Barcelona", "Feyenoord", "Netherlands", "Ballon d'Or", "Champions League", "Attacker"] },
    { name: "Zinedine Zidane", traits: ["Bordeaux", "Juventus", "Real Madrid", "France", "Ballon d'Or", "World Cup", "Champions League", "Serie A", "Midfielder"] },
    { name: "Iker Casillas", traits: ["Real Madrid", "Porto", "Spain", "World Cup", "Champions League", "Goalkeeper"] },
    { name: "Manuel Neuer", traits: ["Schalke 04", "Bayern Munich", "Germany", "World Cup", "Champions League", "Goalkeeper"] },
    { name: "Edwin van der Sar", traits: ["Ajax", "Juventus", "Fulham", "Manchester United", "Netherlands", "Champions League", "Premier League", "Serie A", "Goalkeeper"] },
    { name: "Thierry Henry", traits: ["Monaco", "Juventus", "Arsenal", "Barcelona", "France", "World Cup", "Champions League", "Premier League", "Serie A", "Attacker"] },
    { name: "Ronaldinho", traits: ["Gremio", "PSG", "Barcelona", "AC Milan", "Flamengo", "Brazil", "Ballon d'Or", "World Cup", "Champions League", "Serie A", "Midfielder", "Attacker"] },
    { name: "Arjen Robben", traits: ["PSV", "Chelsea", "Real Madrid", "Bayern Munich", "Netherlands", "Champions League", "Premier League", "Attacker"] },
    { name: "Wesley Sneijder", traits: ["Ajax", "Real Madrid", "Inter Milan", "Galatasaray", "Netherlands", "Champions League", "Serie A", "Midfielder"] },
    { name: "Robin van Persie", traits: ["Feyenoord", "Arsenal", "Manchester United", "Fenerbahce", "Netherlands", "Premier League", "Attacker"] },
    { name: "Xavi", traits: ["Barcelona", "Spain", "World Cup", "Champions League", "Midfielder"] },
    { name: "Andres Iniesta", traits: ["Barcelona", "Vissel Kobe", "Spain", "World Cup", "Champions League", "Midfielder"] },
    { name: "Carles Puyol", traits: ["Barcelona", "Spain", "World Cup", "Champions League", "Defender"] },
    { name: "Dani Alves", traits: ["Sevilla", "Barcelona", "Juventus", "PSG", "Sao Paulo", "Brazil", "Champions League", "Serie A", "Defender"] },
    { name: "Philipp Lahm", traits: ["Stuttgart", "Bayern Munich", "Germany", "World Cup", "Champions League", "Defender"] },
    { name: "Franck Ribery", traits: ["Metz", "Galatasaray", "Marseille", "Bayern Munich", "Fiorentina", "France", "Champions League", "Midfielder"] },
    { name: "Gareth Bale", traits: ["Southampton", "Tottenham", "Real Madrid", "Wales", "Champions League", "Premier League", "Attacker"] },
    { name: "Luis Suarez", traits: ["Nacional", "Groningen", "Ajax", "Liverpool", "Barcelona", "Atletico Madrid", "Uruguay", "Champions League", "Premier League", "Attacker"] },
    { name: "Wayne Rooney", traits: ["Everton", "Manchester United", "DC United", "Derby County", "England", "Champions League", "Premier League", "Attacker"] },
    { name: "Frank Lampard", traits: ["West Ham", "Chelsea", "Manchester City", "England", "Champions League", "Premier League", "Midfielder"] },
    { name: "Steven Gerrard", traits: ["Liverpool", "LA Galaxy", "England", "Champions League", "Premier League", "Midfielder"] }
  ],
  hard: [
    { name: "Dirk Kuyt", traits: ["Utrecht", "Feyenoord", "Liverpool", "Fenerbahce", "Netherlands", "Premier League", "Attacker"] },
    { name: "Klaas-Jan Huntelaar", traits: ["Heerenveen", "Ajax", "Real Madrid", "AC Milan", "Schalke 04", "Netherlands", "Serie A", "Attacker"] },
    { name: "Roy Makaay", traits: ["Vitesse", "Tenerife", "Deportivo La Coruna", "Bayern Munich", "Feyenoord", "Netherlands", "Attacker"] },
    { name: "Rafael van der Vaart", traits: ["Ajax", "Hamburger SV", "Real Madrid", "Tottenham", "Real Betis", "Midtjylland", "Netherlands", "Premier League", "Midfielder"] },
    { name: "Ruud van Nistelrooy", traits: ["Heerenveen", "PSV", "Manchester United", "Real Madrid", "Hamburger SV", "Malaga", "Netherlands", "Premier League", "Attacker"] },
    { name: "Mark van Bommel", traits: ["Fortuna Sittard", "PSV", "Barcelona", "Bayern Munich", "AC Milan", "Netherlands", "Champions League", "Serie A", "Midfielder"] },
    { name: "Clarence Seedorf", traits: ["Ajax", "Sampdoria", "Real Madrid", "Inter Milan", "AC Milan", "Botafogo", "Netherlands", "Champions League", "Serie A", "Midfielder"] },
    { name: "Edgar Davids", traits: ["Ajax", "AC Milan", "Juventus", "Barcelona", "Inter Milan", "Tottenham", "Crystal Palace", "Netherlands", "Champions League", "Premier League", "Serie A", "Midfielder"] },
    { name: "Patrick Kluivert", traits: ["Ajax", "AC Milan", "Barcelona", "Newcastle United", "Valencia", "PSV", "Lille", "Netherlands", "Champions League", "Premier League", "Serie A", "Attacker"] },
    { name: "Frank de Boer", traits: ["Ajax", "Barcelona", "Galatasaray", "Rangers", "Netherlands", "Champions League", "Defender"] },
    { name: "Guti", traits: ["Real Madrid", "Besiktas", "Spain", "Champions League", "Midfielder"] },
    { name: "Juan Roman Riquelme", traits: ["Boca Juniors", "Barcelona", "Villarreal", "Argentinos Juniors", "Argentina", "Midfielder"] },
    { name: "Diego Forlan", traits: ["Independiente", "Manchester United", "Villarreal", "Atletico Madrid", "Inter Milan", "Internacional", "Uruguay", "Premier League", "Serie A", "Attacker"] },
    { name: "Dimitar Berbatov", traits: ["CSKA Sofia", "Bayer Leverkusen", "Tottenham", "Manchester United", "Fulham", "Monaco", "PAOK", "Bulgaria", "Premier League", "Attacker"] },
    { name: "Juninho Pernambucano", traits: ["Sport Recife", "Vasco da Gama", "Lyon", "New York Red Bulls", "Brazil", "Midfielder"] },
    { name: "Jay-Jay Okocha", traits: ["Eintracht Frankfurt", "Fenerbahce", "PSG", "Bolton Wanderers", "Hull City", "Nigeria", "Premier League", "Midfielder"] },
    { name: "Tomas Rosicky", traits: ["Sparta Prague", "Borussia Dortmund", "Arsenal", "Czech Republic", "Premier League", "Midfielder"] },
    { name: "Pablo Aimar", traits: ["River Plate", "Valencia", "Zaragoza", "Benfica", "Johor Darul Ta'zim", "Argentina", "Midfielder"] },
    { name: "Antonio Di Natale", traits: ["Empoli", "Udinese", "Italy", "Serie A", "Attacker"] },
    { name: "Marek Hamsik", traits: ["Slovan Bratislava", "Brescia", "Napoli", "Trabzonspor", "Slovakia", "Serie A", "Midfielder"] },
    { name: "Shunsuke Nakamura", traits: ["Yokohama F. Marinos", "Reggina", "Celtic", "Espanyol", "Jubilo Iwata", "Japan", "Serie A", "Midfielder"] }
  ]
};

const WINNING_LINES = [
  [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], // Rows
  [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15], // Cols
  [0, 5, 10, 15], [3, 6, 9, 12] // Diagonals
];

function getDailySeed() {
  const now = new Date();
  const timeOffset = now.getTime() - (10 * 60 * 60 * 1000);
  const offsetDate = new Date(timeOffset);
  const dateStr = `${offsetDate.getFullYear()}-${offsetDate.getMonth() + 1}-${offsetDate.getDate()}`;
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = Math.imul(31, hash) + dateStr.charCodeAt(i) | 0;
  }
  return hash;
}

function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

type Difficulty = 'easy' | 'medium' | 'hard';

function getDailyBoard(difficulty: Difficulty) {
  const seed = getDailySeed() + (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3);
  const random = mulberry32(seed);
  const traits = Array.from(new Set(PLAYERS[difficulty].flatMap(p => p.traits)));
  
  let shuffled = [...traits];
  for(let i = shuffled.length - 1; i > 0; i--){
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 16);
}

const DIFFICULTY_SETTINGS = {
  easy: { time: 90, penalty: 5, xp: 50 },
  medium: { time: 90, penalty: 5, xp: 100 },
  hard: { time: 90, penalty: 5, xp: 200 }
};

export default function Bingo() {
  const navigate = useNavigate();
  const [SQUARES, setSQUARES] = useState<string[]>([]);
  const [marked, setMarked] = useState<boolean[]>(Array(16).fill(false));
  const [hasBingo, setHasBingo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [currentPlayer, setCurrentPlayer] = useState(PLAYERS['medium'][0]);
  const [gameOver, setGameOver] = useState(false);
  const [errorFlash, setErrorFlash] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [nextBingoCountdown, setNextBingoCountdown] = useState("");

  useEffect(() => {
    setSQUARES(getDailyBoard(difficulty));
  }, [difficulty]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let next10am = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
      if (now.getTime() >= next10am.getTime()) {
        next10am.setDate(next10am.getDate() + 1);
      }
      const diff = next10am.getTime() - now.getTime();
      
      const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
      setNextBingoCountdown(`${h}:${m}:${s}`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer: any;
    if (isPlaying && timeLeft > 0 && !hasBingo) {
        timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
    } else if (timeLeft <= 0 && isPlaying) {
        setIsPlaying(false);
        setGameOver(true);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, hasBingo]);

  const startGame = () => {
      setMarked(Array(16).fill(false));
      setHasBingo(false);
      setGameOver(false);
      setTimeLeft(DIFFICULTY_SETTINGS[difficulty].time);
      setIsPlaying(true);
      pickRandomPlayer();
  };

  const pickRandomPlayer = () => {
      const pool = PLAYERS[difficulty];
      const randomPlayer = pool[Math.floor(Math.random() * pool.length)];
      setCurrentPlayer(randomPlayer);
  };

  const toggleSquare = async (index: number) => {
    if (!isPlaying || hasBingo || gameOver || marked[index]) return;

    const trait = SQUARES[index];
    if (currentPlayer.traits.includes(trait)) {
        // Correct match!
        const newMarked = [...marked];
        newMarked[index] = true;
        setMarked(newMarked);

        const isBingo = WINNING_LINES.some(line => line.every(idx => newMarked[idx]));
        if (isBingo) {
          setHasBingo(true);
          setIsPlaying(false);
          // Give some XP if logged in
          try {
            if (auth.currentUser) {
              const lbRef = doc(db, 'leaderboard', auth.currentUser.uid);
              const lbSnap = await getDoc(lbRef);
              const currentXp = lbSnap.exists() ? lbSnap.data().xp : 0;
              await setDoc(lbRef, {
                  xp: currentXp + DIFFICULTY_SETTINGS[difficulty].xp,
                  displayName: auth.currentUser?.displayName || 'Player',
                  photoURL: auth.currentUser?.photoURL || ''
              }, { merge: true });
            }
          } catch (e) {
            console.error("Failed to update XP", e);
          }
        } else {
            pickRandomPlayer();
        }
    } else {
        // Incorrect match
        setTimeLeft(prev => Math.max(0, prev - DIFFICULTY_SETTINGS[difficulty].penalty));
        setErrorFlash(index);
        setTimeout(() => setErrorFlash(null), 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#050b15] text-white font-sans flex flex-col items-center py-6 px-4 relative overflow-hidden">
      
      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 font-bold hover:text-emerald-500 transition-colors cursor-pointer uppercase text-xs tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Hub
          </button>
          
          <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-400 shadow-sm flex items-center gap-2">
            <Timer className="w-3 h-3" />
            Next board in: {nextBingoCountdown}
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-500 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-3 h-3" /> Daily Match Trivia
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter mb-2 uppercase">Football <span className="text-emerald-500">Bingo</span></h1>
          <p className="text-slate-400 font-medium text-sm">Match the player to a valid trait on the board. The board resets <span className="text-white">every day at 10:00!</span></p>
        </div>

        {!isPlaying && !hasBingo && !gameOver && (
            <div className="flex justify-center gap-2 mb-6">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                    <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                            difficulty === level 
                            ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
                        }`}
                    >
                        {level} ({DIFFICULTY_SETTINGS[level].time}s)
                    </button>
                ))}
            </div>
        )}

        {isPlaying && (
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl mb-6 border border-white/10 backdrop-blur-md">
                <div className={`flex items-center gap-2 font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
                    <Timer className="w-5 h-5" />
                    <span className="text-xl md:text-2xl">{timeLeft}s</span>
                </div>
                
                <div className="text-center flex-1 mx-4">
                    <div className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Current Player</div>
                    <AnimatePresence mode="popLayout">
                        <motion.div 
                            key={currentPlayer.name}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            className="text-xl md:text-3xl font-black italic uppercase tracking-tight text-white drop-shadow-md"
                        >
                            {currentPlayer.name}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <button 
                onClick={() => {
                    pickRandomPlayer();
                }}
                disabled={!isPlaying || hasBingo || gameOver}
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-3 md:px-4 py-2 md:py-3 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                    <span className="hidden md:inline">Skip</span> <SkipForward className="w-4 h-4 md:ml-1" />
                </button>
            </div>
        )}

        <div className="bg-[#0a1120] border border-white/10 p-4 md:p-6 rounded-3xl relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            {SQUARES.map((square, idx) => {
              const fails = errorFlash === idx;
              return (
                <motion.button
                    key={idx}
                    whileHover={isPlaying && !marked[idx] ? { scale: 1.05 } : {}}
                    whileTap={isPlaying && !marked[idx] ? { scale: 0.95 } : {}}
                    onClick={() => toggleSquare(idx)}
                    disabled={!isPlaying || marked[idx]}
                    animate={fails ? { x: [-5, 5, -5, 5, 0], backgroundColor: 'rgba(239,68,68,0.2)' } : { backgroundColor: marked[idx] ? 'rgba(16,185,129,0.2)' : 'rgba(0,0,0,0.4)' }}
                    className={`relative aspect-square rounded-xl md:rounded-2xl flex flex-col items-center justify-center p-1 md:p-2 text-center transition-all border shadow-sm ${
                        marked[idx] 
                        ? 'border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                        : fails 
                            ? 'border-red-500/50 text-red-400' 
                            : 'border-white/5 text-slate-300 hover:border-white/20'
                    } ${!isPlaying && !marked[idx] ? 'opacity-40 cursor-default' : 'cursor-pointer'}`}
                >
                    <span className="text-[8px] md:text-sm font-bold uppercase tracking-tight md:tracking-wide leading-tight select-none">
                    {square}
                    </span>
                    {marked[idx] && (
                        <div className="absolute w-2 h-2 bg-emerald-500 rounded-full top-2 right-2 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                    )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {!isPlaying && !hasBingo && !gameOver && (
            <div className="text-center mt-8">
                <button onClick={startGame} className="bg-emerald-500 text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer">
                    Start Game
                </button>
            </div>
        )}

        {gameOver && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-8 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl"
            >
                <h3 className="text-2xl font-black text-red-500 uppercase tracking-tighter mb-2">Time's Up!</h3>
                <p className="text-white mb-6 font-medium text-sm">You ran out of time before getting a bingo. Better luck next time!</p>
                <button onClick={startGame} className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest transition-colors cursor-pointer">
                    Try Again
                </button>
            </motion.div>
        )}

        {hasBingo && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mt-8 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.2)]"
            >
                <h3 className="text-4xl font-black text-emerald-500 uppercase tracking-tighter mb-2 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]">BINGO!</h3>
                <p className="text-white mb-6 font-bold uppercase tracking-widest text-sm text-emerald-100">+{DIFFICULTY_SETTINGS[difficulty].xp} XP Awarded</p>
                <button onClick={startGame} className="bg-emerald-500 text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors cursor-pointer">
                    Play Again
                </button>
            </motion.div>
        )}
      </div>
    </div>
  );
}
