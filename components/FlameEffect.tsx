'use client';

import { useEffect, useState } from 'react';

interface FlameEffectProps {
  isActive: boolean;
  onComplete: () => void;
}

export default function FlameEffect({ isActive, onComplete }: FlameEffectProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShow(true);
      
      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onComplete, 500); // Wait for fade out animation
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 animate-pulse" />
      
      {/* Flame particles */}
      <div className="flame-container">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="flame-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1.5 + Math.random()}s`
            }}
          />
        ))}
      </div>

      {/* Center burn notification */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center animate-bounce">
          <div className="text-8xl mb-4">🔥</div>
          <div className="text-4xl font-bold text-orange-400 glow-text animate-pulse">
            NEW BURN DETECTED!
          </div>
          <div className="text-xl text-orange-300 mt-2 animate-pulse">
            SHIB tokens sent to the void 🚀
          </div>
        </div>
      </div>

      <style jsx>{`
        .flame-container {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100vh;
          overflow: hidden;
        }

        .flame-particle {
          position: absolute;
          bottom: -50px;
          width: 8px;
          height: 20px;
          background: linear-gradient(to top, 
            #ff4500 0%, 
            #ff6347 25%, 
            #ffa500 50%, 
            #ffff00 75%, 
            transparent 100%
          );
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          animation: flameRise linear infinite;
        }

        @keyframes flameRise {
          0% {
            bottom: -50px;
            transform: translateX(0) scale(0.8) rotate(0deg);
            opacity: 1;
          }
          25% {
            transform: translateX(-10px) scale(1.2) rotate(-5deg);
            opacity: 0.9;
          }
          50% {
            transform: translateX(15px) scale(1.4) rotate(10deg);
            opacity: 0.7;
          }
          75% {
            transform: translateX(-5px) scale(1.1) rotate(-3deg);
            opacity: 0.4;
          }
          100% {
            bottom: 100vh;
            transform: translateX(0) scale(0.3) rotate(0deg);
            opacity: 0;
          }
        }

        .glow-text {
          text-shadow: 
            0 0 10px #ff4500,
            0 0 20px #ff4500,
            0 0 30px #ff4500,
            0 0 40px #ff4500;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}