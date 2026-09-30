export type Media = {
  src: string;
  alt: string;
};

export const images = {
  hero: {
    src: "/images/center-109.jpg",
    alt: "창가로 저녁빛이 드는 마인드가든 개인상담실",
  },
  counseling: {
    src: "/images/center-001.jpg",
    alt: "원목 책상과 흰 의자가 놓인 개인상담실",
  },
  waiting: {
    src: "/images/center-025.jpg",
    alt: "대칭 구도의 조용한 대기 라운지",
  },
  sandplay: {
    src: "/images/center-046.jpg",
    alt: "모래놀이 상자와 피규어가 놓인 놀이치료 공간",
  },
  firstSession: {
    src: "/images/center-038.jpg",
    alt: "원형 조명 거울 앞의 피치색 작약",
  },
} as const satisfies Record<string, Media>;

export const spaceShots = [
  { ...images.hero, caption: "개인상담실", size: "tall" },
  { ...images.waiting, caption: "대기 라운지", size: "base" },
  { ...images.sandplay, caption: "모래놀이 치료", size: "base" },
  { ...images.counseling, caption: "상담 책상", size: "base" },
  { ...images.firstSession, caption: "첫 상담", size: "base" },
] as const;
