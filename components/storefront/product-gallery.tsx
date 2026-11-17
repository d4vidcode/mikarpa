'use client';

import Image from 'next/image';
import { useState } from 'react';

export function ProductGallery({
  images,
  name,
}: {
  images: { url: string; alt: string | null }[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active];

  if (!current) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-[var(--store-radius)] bg-[var(--store-muted)] text-sm text-neutral-400">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-[var(--store-radius)] bg-[var(--store-muted)]">
        <Image
          src={current.url}
          alt={current.alt || name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver imagen ${index + 1}`}
              aria-pressed={index === active}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                index === active ? 'border-[var(--store-primary)]' : 'border-transparent'
              }`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
