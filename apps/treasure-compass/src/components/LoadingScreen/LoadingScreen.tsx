export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950">
      <div className="relative size-16">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="absolute size-[33%] animate-[foldCube_2.4s_infinite_linear_both]"
            style={{
              '--cube-delay': `${(i % 3) * 0.3 + Math.floor(i / 3) * 0.9}s`,
              animationDelay: 'var(--cube-delay)',
              top: `${Math.floor(i / 3) * 33.33}%`,
              left: `${(i % 3) * 33.33}%`,
            } as React.CSSProperties}
          >
            <div className="size-full origin-[100%_100%] rotate-z-0 bg-sky-400 animate-[foldCubeAngle_2.4s_infinite_linear_both]" />
          </div>
        ))}
      </div>
      <p className="mt-8 text-sky-300 text-sm tracking-widest animate-pulse">
        マップデータを読み込んでいます...
      </p>
    </div>
  );
}
