/** outLIAR brand: a ring of players where one dot has stepped *out* of the circle. */
export function LogoMark({ size = 48, animate = false, className = '' }: { size?: number; animate?: boolean; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="ol-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff3d5a" />
          <stop offset="1" stopColor="#ff9f45" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="18" stroke="#f4f4fb" strokeOpacity=".16" strokeWidth="2" />
      <circle cx="32" cy="14" r="5" fill="#f4f4fb" />
      <circle cx="47.6" cy="23" r="5" fill="#f4f4fb" />
      <circle cx="32" cy="50" r="5" fill="#f4f4fb" />
      <circle cx="16.4" cy="41" r="5" fill="#f4f4fb" />
      <circle cx="16.4" cy="23" r="5" fill="#f4f4fb" />
      <circle cx="47.6" cy="41" r="4.6" stroke="#ff3d5a" strokeOpacity=".75" strokeWidth="2" strokeDasharray="3 2.6" />
      <g className={animate ? 'liar-dot' : undefined}>
        <circle cx="56.5" cy="47.5" r="5.5" fill="url(#ol-g)" />
      </g>
    </svg>
  );
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`}>
      <span className="wm-out">out</span>
      <span className="wm-liar">LIAR</span>
    </span>
  );
}

export function Logo({ size = 34, className = '' }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      <Wordmark className="text-2xl" />
    </span>
  );
}
