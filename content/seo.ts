import { faq } from "./faq";
import { home } from "./home";
import { site } from "@/config/site";
import { siteUrl } from "@/config/env";
import { images } from "./images";

export const seo = {
  titleTemplate: `%s | ${site.shortName}`,
  locale: "ko_KR",
  homeTitle: home.meta.title,
  homeDescription: home.meta.description,
  image: images.hero,
  pages: {
    about: {
      title: "센터 소개",
      description: "송도 마인드가든의 상담 철학, 비밀보장, 실제 공간입니다.",
    },
    director: {
      title: "대표원장 김선희",
      description: "대표원장 김선희의 학력, 자격, 임상 경력과 상담 분야입니다.",
    },
    programs: {
      title: "상담 프로그램",
      description: "아동·청소년 ADHD, 성인·여성 ADHD, 심리검사, 부부·가족상담 프로그램입니다.",
    },
    pricing: {
      title: "가격·예약",
      description: "첫 마음산책, 심층상담, 심리검사 가격과 네이버 예약 안내입니다.",
    },
    firstVisit: {
      title: "처음 오시는 분",
      description: "예약부터 첫 마음산책까지, 첫 방문 전에 알아 두면 좋은 안내입니다.",
    },
    faq: {
      title: "자주 묻는 질문",
      description: "비용, 비밀보장, 예약, 주차, 검사와 진단에 대한 질문입니다.",
    },
    location: {
      title: "오시는 길",
      description: "인천 송도 아크리아2 2층 204호. 운영시간, 주차, 대중교통 안내입니다.",
    },
    contact: {
      title: "상담 문의",
      description: "전화가 어려우시면 문의 폼으로 연락처를 남겨 주세요. 개인정보 동의가 필요합니다.",
    },
    privacy: {
      title: "개인정보처리방침",
      description: "마인드가든 심리상담센터 개인정보처리방침 초안입니다.",
    },
  },
};

export const localBusiness = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  name: site.name,
  url: siteUrl,
  telephone: site.contact.phoneMain.label,
  email: site.contact.email.label,
  image: `${siteUrl}${images.hero.src}`,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.postal.streetAddress,
    addressLocality: site.address.postal.addressLocality,
    addressRegion: site.address.postal.addressRegion,
    addressCountry: site.address.postal.addressCountry,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: site.geo.lat,
    longitude: site.geo.lng,
  },
  openingHoursSpecification: site.hours.spec.map((row) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: row.days,
    opens: row.opens,
    closes: row.closes,
  })),
  sameAs: [site.links.blog.href, site.links.youtube.href, site.links.place.href],
};

export const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};
