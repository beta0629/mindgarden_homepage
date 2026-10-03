/** Open brand stroke on the paper hero. The path stays open. */
export function HeroStillLife() {
  return (
    <svg className="hero-still" viewBox="0 0 1440 860" aria-hidden="true">
      <path
        className="hero-open-stroke"
        data-open-stroke="hero"
        pathLength={1}
        d="M 48 280 C 120 150, 270 150, 240 270 C 210 390, 70 370, 90 250 C 120 140, 340 120, 520 230 C 640 300, 600 360, 540 400 C 500 430, 597 332, 627 372"
      />
    </svg>
  );
}
