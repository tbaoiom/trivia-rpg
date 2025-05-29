"use client";

import { useState, useEffect } from "react";

interface Question {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

type View = "menu" | "about" | "game" | "gameover";

export default function Page() {
  const [view, setView] = useState<View>("menu");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<number[]>([]);

  const batchSize = 20;           // batch size for fetching number of questions at a time
  const lbKey = "trivia-rpg-leaderboard";

  useEffect(() => {
    const ls = localStorage.getItem(lbKey);
    if (ls) setLeaderboard(JSON.parse(ls));
  }, []);

  async function fetchBatch() {
    setLoading(true);
    try {
      const res = await fetch(`/api/external-questions?amount=${batchSize}`);
      if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
      const data: Question[] = await res.json();
      setQuestions(data);
      setCurrentIdx(0);
    } finally {
      setLoading(false);
    }
  }

  // resetting and starting game
  function startGame() {
    setHealth(100);
    setScore(0);
    setView("game");
    fetchBatch();
  }

  // handle wrong or right answer
  function handleAnswer(ans: string) {
    const q = questions[currentIdx];
    if (!q) return;

    if (ans === q.correct_answer) {
      setScore((s) => s + 100);
    } else {
      setHealth((h) => h - 10);
    }

    const newHealth = ans === q.correct_answer ? health : health - 10;
    if (newHealth <= 0) {
      saveScore(score + (ans === q.correct_answer ? 100 : 0));
      return setView("gameover");
    }

    setCurrentIdx((i) => i + 1);
  }

  // save score for leaderboard
  function saveScore(finalScore: number) {
    const updated = [finalScore, ...leaderboard].slice(0, 10);
    setLeaderboard(updated);
    localStorage.setItem(lbKey, JSON.stringify(updated));
  }

  function restart() {
    startGame();
  }

  // menu
  if (view === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1f3a] to-[#8b1a1a]
                      flex flex-col items-center justify-center px-4 py-6">
        <h1 className="text-5xl text-[#f4c430] mb-12 font-mono">Trivia-RPG</h1>
        <div className="flex flex-col items-center space-y-8 mb-8">
          <button
            onClick={startGame}
            className="w-40 h-40 flex items-center justify-center
                       bg-[#f4c430] text-[#8b1a1a] text-xl font-bold
                       rounded-full shadow-xl hover:bg-[#e5c21a] transition"
          >
            Start
          </button>
          <button
            onClick={() => setView("about")}
            className="w-40 h-40 flex items-center justify-center
                       bg-[#8b1a1a] text-[#f4c430] text-xl font-bold
                       rounded-full shadow-xl hover:bg-[#6a1313] transition"
          >
            About
          </button>
        </div>
        {leaderboard.length > 0 && (
          <div className="w-full max-w-xs text-center">
            <p className="text-[#f4c430] mb-2 font-mono">Past Scores:</p>
            <ol className="list-decimal list-inside text-[#f4c430] font-mono">
              {leaderboard.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  }

  // About section for how to play the game
  if (view === "about") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1f3a] to-[#8b1a1a]
                      flex flex-col items-center justify-center px-4 py-6">
        <h2 className="text-3xl text-[#f4c430] mb-4 font-mono">How to Play</h2>
        <ul className="list-disc list-inside text-[#f4c430] font-mono space-y-2 mb-6">
          <li>Answer correctly to gain score</li>
          <li>Each wrong answer costs 10 health</li>
          <li>When your health hits 0, the game ends.</li>
          <li>Practice endless questions and try to get the highest score.</li>
        </ul>
        <button
          onClick={() => setView("menu")}
          className="px-6 py-3 bg-[#f4c430] text-[#8b1a1a]
                     font-bold rounded-full shadow-xl hover:bg-[#e5c21a] transition"
        >
          Back
        </button>
      </div>
    );
  }

  // Game over screen
  if (view === "gameover") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1f3a] to-[#8b1a1a]
                      flex flex-col items-center justify-center px-4 py-6">
        <h2 className="text-4xl text-[#8b1a1a] mb-4 font-mono">Game Over</h2>
        <p className="text-[#f4c430] mb-2 font-mono">Final Score: {score}</p>
        <button
          onClick={restart}
          className="px-6 py-3 bg-[#f4c430] text-[#8b1a1a]
                     font-bold rounded-full shadow-xl hover:bg-[#e5c21a] mb-4 transition"
        >
          Play Again
        </button>
        <button
          onClick={() => setView("menu")}
          className="px-6 py-3 bg-[#f4c430] text-[#8b1a1a] font-bold rounded-full shadow-xl hover:bg-[#e5c21a] transition"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  // gameplay
  const q = questions[currentIdx];
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1f3a] to-[#8b1a1a]
                    px-4 py-6 flex items-start justify-center">
      <div className="w-full max-w-xs space-y-6">
        {/* Health and Score */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {/* heart icon */}
            <span className="text-[#f4c430] text-2xl bg-transparent leading-none">
              ❤️
            </span>
            <span className="text-[#f4c430] font-mono">{health}</span>
          </div>
          <p className="text-[#f4c430] font-mono">Score: {score}</p>
        </div>

        {loading || !q ? (
          <p className="text-[#f4c430] font-mono text-center">Loading…</p>
        ) : (
          <div className="bg-[#8b1a1a] border-4 border-[#f4c430]
                          p-4 rounded-lg shadow-lg">
            <p className="text-[#f4c430] mb-4 font-mono text-center px-2">
              {decodeHTML(q.question)}
            </p>
            <ul className="list-none p-0 m-0 grid grid-cols-1 gap-3">
              {shuffle([q.correct_answer, ...q.incorrect_answers]).map((ans) => (
                <li key={ans}>
                  <button
                    onClick={() => handleAnswer(ans)}
                    className="w-full px-3 py-2 border-2 border-[#f4c430]
                               rounded font-mono text-[#0b1f3a] bg-[#f4c430]
                               hover:bg-[#d1b01f] transition"
                  >
                    {decodeHTML(ans)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Helpers
function decodeHTML(html: string): string {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
