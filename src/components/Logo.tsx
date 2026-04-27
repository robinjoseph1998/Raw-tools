'use client';

export default function Logo({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo-grad-frame" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="logo-grad-brace" x1="0" y1="16" x2="64" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="logo-grad-prompt" x1="24" y1="22" x2="44" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>

      {/* Rounded rectangle frame */}
      <rect
        x="3"
        y="3"
        width="58"
        height="58"
        rx="14"
        stroke="url(#logo-grad-frame)"
        strokeWidth="3"
        fill="none"
        opacity="0.6"
      />

      {/* Left curly brace { */}
      <path
        d="M22 16c-4 0-6 2-6 5v7c0 3-2 4-4 4 2 0 4 1 4 4v7c0 3 2 5 6 5"
        stroke="url(#logo-grad-brace)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Right curly brace } */}
      <path
        d="M42 16c4 0 6 2 6 5v7c0 3 2 4 4 4-2 0-4 1-4 4v7c0 3-2 5-6 5"
        stroke="url(#logo-grad-brace)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Terminal prompt > */}
      <path
        d="M25 27l6 5-6 5"
        stroke="url(#logo-grad-prompt)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Underscore _ */}
      <line
        x1="34"
        y1="37"
        x2="41"
        y2="37"
        stroke="url(#logo-grad-prompt)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
