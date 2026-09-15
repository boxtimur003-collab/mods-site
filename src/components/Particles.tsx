'use client';

import { useEffect, useState } from 'react';

type Particle = {
  id: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
  size: number;
};

export default function Particles({ count = 30 }: { count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const p: Particle[] = [];
    for (let i = 0; i < count; i++) {
      p.push({
        id: i,
        left: Math.random() * 100,
        top: 60 + Math.random() * 40,
        duration: 8 + Math.random() * 10,
        delay: Math.random() * 10,
        size: 2 + Math.random() * 3,
      });
    }
    setParticles(p);
  }, [count]);

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </>
  );
}