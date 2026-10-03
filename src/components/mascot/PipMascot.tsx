import React from 'react';

export type PipMood = 'happy' | 'celebrate' | 'waving' | 'sleeping' | 'proud' | 'curious';

interface PipMascotProps {
  mood?: PipMood;
  size?: number;
  className?: string;
}

/**
 * "Pip" The Little Starlight Cloud
 * An original, cuddly emotional companion for expectant parents.
 * Pure lightweight SVG with soft pastel gradients and warm blushing cheeks.
 */
export const PipMascot: React.FC<PipMascotProps> = ({
  mood = 'happy',
  size = 96,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center justify-center select-none relative ${className}`}
      style={{ width: size, height: size }}
      aria-label={`Pip the companion (${mood})`}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm filter"
      >
        <defs>
          {/* Cloud body gradient */}
          <linearGradient id="pipBodyGrad" x1="20" y1="20" x2="100" y2="105" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.6" stopColor="#F5F3FF" />
            <stop offset="1" stopColor="#E6DEFF" />
          </linearGradient>

          {/* Bonnet / Beanie gradient */}
          <linearGradient id="pipCapGrad" x1="30" y1="10" x2="90" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6C4CF5" />
            <stop offset="1" stopColor="#4D2ED4" />
          </linearGradient>

          {/* Soft Cheek Blush */}
          <radialGradient id="pipBlush" cx="50%" cy="50%" r="50%">
            <stop stopColor="#FF786A" stopOpacity="0.45" />
            <stop offset="1" stopColor="#FF786A" stopOpacity="0" />
          </radialGradient>

          {/* Star Sparkle Gradient */}
          <linearGradient id="pipStarGrad" x1="0" y1="0" x2="10" y2="10" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFD45A" />
            <stop offset="1" stopColor="#FFAA00" />
          </linearGradient>
        </defs>

        {/* Ambient Soft Glow Behind Pip */}
        <circle cx="60" cy="62" r="46" fill="#F0ECFC" opacity="0.6" />

        {/* Fluffy Cloud Body */}
        {/* Made of overlapping rounded pill puffs */}
        <g id="cloud-body">
          {/* Base bottom cushion */}
          <rect x="26" y="52" width="68" height="38" rx="19" fill="url(#pipBodyGrad)" />
          
          {/* Left puff */}
          <circle cx="34" cy="64" r="20" fill="url(#pipBodyGrad)" />
          
          {/* Right puff */}
          <circle cx="86" cy="64" r="20" fill="url(#pipBodyGrad)" />
          
          {/* Top-left puff */}
          <circle cx="46" cy="46" r="22" fill="url(#pipBodyGrad)" />
          
          {/* Top-right puff */}
          <circle cx="74" cy="46" r="22" fill="url(#pipBodyGrad)" />
          
          {/* Center puff */}
          <circle cx="60" cy="50" r="24" fill="url(#pipBodyGrad)" />
        </g>

        {/* Little Baby Beanie / Nightcap */}
        <path
          d="M 40 40 C 42 22, 78 20, 80 40 C 72 37, 48 37, 40 40 Z"
          fill="url(#pipCapGrad)"
        />
        {/* Beanie Pom-Pom (Star or Ball) */}
        <circle cx="60" cy="22" r="7" fill="#FFD45A" />
        <circle cx="58" cy="20" r="2" fill="#FFFFFF" opacity="0.8" />

        {/* Cute Baby Cheeks */}
        <ellipse cx="36" cy="68" rx="8" ry="5" fill="url(#pipBlush)" />
        <ellipse cx="84" cy="68" rx="8" ry="5" fill="url(#pipBlush)" />

        {/* Facial Expressions based on Mood */}
        {mood === 'sleeping' ? (
          // Sleepy closed curve eyes
          <g stroke="#34236B" strokeWidth="3" strokeLinecap="round">
            <path d="M 44 63 Q 49 67 54 63" fill="none" />
            <path d="M 66 63 Q 71 67 76 63" fill="none" />
            {/* Small sweet mouth */}
            <path d="M 58 72 Q 60 74 62 72" fill="none" strokeWidth="2.5" />
          </g>
        ) : mood === 'celebrate' || mood === 'proud' ? (
          // Joyful arched happy eyes
          <g>
            <path
              d="M 43 64 C 43 59, 53 59, 53 64"
              stroke="#34236B"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 67 64 C 67 59, 77 59, 77 64"
              stroke="#34236B"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Open happy laughing mouth */}
            <path
              d="M 54 69 Q 60 77 66 69 Z"
              fill="#FF786A"
              stroke="#34236B"
              strokeWidth="1.5"
            />
          </g>
        ) : (
          // Default bright friendly sparkling eyes
          <g>
            {/* Left Eye */}
            <ellipse cx="48" cy="62" rx="4.5" ry="6" fill="#34236B" />
            <circle cx="46.5" cy="60" r="2" fill="#FFFFFF" />
            <circle cx="49.5" cy="63.5" r="1" fill="#FFFFFF" />

            {/* Right Eye */}
            <ellipse cx="72" cy="62" rx="4.5" ry="6" fill="#34236B" />
            <circle cx="70.5" cy="60" r="2" fill="#FFFFFF" />
            <circle cx="73.5" cy="63.5" r="1" fill="#FFFFFF" />

            {/* Cheerful curved smile */}
            <path
              d="M 55 69 Q 60 74 65 69"
              stroke="#34236B"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {/* Little Floating Hands / Mittens */}
        {mood === 'waving' || mood === 'celebrate' ? (
          <>
            {/* Left hand up */}
            <circle cx="20" cy="50" r="7" fill="#FFFFFF" stroke="#E6DEFF" strokeWidth="2" />
            {/* Right hand up */}
            <circle cx="100" cy="50" r="7" fill="#FFFFFF" stroke="#E6DEFF" strokeWidth="2" />
          </>
        ) : (
          <>
            {/* Gentle rested paws */}
            <circle cx="24" cy="74" r="6" fill="#FFFFFF" stroke="#E6DEFF" strokeWidth="1.5" />
            <circle cx="96" cy="74" r="6" fill="#FFFFFF" stroke="#E6DEFF" strokeWidth="1.5" />
          </>
        )}

        {/* Little Floating Magic Sparkles */}
        <path
          d="M 104 28 Q 106 20 108 28 Q 116 30 108 32 Q 106 40 104 32 Q 96 30 104 28 Z"
          fill="url(#pipStarGrad)"
        />
        <circle cx="16" cy="34" r="2.5" fill="#52D6C7" />
        <circle cx="98" cy="84" r="2" fill="#FF786A" />
      </svg>
    </div>
  );
};
