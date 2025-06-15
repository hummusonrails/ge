import { useState, useEffect } from "react";
import MapSVG from "./MapSVG";

interface Continent {
  name: string;
  countries: string[];
  image: string;
}

interface ContinentQuizProps {
  continent: Continent;
  onComplete: (continentName: string) => void;
  continentsCompleted: number;
  totalContinents: number;
}

export default function ContinentQuiz({
  continent,
  onComplete,
  continentsCompleted,
  totalContinents,
}: ContinentQuizProps) {
  const [guessed, setGuessed] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState<string | null>(null);

  useEffect(() => {
    if (showEmoji) {
      const timeout = setTimeout(() => setShowEmoji(null), 1000);
      return () => clearTimeout(timeout);
    }
  }, [showEmoji]);

  useEffect(() => {
    setGuessed([]);
    setInput("");
  }, [continent.name]);
  

  const requiredToComplete = Math.ceil(continent.countries.length / 4);

  const handleGuess = () => {
    const normalized = input.trim().toLowerCase();
    const match = continent.countries.find(
      (c) => c.toLowerCase() === normalized
    );
    if (match && !guessed.includes(match)) {
      const newGuessed = [...guessed, match];
      setGuessed(newGuessed);
      setShowEmoji("✅");
      playSound("correct");
      if (newGuessed.length >= requiredToComplete) {
        onComplete(continent.name);
      }
    } else {
      setShowEmoji("❌");
      playSound("error");
    }
    setInput("");
  };

  const playSound = (type: "correct" | "error") => {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.play();
  };

  return (
    <div className="max-w-xl mx-auto text-center bg-cyan-900/80 rounded-3xl shadow-2xl border-2 border-cyan-400/20 p-6 sm:p-10 animate-fade-in hover:shadow-cyan-400/30 transition-shadow duration-300 relative overflow-hidden">
      {/* Animated border glow */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl border-4 border-transparent group-hover:border-cyan-400/40 group-focus-within:border-cyan-400/60 transition-all duration-300 z-10"></div>
      <h2 className="text-xl font-semibold mb-2">{continent.name}</h2>
      <MapSVG continentName={continent.name} guessedCountries={guessed} />
      <div className="relative group">
        <input
          className={
            `p-3 rounded-xl bg-white text-black w-full text-lg font-semibold border-2 outline-none transition-all duration-200 ` +
            (showEmoji === "✅"
              ? "border-green-400 shadow-green-200/60 animate-pulse"
              : showEmoji === "❌"
                ? "border-red-400 animate-shake"
                : "border-cyan-300 focus:border-cyan-400 focus:shadow-cyan-200/50 focus:shadow-lg")
          }
          placeholder="Guess a country..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGuess()}
        />
        {showEmoji && (
          <div className={`absolute right-3 top-3 text-2xl ${showEmoji === "✅" ? "animate-bounce text-green-400" : "animate-shake text-red-400"}`}>
            {showEmoji}
          </div>
        )}
      </div>
      <div className="mt-4 text-sm text-gray-300 flex items-center justify-center gap-2">
        <span>{guessed.length} / {requiredToComplete} countries guessed</span>
        <div className="relative group flex items-center">
          <button
            type="button"
            aria-label="Show progress requirement info"
            className="focus:outline-none ml-1"
          >
            <span className="relative flex items-center justify-center">
              <span className="absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-30 group-hover:scale-110 group-hover:opacity-50 transition-all animate-pulse"></span>
              <svg className="w-7 h-7 text-blue-400 group-hover:text-blue-300 transition-colors drop-shadow-lg cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01"/>
              </svg>
            </span>
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 -top-2 z-30 hidden group-hover:flex flex-col items-center">
            <div className="relative bg-blue-900/90 border border-blue-400/70 rounded-lg shadow-xl px-1.5 py-0.5 text-blue-100 text-xs max-w-[140px] w-max text-center animate-fade-in whitespace-normal break-words">
  <span className="font-semibold text-blue-200 block mb-0.5">Hint</span>
  <span>¼ countries (<span className="font-bold text-blue-200">{requiredToComplete}</span>/<span className="font-bold text-blue-200">{continent.countries.length}</span>) needed</span>
  <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-3 h-3 bg-blue-900/90 border-l border-b border-blue-400/70 rotate-45"></span>
</div>
          </div>
        </div>
      </div>
      {/* Progress Bar for Continents Completed */}
      <div className="w-full mt-2 mb-2">
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-3 bg-gradient-to-r from-yellow-400 via-pink-400 to-green-400 transition-all duration-700 shadow-lg"
            style={{
              width: `${(continentsCompleted / totalContinents) * 100}%`,
              boxShadow:
                continentsCompleted / totalContinents > 0.85
                  ? '0 0 12px 4px #facc15, 0 0 24px 8px #22d3ee'
                  : undefined,
            }}
          ></div>
        </div>
        <div className="text-xs text-center text-gray-200 mt-1 tracking-wide font-semibold">
          {continentsCompleted} / {totalContinents} continents completed
        </div>
      </div>
      <ul className="mt-2 space-y-1 text-left">
        {guessed.map((g, idx) => (
          <li
            key={idx}
            className="text-green-300 font-semibold pl-2 flex items-center gap-2 animate-slide-in"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <span className="text-lg">✅</span> {g}
          </li>
        ))}
      </ul>
      {/* Confetti burst when all guessed */}
      {guessed.length >= requiredToComplete && (
        <div className="mt-4 flex justify-center animate-fade-in">
          <span className="text-3xl animate-bounce">🎉🎊🌟</span>
          <span className="ml-2 text-lg text-green-200">Continent complete! You reached the 1/3 goal.</span>
        </div>
      )}
    </div>
  );
}