'use client';

import { useEffect, useState } from 'react';

type Star = {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
};

export default function Background() {
  const [stars, setStars] = useState<Star[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    const count = isMobile ? 20 : 60;

    const arr: Star[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1 + Math.random() * 2,
        duration: 4 + Math.random() * 8,
        delay: Math.random() * 10,
        opacity: 0.2 + Math.random() * 0.6,
      });
    }
    setStars(arr);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Большие размытые орбы */}
      <div
        className="orb"
        style={{
          width: '600px',
          height: '600px',
          top: '-10%',
          left: '-10%',
          background:
            'radial-gradient(circle, rgba(124,58,237,0.9) 0%, rgba(124,58,237,0) 70%)',
          animation: 'orbFloat1 25s ease-in-out infinite',
        }}
      />
      <div
        className="orb"
        style={{
          width: '700px',
          height: '700px',
          top: '35%',
          right: '-20%',
          background:
            'radial-gradient(circle, rgba(168,85,247,0.8) 0%, rgba(168,85,247,0) 70%)',
          animation: 'orbFloat2 30s ease-in-out infinite',
        }}
      />
      <div
        className="orb"
        style={{
          width: '500px',
          height: '500px',
          bottom: '-10%',
          left: '25%',
          background:
            'radial-gradient(circle, rgba(99,102,241,0.7) 0%, rgba(99,102,241,0) 70%)',
          animation: 'orbFloat3 28s ease-in-out infinite',
        }}
      />
      <div
        className="orb"
        style={{
          width: '400px',
          height: '400px',
          top: '60%',
          left: '-10%',
          background:
            'radial-gradient(circle, rgba(168,85,247,0.6) 0%, rgba(168,85,247,0) 70%)',
          animation: 'orbFloat1 35s ease-in-out infinite',
        }}
      />

      {/* Мерцающие звёзды */}
      {stars.map((s) => (
        <div
          key={s.id}
          className="fixed rounded-full pointer-events-none"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            background: '#a78bfa',
            boxShadow: '0 0 6px rgba(167, 139, 250, 0.8)',
            opacity: s.opacity,
            zIndex: 1,
            animation: `starTwinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </>
  );
}