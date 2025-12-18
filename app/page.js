"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Trophy, Zap, Ghost, Star } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const INITIAL_SPEED = 140;

export default function NeonSnake() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 10, type: 'normal' });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [isGhost, setIsGhost] = useState(false);

  // Charger le record au démarrage
  useEffect(() => {
    const saved = localStorage.getItem('snake-highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = {
        x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE,
      };

      // Collision (Désactivée en mode Fantôme)
      if (!isGhost && prevSnake.some(s => s.x === newHead.x && s.y === newHead.y)) {
        setGameOver(true);
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('snake-highscore', score.toString());
        }
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Manger la nourriture
      if (newHead.x === food.x && newHead.y === food.y) {
        const points = food.type === 'special' ? 50 : 10;
        setScore(s => s + points);

        // Effet Power-up
        if (food.type === 'special') {
          setIsGhost(true);
          setTimeout(() => setIsGhost(false), 5000); // Mode fantôme pendant 5s
        }

        // Accélération progressive
        if ((score + points) % 30 === 0) setSpeed(prev => Math.max(prev - 10, 60));
        
        // Nouvelle nourriture (20% de chance d'être spéciale)
        const nextType = Math.random() > 0.8 ? 'special' : 'normal';
        setFood({
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
          type: nextType
        });
      } else {
        newSnake.pop();
      }
      return newSnake;
    });
  }, [direction, food, gameOver, score, highScore, isGhost]);

  // Boucle de jeu (Vitesse accrue en mode Fantôme)
  useEffect(() => {
    const gameLoop = setInterval(moveSnake, isGhost ? speed * 0.8 : speed);
    return () => clearInterval(gameLoop);
  }, [moveSnake, speed, isGhost]);

  // Contrôles Clavier
  useEffect(() => {
    const handleKey = (e) => {
      const keys = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }
      };
      if (keys[e.key]) {
        const nextDir = keys[e.key];
        if (nextDir.x !== -direction.x && nextDir.y !== -direction.y) {
          setDirection(nextDir);
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [direction]);

  const reset = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setGameOver(false);
    setIsGhost(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 font-sans selection:bg-emerald-500/30">
      
      {/* HUD HEADER */}
      <div className="w-full max-w-[500px] flex justify-between items-center mb-6 px-4 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
        <div className="flex flex-col">
          <h1 className="font-crimson italic text-2xl text-emerald-400 leading-none mb-1 tracking-tight">NEON.SNAKE</h1>
          <div className="flex items-center gap-2">
            {isGhost ? (
              <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity }} className="flex items-center gap-1 text-purple-400 text-[10px] font-bold uppercase tracking-tighter">
                <Ghost size={12} /> Mode Fantôme
              </motion.div>
            ) : (
              <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold uppercase tracking-tighter">
                <Zap size={12} className="text-yellow-500" /> Vitesse: {Math.round(200 - speed)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-widest">Score</p>
            <motion.p key={score} animate={{ scale: [1.2, 1] }} className="text-3xl font-black font-itim leading-none">{score}</motion.p>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="text-right text-rose-500">
            <Trophy size={14} className="ml-auto mb-1" />
            <p className="font-itim text-xl font-bold leading-none">{highScore}</p>
          </div>
        </div>
      </div>

      {/* ZONE DE JEU */}
      <div className="relative group">
        <div 
          className="relative bg-slate-950 border-4 border-slate-900 rounded-xl overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.05)]"
          style={{ width: "min(90vw, 500px)", height: "min(90vw, 500px)" }}
        >
          {/* EFFET SCANLINES (RETRO) */}
          <div className="absolute inset-0 pointer-events-none z-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%]" />

          {/* GRILLE DÉCORATIVE */}
          <div className="absolute inset-0 grid opacity-20" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-emerald-500/20" />
            ))}
          </div>

          {/* NOURRITURE */}
          <motion.div 
            animate={{ 
              scale: [0.8, 1.1, 0.8],
              rotate: food.type === 'special' ? [0, 90, 180, 270, 360] : 0,
              boxShadow: food.type === 'special' ? ["0 0 10px #a855f7", "0 0 30px #a855f7"] : ["0 0 10px #f43f5e", "0 0 20px #f43f5e"]
            }}
            transition={{ repeat: Infinity, duration: food.type === 'special' ? 2 : 0.8 }}
            className={`absolute z-20 flex items-center justify-center ${food.type === 'special' ? 'bg-purple-500' : 'bg-rose-500'} rounded-sm`}
            style={{ 
              width: `${100/GRID_SIZE}%`, height: `${100/GRID_SIZE}%`,
              left: `${(food.x * 100)/GRID_SIZE}%`, top: `${(food.y * 100)/GRID_SIZE}%`
            }}
          >
            {food.type === 'special' && <Star size={10} className="text-white" />}
          </motion.div>

          {/* SERPENT FLUIDE */}
          {snake.map((seg, i) => (
            <motion.div 
              key={`${i}-${seg.x}-${seg.y}`}
              layout
              transition={{ type: "tween", ease: "linear", duration: isGhost ? 0.08 : 0.12 }}
              className={`absolute border-[1px] border-black/20 z-10 
                ${i === 0 
                  ? (isGhost ? 'bg-purple-400 shadow-[0_0_25px_#a855f7]' : 'bg-emerald-400 shadow-[0_0_25px_#34d399]') 
                  : (isGhost ? 'bg-purple-600/40' : 'bg-emerald-600')
                } 
                ${i === 0 ? 'rounded-md' : 'rounded-sm'}`}
              style={{ 
                width: `${100/GRID_SIZE}%`, height: `${100/GRID_SIZE}%`,
                left: `${(seg.x * 100)/GRID_SIZE}%`, top: `${(seg.y * 100)/GRID_SIZE}%`,
                opacity: 1 - (i * 0.015)
              }}
            />
          ))}

          {/* OVERLAY GAME OVER */}
          <AnimatePresence>
            {gameOver && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
              >
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  <h2 className="text-7xl font-black mb-2 text-rose-500 tracking-tighter italic">GAME OVER</h2>
                  <p className="text-slate-400 mb-8 font-itim text-xl italic tracking-wide">Record personnel : {highScore}</p>
                  <button 
                    onClick={reset}
                    className="group flex items-center gap-4 bg-emerald-500 text-black px-12 py-5 rounded-full font-black text-lg hover:bg-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(52,211,153,0.3)]"
                  >
                    <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-700" /> REJOUER
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CONTROLES MOBILES */}
      <div className="mt-10 grid grid-cols-3 gap-4 lg:hidden">
        <div />
        <button onClick={() => direction.y === 0 && setDirection({x:0, y:-1})} className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center active:bg-emerald-500 transition-colors"><ChevronUp size={32}/></button>
        <div />
        <button onClick={() => direction.x === 0 && setDirection({x:-1, y:0})} className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center active:bg-emerald-500 transition-colors"><ChevronLeft size={32}/></button>
        <button onClick={() => direction.y === 0 && setDirection({x:0, y:1})} className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center active:bg-emerald-500 transition-colors"><ChevronDown size={32}/></button>
        <button onClick={() => direction.x === 0 && setDirection({x:1, y:0})} className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center active:bg-emerald-500 transition-colors"><ChevronRight size={32}/></button>
      </div>

      <p className="mt-8 text-slate-700 text-[10px] uppercase tracking-[0.4em] font-bold">Arcade Experience by Hleyy</p>
    </div>
  );
}