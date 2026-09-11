import { MOB_COMPASS_MODES } from "@treasure-compass/mob-domain";

export function App() {
  return (
    <main className="shell">
      <section className="panel" aria-labelledby="app-title">
        <p className="eyebrow">FFXIV モブハント</p>
        <h1 id="app-title">Mob Compass</h1>
        <p>ソロとパーティ、それぞれの巡回を扱う独立アプリです。</p>
        <p className="status">
          利用モード:{" "}
          {MOB_COMPASS_MODES.map((mode) =>
            mode === "solo" ? "ソロ" : "パーティ",
          ).join(" / ")}
        </p>
      </section>
    </main>
  );
}
