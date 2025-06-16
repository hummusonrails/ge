import { useEffect, useRef, useState } from "react";

interface GameTimerProps {
  startTimestamp: number | null;
  endTimestamp: number | null;
  elapsedTimeMs: number;
  isRunning: boolean;
  formatElapsedTime: (ms: number) => string;
}

export default function GameTimer({ startTimestamp, endTimestamp, elapsedTimeMs, isRunning, formatElapsedTime }: GameTimerProps) {
  const [now, setNow] = useState(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && startTimestamp && !endTimestamp) {
      intervalRef.current = setInterval(() => setNow(Date.now()), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, startTimestamp, endTimestamp]);

  let ms: number;
  if (endTimestamp) {
    ms = elapsedTimeMs;
  } else if (startTimestamp) {
    ms = now - startTimestamp;
  } else {
    ms = 0;
  }

  // Tailwind: glassy, glowing, animated, with clock icon
  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-cyan-900/60 border-2 border-cyan-400/30 shadow-lg backdrop-blur-md animate-fade-in">
      <span className="text-cyan-300 animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-1 text-cyan-200 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m5-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </span>
      <span className="font-mono text-lg text-cyan-100 tracking-widest drop-shadow animate-timer-glow">
        {formatElapsedTime(ms)}
      </span>
      <span className="text-cyan-400 font-semibold ml-2">Elapsed</span>
    </div>
  );
}

// Add a custom animation in tailwind.config.js for animate-timer-glow and animate-spin-slow if desired.
