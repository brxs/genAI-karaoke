"use client";

import { useEffect, useState } from "react";

interface Banana {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
}

function generateBananas(count: number): Banana[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 20 + Math.random() * 25,
    duration: 4 + Math.random() * 4,
    delay: Math.random() * 4,
    rotation: Math.random() * 360,
  }));
}

export default function BananaRain() {
  const [bananas, setBananas] = useState<Banana[]>([]);

  useEffect(() => {
    setBananas(generateBananas(18));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <style jsx>{`
        @keyframes banana-fall {
          0% {
            transform: translateY(-150px) rotate(0deg);
            opacity: 0.7;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0.7;
          }
        }
      `}</style>
      {bananas.map((banana) => (
        <img
          key={banana.id}
          src="/banana.svg"
          alt=""
          className="absolute top-[-150px] will-change-transform"
          style={{
            left: `${banana.left}%`,
            width: `${banana.size}px`,
            height: `${banana.size}px`,
            animation: `banana-fall ${banana.duration}s linear ${banana.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
