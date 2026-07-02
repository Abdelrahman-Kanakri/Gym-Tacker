import type { ReactNode } from 'react';
import HudCorners from './HudCorners';

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-5 py-10">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 15% 0%, rgba(46,230,214,0.08), transparent 45%), radial-gradient(circle at 85% 100%, rgba(46,230,214,0.05), transparent 40%)',
        }}
      />
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-baseline justify-center gap-2">
          <div className="glow-cyan h-2.5 w-2.5 rounded-[2px] bg-cyan" />
          <h1 className="font-heading m-0 text-2xl leading-none font-black tracking-tight uppercase">
            IRON<span className="text-cyan">LOG</span>
          </h1>
        </div>

        <div className="relative rounded-xl border border-border bg-surface p-7 shadow-2xl shadow-black/40">
          <HudCorners className="m-1.5 opacity-60" />
          <h2 className="m-0 mb-1 text-lg font-semibold">{title}</h2>
          <p className="m-0 mb-6 text-sm text-text-faint">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
