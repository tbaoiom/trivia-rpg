"use client";

import { useEffect, useState } from "react";

interface Question {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export default function Page() {
  const [qs, setQs] = useState<Question[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use an environment variable for the API base URL or default to localhost in development
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_BASE}/api/external-questions?amount=5`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }
        return res.json() as Promise<Question[]>;
      })
      .then(setQs)
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  }, [API_BASE]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-900 to-yellow-800">
        <p className="text-red-300 font-mono">Error: {error}</p>
      </div>
    );
  }

  if (!qs) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 to-yellow-800 flex items-center justify-center">
        <p className="text-yellow-300 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-900 to-red-900 p-6">
      <h1 className="text-yellow-300 text-2xl mb-6 text-center">Fire Emblem Trivia</h1>
      <div className="space-y-6">
        {qs.map((q, idx) => (
          <div
            key={idx}
            className="bg-red-800 border-2 border-yellow-300 p-4 rounded-md shadow-lg"
          >
            <p className="text-yellow-300 mb-3 font-mono">
              Q{idx + 1}: {decodeHTML(q.question)}
            </p>
            <ul className="grid grid-cols-2 gap-3">
              {shuffle([q.correct_answer, ...q.incorrect_answers]).map((ans, i) => (
                <li key={i}>
                  <button className="w-full px-3 py-2 border-2 border-yellow-300 rounded font-mono text-yellow-300 hover:bg-yellow-300 hover:text-red-900 transition">
                    {decodeHTML(ans)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}

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
