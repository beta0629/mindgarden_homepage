/** White line armchair and a closed book. The thick stroke is a separate open path. */
export function ChairBook() {
  return (
    <svg className="chair-still" viewBox="0 0 1440 820" aria-hidden="true">
      <g className="still-ink">
        <path d="M 78 470 L 78 300 C 78 240, 120 201, 172 201 C 224 201, 268 240, 268 300 L 268 455" />
        <path d="M 108 448 L 108 312 C 108 268, 138 238, 172 238 C 206 238, 236 268, 236 312 L 236 442" />
        <path d="M 78 340 C 40 360, 28 420, 46 490" />
        <path d="M 268 330 C 330 350, 356 420, 338 500" />
        <path d="M 46 490 C 120 450, 270 455, 338 500" />
        <path d="M 52 512 C 140 555, 280 550, 332 508" />
        <path d="M 64 520 L 48 700" />
        <path d="M 322 518 L 344 710" />
        <path d="M 140 530 L 128 690" />
        <path d="M 270 528 L 284 698" />
        <path d="M 150 478 L 246 462 L 258 500 L 162 516 Z" />
        <path d="M 158 496 L 250 480" />
        <path d="M 162 484 L 170 510" />
      </g>
      <path
        className="news-open-stroke"
        data-open-stroke="news"
        pathLength={1}
        d="M 172 201 C 252 41, 678 215, 858 175"
      />
    </svg>
  );
}
