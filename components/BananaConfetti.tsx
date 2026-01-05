"use client";

import { useEffect, useState } from "react";

interface ConfettiBanana {
  id: number;
  tx: number;
  ty: number;
  size: number;
  rotation: number;
  duration: number;
}

function generateConfetti(count: number): ConfettiBanana[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360 + Math.random() * 30;
    const distance = 150 + Math.random() * 250;
    const radians = (angle * Math.PI) / 180;
    return {
      id: i,
      tx: Math.cos(radians) * distance,
      ty: Math.sin(radians) * distance,
      size: 25 + Math.random() * 20,
      rotation: Math.random() * 720 - 360,
      duration: 1 + Math.random() * 0.5,
    };
  });
}

interface BananaConfettiProps {
  onComplete?: () => void;
}

export default function BananaConfetti({ onComplete }: BananaConfettiProps) {
  const [bananas] = useState<ConfettiBanana[]>(() => generateConfetti(24));
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {bananas.map((banana) => (
        <div
          key={banana.id}
          className="absolute animate-confetti-burst"
          style={{
            width: `${banana.size}px`,
            height: `${banana.size}px`,
            animation: `confetti-${banana.id} ${banana.duration}s ease-out forwards`,
          }}
        >
          <style>{`
            @keyframes confetti-${banana.id} {
              0% {
                transform: translate(0, 0) rotate(0deg) scale(0);
                opacity: 1;
              }
              15% {
                transform: translate(${banana.tx * 0.3}px, ${banana.ty * 0.3}px) rotate(${banana.rotation * 0.15}deg) scale(1);
                opacity: 1;
              }
              100% {
                transform: translate(${banana.tx}px, ${banana.ty + 150}px) rotate(${banana.rotation}deg) scale(0.3);
                opacity: 0;
              }
            }
          `}</style>
          <img
            src="/banana.svg"
            alt=""
            className="w-full h-full"
          />
        </div>
      ))}
    </div>
  );
}
