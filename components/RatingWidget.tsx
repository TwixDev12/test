"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

export function RatingWidget({ slug, initialRating }: { slug: string; initialRating: number }) {
  const [rating, setRating] = useState(initialRating);
  const key = `nexushub:rating:${slug}`;

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) setRating(Number(stored));
  }, [key]);

  function rate(value: number) {
    setRating(value);
    localStorage.setItem(key, String(value));
  }

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((value) => (
        <button key={value} onClick={() => rate(value)} aria-label={`Rate ${value} stars`} className="focus-ring rounded-lg p-1">
          <Star className={value <= rating ? "h-5 w-5 fill-[#ff6b35] text-[#ff6b35]" : "h-5 w-5 text-neutral-500"} />
        </button>
      ))}
      <span className="text-sm text-neutral-400">Your rating</span>
    </div>
  );
}
