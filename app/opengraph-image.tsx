import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'outLIAR — the social deduction party game';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// The preview card shown when someone shares the link in WhatsApp, Telegram, iMessage, etc.
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#07070d', color: '#f4f4fb' }}>
        <svg width="210" height="210" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="18" stroke="#3a3b4d" strokeWidth="2" />
          <circle cx="32" cy="14" r="5" fill="#f4f4fb" />
          <circle cx="47.6" cy="23" r="5" fill="#f4f4fb" />
          <circle cx="32" cy="50" r="5" fill="#f4f4fb" />
          <circle cx="16.4" cy="41" r="5" fill="#f4f4fb" />
          <circle cx="16.4" cy="23" r="5" fill="#f4f4fb" />
          <circle cx="47.6" cy="41" r="4.6" stroke="#ff3d5a" strokeWidth="2" strokeDasharray="3 2.6" />
          <circle cx="56.5" cy="47.5" r="5.5" fill="#ff5a50" />
        </svg>
        <div style={{ display: 'flex', fontSize: 168, letterSpacing: -8, marginTop: 6 }}>
          <span style={{ fontWeight: 300 }}>out</span>
          <span style={{ fontWeight: 900, color: '#ff3d5a' }}>LIAR</span>
        </div>
        <div style={{ display: 'flex', fontSize: 42, color: '#9c9db6', marginTop: 8 }}>Blend in. Spot the liar.</div>
        <div style={{ display: 'flex', fontSize: 26, color: '#6d6e86', marginTop: 34 }}>Produced by @garethltm</div>
      </div>
    ),
    { ...size },
  );
}
