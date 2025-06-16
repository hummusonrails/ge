import { useEffect, useState } from "react";
import { sdk } from "@farcaster/frame-sdk";
import { useAccount, useConnect } from "wagmi";
import ContinentQuiz from "./components/ContinentQuiz";
import CompletionBanner from "./components/CompletionBanner";
import GameTimer from "./components/GameTimer";

function formatElapsedTime(ms: number): string {
  if (!ms || ms < 0) return "-";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

import { CONTINENTS } from "./data/continents";
import { useAtom } from "jotai";
import { continentsCompletedAtom } from "./state";

export default function App() {
  // Load state from localStorage if present
  const loadGameState = () => {
    try {
      const saved = localStorage.getItem("geocaster_game_state");
      if (saved) {
        const { completedContinents, currentContinentIndex } = JSON.parse(saved);
        return {
          completedContinents: Array.isArray(completedContinents) ? completedContinents : [],
          currentContinentIndex: typeof currentContinentIndex === 'number' ? currentContinentIndex : 0,
        };
      }
    } catch {}
    return { completedContinents: [], currentContinentIndex: 0 };
  };

  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem("geocaster_onboarded") !== "true";
  });
  const initialGameState = loadGameState();
  const [completedContinents, setCompletedContinents] = useState<string[]>(initialGameState.completedContinents);
  const [currentContinentIndex, setCurrentContinentIndex] = useState(initialGameState.currentContinentIndex);

  // Ensure guessedCountriesByContinent always has an array for the current continent
  useEffect(() => {
    const continentName = CONTINENTS[currentContinentIndex]?.name;
    if (continentName && !guessedCountriesByContinent[continentName]) {
      setGuessedCountriesByContinent(prev => ({ ...prev, [continentName]: [] }));
    }
    // eslint-disable-next-line
  }, [currentContinentIndex]);
  // Persist guessed countries for each continent
  const [guessedCountriesByContinent, setGuessedCountriesByContinent] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem("geocaster_guessed_countries");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });
  const [continentsCompleted, setContinentsCompleted] = useAtom(continentsCompletedAtom);

  // Timer state
  const [startTimestamp, setStartTimestamp] = useState<number | null>(() => {
    const saved = localStorage.getItem("geocaster_timer_start");
    return saved ? Number(saved) : null;
  });
  const [endTimestamp, setEndTimestamp] = useState<number | null>(() => {
    const saved = localStorage.getItem("geocaster_timer_end");
    return saved ? Number(saved) : null;
  });
  const [elapsedTimeMs, setElapsedTimeMs] = useState<number>(() => {
    const saved = localStorage.getItem("geocaster_timer_elapsed");
    return saved ? Number(saved) : 0;
  });

  // Start timer on new game
  useEffect(() => {
    if (!startTimestamp) {
      const now = Date.now();
      setStartTimestamp(now);
      localStorage.setItem("geocaster_timer_start", now.toString());
    }
  }, [startTimestamp]);

  // When game is completed, stop timer and persist elapsed time
  useEffect(() => {
    if (continentsCompleted === CONTINENTS.length && startTimestamp && !endTimestamp) {
      const now = Date.now();
      setEndTimestamp(now);
      localStorage.setItem("geocaster_timer_end", now.toString());
      const elapsed = now - startTimestamp;
      setElapsedTimeMs(elapsed);
      localStorage.setItem("geocaster_timer_elapsed", elapsed.toString());
    }
  }, [continentsCompleted, startTimestamp, endTimestamp]);

  // Reset timer on game reset
  const resetGame = () => {
    setCompletedContinents([]);
    setCurrentContinentIndex(0);
    setContinentsCompleted(0);
    setGuessedCountriesByContinent({});
    localStorage.removeItem("geocaster_game_state");
    localStorage.removeItem("geocaster_guessed_countries");
    // Timer reset
    setStartTimestamp(null);
    setEndTimestamp(null);
    setElapsedTimeMs(0);
    localStorage.removeItem("geocaster_timer_start");
    localStorage.removeItem("geocaster_timer_end");
    localStorage.removeItem("geocaster_timer_elapsed");
  };


  // On mount, sync continentsCompleted with completedContinents from localStorage
  useEffect(() => {
    setContinentsCompleted(completedContinents.length);
  }, []);

  // Whenever completedContinents changes, update continentsCompleted
  useEffect(() => {
    setContinentsCompleted(completedContinents.length);
  }, [completedContinents, setContinentsCompleted]);
  const { isConnected, address } = useAccount();
  const { connect, connectors, error, status } = useConnect();

  // Persist game state to localStorage on change
  useEffect(() => {
    localStorage.setItem(
      "geocaster_game_state",
      JSON.stringify({ completedContinents, currentContinentIndex })
    );
    localStorage.setItem(
      "geocaster_guessed_countries",
      JSON.stringify(guessedCountriesByContinent)
    );
  }, [completedContinents, currentContinentIndex, guessedCountriesByContinent]);

  // Dev: allow connect button to proceed on localhost
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  const isDevConnected = isConnected;

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("geocaster_onboarded", "true");
    setShowOnboarding(false);
  };

  const handleCompletion = (continent: string) => {
    if (!completedContinents.includes(continent)) {
      setCompletedContinents((prev) => {
        const updated = [...prev, continent];
        setContinentsCompleted(updated.length);
        return updated;
      });
    }
    setCurrentContinentIndex((i) => i + 1);
  };

  // Reset progress bar if all continents are done
  useEffect(() => {
    if (continentsCompleted >= CONTINENTS.length) {
      setTimeout(() => setContinentsCompleted(0), 1000); // Reset after showing full bar
    }
  }, [continentsCompleted]);

  const allDone = completedContinents.length === CONTINENTS.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 to-cyan-800 text-white flex flex-col items-center justify-center p-6">
      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-cyan-900/90 via-cyan-800/80 to-sky-900/90 backdrop-blur-sm">
          <div className="bg-cyan-950/95 border border-cyan-400/40 rounded-3xl shadow-2xl p-8 max-w-xs w-full flex flex-col items-center animate-fade-in scale-100 hover:scale-[1.03] transition-transform duration-300">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-300 to-cyan-100 drop-shadow-lg mb-4 tracking-tight animate-pulse">Welcome to GeoCaster!</h2>
            <ul className="text-left text-cyan-100 mb-6 text-lg font-semibold space-y-2">
              <li className="flex items-center gap-2"><span className="text-2xl">🔗</span>Connect your wallet</li>
              <li className="flex items-center gap-2"><span className="text-2xl">🌍</span>Guess all countries on each continent</li>
              <li className="flex items-center gap-2"><span className="text-2xl">📢</span>Share your achievement to Farcaster</li>
              <li className="flex items-center gap-2"><span className="text-2xl">🏅</span>Mint a proof of completion NFT if you finish all continents</li>
            </ul>
            <button onClick={handleDismiss} className="mt-2 px-7 py-3 rounded-2xl font-bold text-lg bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-300 text-white shadow-xl hover:scale-105 hover:shadow-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 transition-all duration-200 ring-inset">Let’s go!</button>
          </div>
        </div>
      )}
      {/* Main Content */}
      <main className="w-full max-w-xl bg-gradient-to-br from-cyan-950/90 via-sky-900/80 to-cyan-900/90 rounded-3xl shadow-2xl p-8 flex flex-col items-center border border-cyan-400/10">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-200 drop-shadow-xl tracking-tight animate-fade-in">GeoCaster <span className='inline-block animate-bounce'>🌍</span></h1>
          {isDevConnected && !showOnboarding && !allDone && (
            <div className="mb-6">
              <GameTimer
                startTimestamp={startTimestamp}
                endTimestamp={endTimestamp}
                elapsedTimeMs={elapsedTimeMs}
                isRunning={!!startTimestamp && !endTimestamp}
                formatElapsedTime={formatElapsedTime}
              />
            </div>
          )}
        </div>
        {/* Wallet Connect */}
        {!isDevConnected && !showOnboarding && (
          <div className="flex flex-col items-center gap-6 w-full my-8">
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-extrabold text-cyan-200 mb-3 tracking-tight animate-pulse">Welcome to GeoCaster!</h2>
              <ul className="text-left text-cyan-100 mb-3 text-lg font-semibold space-y-2">
                <li className="flex items-center gap-2"><span className="text-2xl">🔗</span>Connect your wallet to start playing</li>
                <li className="flex items-center gap-2"><span className="text-2xl">🌍</span>Guess 1/4 of all countries on every continent</li>
                <li className="flex items-center gap-2"><span className="text-2xl">📢</span>Share your achievement to Farcaster</li>
                <li className="flex items-center gap-2"><span className="text-2xl">🏅</span>Mint a proof of completion NFT if you finish all continents</li>
              </ul>
              <p className="text-base text-cyan-100 font-medium animate-fade-in">Ready to test your world knowledge?</p>
            </div>
            <button
              type="button"
              disabled={status === 'pending' || !connectors.length}
              onClick={() => {
                connect({ connector: connectors.find(c => c.id === 'injected') ?? connectors[0] });
              }}
              className="px-8 py-4 rounded-2xl font-extrabold text-lg bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-300 text-white shadow-xl hover:scale-105 hover:shadow-cyan-400/40 focus:outline-none focus:ring-4 focus:ring-cyan-300/50 active:scale-95 transition-all duration-200 ring-inset disabled:opacity-60 disabled:cursor-not-allowed animate-fade-in"
            >
              {status === 'pending' ? <span className='flex items-center gap-2'><span className='animate-spin inline-block'>🔄</span>Connecting...</span> : <span className='flex items-center gap-2'>Connect your wallet <span className='animate-bounce'>🔗</span></span>}
            </button>
            {error && <div className="text-red-400 font-semibold text-sm mt-2 animate-shake">{error.message}</div>}
          </div>
        )}

        {/* Game Content */}
        {isDevConnected && !showOnboarding && (
          allDone ? (
            <CompletionBanner
              resetGame={resetGame}
              elapsedTimeMs={elapsedTimeMs}
              formatElapsedTime={formatElapsedTime}
            />
          ) : (
            <ContinentQuiz
              continent={CONTINENTS[currentContinentIndex]}
              onComplete={handleCompletion}
              continentsCompleted={completedContinents.length}
              totalContinents={CONTINENTS.length}
              guessed={guessedCountriesByContinent[CONTINENTS[currentContinentIndex].name] || []}
              setGuessed={guessedArr => setGuessedCountriesByContinent(prev => ({ ...prev, [CONTINENTS[currentContinentIndex].name]: guessedArr }))}
            />
          )
        )}

        {/* Show address when connected */}
        {isDevConnected && !showOnboarding && (
          <div className="mt-4 mb-2">
            {isLocalhost ? (
              <button
                type="button"
                onClick={() => handleCompletion(CONTINENTS[currentContinentIndex].name)}
                className="inline-block bg-gradient-to-r from-cyan-700 to-sky-700 border border-cyan-400/60 text-cyan-100 font-mono px-4 py-2 rounded-xl text-xs tracking-tight shadow hover:scale-105 hover:bg-cyan-800/80 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                title="Dev: Skip to next continent"
              >
                localhost dev — skip continent ⏭️
              </button>
            ) : (
              <span className="inline-block bg-cyan-800/40 border border-cyan-400/40 text-cyan-200 font-mono px-4 py-2 rounded-xl text-xs tracking-tight">{address}</span>
            )}
          </div>
        )}
      </main>
      <footer className="mt-10 text-cyan-200 text-lg text-center opacity-90 flex items-center justify-center gap-3">
        <span className="text-base sm:text-lg font-semibold">Powered by</span>
        <a href="https://arbitrum.io" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
          <img src="/arbitrum-logo.png" alt="Arbitrum Logo" className="h-10 w-10 ml-2 inline-block align-middle" style={{ display: 'inline', verticalAlign: 'middle' }} />
        </a>
      </footer>
    </div>
  );
}