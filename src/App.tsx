import React, { useState, useEffect } from 'react';
import { Moon, Sun, Clock, Bell } from 'lucide-react';
import { motion } from 'motion/react';

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
};

interface Cycle {
  cycle: number;
  wakeTime: Date;
  durationHours: number;
  isClosest: boolean;
}

export default function App() {
  const [bedTime, setBedTime] = useState('');
  const [fallAsleepMinutes, setFallAsleepMinutes] = useState(15);
  const [targetWakeTime, setTargetWakeTime] = useState('05:00');
  const [cycles, setCycles] = useState<Cycle[]>([]);

  const setNow = () => {
    const now = new Date();
    setBedTime(formatTime(now));
  };

  useEffect(() => {
    setNow();
  }, []);

  useEffect(() => {
    if (!bedTime) return;

    const [bHours, bMinutes] = bedTime.split(':').map(Number);
    const now = new Date();
    const sleepStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), bHours, bMinutes, 0);

    // Adjust for crossing midnight
    if (now.getTime() - sleepStart.getTime() > 12 * 60 * 60 * 1000) {
      sleepStart.setDate(sleepStart.getDate() + 1);
    } else if (sleepStart.getTime() - now.getTime() > 12 * 60 * 60 * 1000) {
      sleepStart.setDate(sleepStart.getDate() - 1);
    }

    sleepStart.setMinutes(sleepStart.getMinutes() + fallAsleepMinutes);

    const [tHours, tMinutes] = targetWakeTime.split(':').map(Number);
    const targetDate = new Date(sleepStart);
    targetDate.setHours(tHours, tMinutes, 0, 0);

    if (targetDate <= sleepStart) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const generatedCycles: Omit<Cycle, 'isClosest'>[] = [];
    for (let i = 1; i <= 6; i++) {
      const wakeTime = new Date(sleepStart.getTime() + i * 90 * 60000);
      generatedCycles.push({
        cycle: i,
        wakeTime,
        durationHours: (i * 90) / 60
      });
    }

    let closestIndex = 0;
    let minDiff = Infinity;
    generatedCycles.forEach((c, idx) => {
      const diff = Math.abs(c.wakeTime.getTime() - targetDate.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    setCycles(generatedCycles.map((c, idx) => ({ ...c, isClosest: idx === closestIndex })));
  }, [bedTime, fallAsleepMinutes, targetWakeTime]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8 font-sans selection:bg-indigo-500/30 pb-20">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-center space-x-4 pt-8 pb-4">
          <div className="p-3 bg-indigo-500/20 rounded-2xl shadow-[0_0_30px_-5px_rgba(99,102,241,0.4)]">
            <Moon className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">SleepSync</h1>
            <p className="text-sm text-indigo-300/80 font-medium">Dein perfekter Wecker</p>
          </div>
        </header>

        {/* Settings Card */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-[2rem] p-6 space-y-6 shadow-2xl backdrop-blur-xl">
          {/* Bedtime */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Ich gehe ins Bett um:
              </label>
              <button onClick={setNow} className="text-xs bg-indigo-500/10 text-indigo-300 px-3 py-1.5 rounded-full hover:bg-indigo-500/20 transition-colors font-medium border border-indigo-500/20">
                Jetzt
              </button>
            </div>
            <input
              type="time"
              value={bedTime}
              onChange={(e) => setBedTime(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-2xl font-semibold text-center focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all shadow-inner"
            />
          </div>

          {/* Fall Asleep Time */}
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                Einschlafdauer:
              </label>
              <span className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                {fallAsleepMinutes} Min
              </span>
            </div>
            <div className="px-2">
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={fallAsleepMinutes}
                onChange={(e) => setFallAsleepMinutes(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-2 px-1 font-medium">
                <span>0 Min</span>
                <span>30 Min</span>
                <span>60 Min</span>
              </div>
            </div>
          </div>

          {/* Target Wake Time */}
          <div className="space-y-3 pt-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2 px-1">
              <Sun className="w-4 h-4 text-indigo-400" />
              Wunsch-Aufwachzeit:
            </label>
            <input
              type="time"
              value={targetWakeTime}
              onChange={(e) => setTargetWakeTime(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-2xl font-semibold text-center focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all shadow-inner text-indigo-100"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-semibold px-2 flex items-center gap-2 text-slate-200">
            <Bell className="w-5 h-5 text-indigo-400" />
            Empfohlene Weckzeiten
          </h2>
          <div className="space-y-3">
            {cycles.map((cycle, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative overflow-hidden rounded-2xl border p-5 flex items-center justify-between transition-all ${
                  cycle.isClosest
                    ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_30px_-10px_rgba(99,102,241,0.2)]'
                    : 'bg-slate-900/40 border-slate-800/50 hover:bg-slate-900/60'
                }`}
              >
                {cycle.isClosest && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                )}
                <div className="pl-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-3xl font-bold tracking-tight ${cycle.isClosest ? 'text-indigo-300' : 'text-slate-200'}`}>
                      {formatTime(cycle.wakeTime)}
                    </span>
                    {cycle.isClosest && (
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/20">
                        Beste Wahl
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-1 font-medium">
                    {cycle.cycle} Schlafzyklen
                  </p>
                </div>
                <div className="text-right pr-2">
                  <div className={`text-xl font-bold ${
                    cycle.durationHours >= 7.5 ? 'text-emerald-400' :
                    cycle.durationHours >= 6 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {cycle.durationHours}h
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Schlafzeit</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
