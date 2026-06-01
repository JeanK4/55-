'use client';

import { Star } from 'lucide-react';

export function RatingStars({
  value,
  onChange,
  readOnly = false,
}: {
  value: number;
  onChange?: (val: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(v => (
        <button
          key={v}
          type="button"
          onClick={() => !readOnly && onChange?.(v)}
          className="p-1 rounded-full hover:bg-sand"
          aria-label={`Calificar ${v} estrellas`}
          disabled={readOnly}
        >
          <Star className={`w-5 h-5 ${v <= value ? 'text-gold fill-gold' : 'text-coffee/40'}`} />
        </button>
      ))}
    </div>
  );
}
