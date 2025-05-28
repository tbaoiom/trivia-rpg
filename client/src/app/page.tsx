// client/src/app/page.tsx
"use client";

import { useState, useEffect } from "react";

interface Question {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export default function Page() {
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const batchSize = 10;

  // Fetch a batch of questions
  async function fetchBatch() {
    setLoading(true);
    try {
      const res = await fetch(`/api/external-questions?amount=${batchSize}`);
      if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
      const data: Question[] = await res.json();
      setQuestions(data);
      setCurrentIdx(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // On game start or when batch is exhausted, fetch batch
  useEffect(() => {
    if (started && !gameOver) {
      if (questions.length === 0 || currentIdx >= questions.length) {
        fetchBatch();
      }
    }
  }, [started, gameOver, currentIdx, questions.length]);

  // Current question
  const question = questions[currentIdx];

  function handleAnswer(ans: string) {
    if (!question) return;
    // Wrong?
    if (ans !== question.correct_answer) {
      const newHealth = health - 1;
      setHealth(newHealth);
      if (newHealth <= 0) {
        setGameOver(true);
        return;
      }
    }
    setCurrentIdx((i) => i + 1);
  }

  function restart() {
    setHealth(5);
    setGameOver(false);
    setQuestions([]);
    setCurrentIdx(0);
  }

  // START MENU
  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1f3a] to-[#8b1a1a] flex items-center justify-center px-4 py-6">
        <div className="text-center">
          <h1 className="text-5xl text-[#f4c430] mb-8 font-mono">Trivia-RPG</h1>
          <button
            onClick={() => setStarted(true)}
            className="px-8 py-4 bg-[#f4c430] text-[#8b1a1a] font-bold rounded shadow-lg hover:bg-[#e5c21a] transition"
          >
            Start
          </button>
        </div>
      </div>
    );
  }

  // GAME OVER
  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1f3a] to-[#8b1a1a] flex items-center justify-center px-4 py-6">
        <div className="text-center">
          <h1 className="text-5xl text-[#8b1a1a] mb-6 font-mono">Game Over</h1>
          <p className="text-[#f4c430] mb-6">Your health reached zero.</p>
          <button
            onClick={restart}
            className="px-8 py-4 bg-[#f4c430] text-[#8b1a1a] font-bold rounded shadow-lg hover:bg-[#e5c21a] transition"
          >
            Restart
          </button>
        </div>
      </div>
    );
  }

  // GAMEPLAY
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1f3a] to-[#8b1a1a] px-4 py-6">
      <div className="max-w-xs mx-auto space-y-8">
        {/* Health Bar */}
        <div>
          <div className="w-full bg-[#8b1a1a] rounded h-4 overflow-hidden">
            <div
              className="h-full"
              style={{ backgroundColor: "#f4c430", width: `${(health / 5) * 100}%` }}
            />
          </div>
          <p className="text-[#f4c430] mt-2 font-mono text-center">Health: {health}</p>
        </div>

        {/* Question Card */}
        {loading || !question ? (
          <p className="text-[#f4c430] font-mono text-center">Loading…</p>
        ) : (
          <div className="bg-[#8b1a1a] border-4 border-[#f4c430] p-6 rounded-lg shadow-xl mx-auto">
            <p className="text-[#f4c430] mb-6 font-mono text-center px-2">
              {decodeHTML(question.question)}
            </p>
            <ul className="list-none p-0 m-0 grid grid-cols-1 gap-4">
              {shuffle([question.correct_answer, ...question.incorrect_answers]).map((ans) => (
                <li key={ans}>
                  <button
                    onClick={() => handleAnswer(ans)}
                    className="w-full px-4 py-3 border-2 border-[#f4c430] rounded font-mono text-[#0b1f3a] bg-[#f4c430] hover:bg-[#d1b01f] transition"
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
