const variantBackgrounds = {
  site:
    "absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(240,200,105,0.12),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(58,16,16,0.7),transparent_60%),linear-gradient(135deg,rgba(20,2,2,0.9),rgba(76,25,18,0.85))]",
  admin:
    "absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(79,24,24,0.85),transparent_58%),radial-gradient(circle_at_80%_0%,rgba(43,12,12,0.85),transparent_55%),radial-gradient(circle_at_100%_80%,rgba(24,4,4,0.85),transparent_48%)]",
  default:
    "absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(43,10,10,0.95)_0%,rgba(27,6,6,0.95)_55%,rgba(20,2,2,0.9)_100%)]",
};

const variantGlows = {
  site: [
    "absolute -top-24 left-[15%] h-72 w-72 rounded-full bg-[var(--color-rose)]/18 blur-3xl",
    "absolute -bottom-32 right-[12%] h-80 w-80 rounded-full bg-[var(--color-rose-dark)]/16 blur-[220px]",
    "absolute top-[35%] right-[22%] h-64 w-64 rounded-full border border-[var(--color-rose)]/10",
  ],
  admin: [
    "absolute -top-28 left-10 h-64 w-64 rounded-full bg-[var(--color-rose)]/18 blur-3xl",
    "absolute -bottom-40 right-8 h-96 w-96 rounded-full bg-[var(--color-burgundy)]/60 blur-[230px]",
    "absolute top-1/2 left-[60%] h-[32rem] w-[32rem] -translate-y-1/2 rounded-full border border-[var(--color-rose)]/15",
  ],
  default: [
    "absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[var(--color-rose)]/14 blur-[180px]",
    "absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-[var(--color-rose-dark)]/12 blur-[200px]",
  ],
};

export default function BackgroundTexture({ variant = "default", className = "", children }) {
  const backgroundLayer = variantBackgrounds[variant] || variantBackgrounds.default;
  const glowLayers = variantGlows[variant] || variantGlows.default;

  return (
    <div
      className={["relative isolate min-h-screen overflow-hidden", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className={variantBackgrounds.default} />
        <div className={backgroundLayer} />
        {glowLayers.map((layer, index) => (
          <div key={index} className={layer} />
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(240,200,105,0.08),transparent_65%),radial-gradient(circle_at_70%_80%,rgba(248,230,180,0.05),transparent_60%)] mix-blend-screen" />
      </div>
      {children}
    </div>
  );
}
