export default function Loader() {
  return (
    <div className="flex h-screen items-center justify-center bg-bg">
      <div className="flex items-center gap-3 text-text-faint">
        <span className="h-2 w-2 animate-pulse rounded-sm bg-cyan shadow-[0_0_12px_rgba(46,230,214,0.5)]" />
        <span className="font-mono text-xs uppercase tracking-widest">Loading</span>
      </div>
    </div>
  );
}
