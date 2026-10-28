import localFont from "next/font/local";

export const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
  preload: true,
  fallback: ["Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", "sans-serif"],
  adjustFontFallback: false,
});
