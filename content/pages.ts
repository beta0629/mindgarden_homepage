import directorData from "./data/director.json";
import homeData from "./data/home.json";
import pricingData from "./data/pricing.json";

export const aboutPage = {
  title: "마음이 자라는 정원, 마인드가든",
  lead: "마인드가든은 송도에서 아동·청소년, 성인, 부부와 가족의 마음을 돌보는 심리상담센터입니다. 표준화된 심리검사로 지금의 상태를 정확히 이해하고, 한 사람의 속도에 맞춘 상담으로 일상의 회복을 돕습니다.",
  ways: {
    eyebrow: "Approach",
    title: "우리가 일하는 방식",
    items: [
      {
        title: "검사로 이해하고, 상담으로 회복합니다",
        desc: "표준화된 심리검사로 지금의 상태를 이해하고, 상담으로 일상의 회복을 돕습니다.",
      },
      {
        title: "이름표보다 사람을 먼저 봅니다",
        desc: "한 사람의 어려움을 하나의 이름표로 단정하지 않습니다.",
      },
      {
        title: "보호자와 가족을 함께 봅니다",
        desc: "아동·청소년 상담에서는 필요에 따라 보호자 면담을 병행합니다.",
      },
    ],
  },
  directorCta: homeData.director.cta,
};

export const directorPage = {
  title: `${directorData.role} ${directorData.name}`,
  lead: directorData.homeSummary.closing,
  quote: directorData.homeSummary.quote,
  sections: [
    { title: "상담 분야", items: directorData.counselingAreas },
    { title: "전공", text: directorData.major },
    { title: "전문 자격", items: directorData.licenses },
    { title: "강의 및 상담 경력", items: directorData.career },
    { title: "교육 수료 및 이수", text: directorData.training },
    { title: "집단상담 및 강의", text: directorData.homeSummary.groupAndLectures },
  ],
  photoNote: directorData.photo.note,
  bookingCta: homeData.hero.primaryCta,
};

export const firstVisitPage = {
  title: "처음 오시는 분께",
  lead: "상담실 문을 여는 일이 가장 어렵다는 것을 압니다. 오시기 전 궁금한 것들을 미리 정리했습니다.",
  steps: [
    { no: "01", title: "예약", desc: "전화·문자, 네이버 예약, 네이버 톡톡으로 희망 시간을 알려 주세요." },
    { no: "02", title: "확인", desc: "센터에서 확인 전화를 드리고, 일정이 확정되면 방문 안내를 드립니다." },
    { no: "03", title: "도착", desc: "아크리아2 지하 1~2층에 무료 주차가 가능합니다. 만차 시 연결된 아크리아1 주차장을 이용해 주세요." },
    { no: "04", title: "첫 마음산책", desc: "온라인 사전 검사 1종과 센터 방문 1:1 해석 상담 30분으로 이후 방향을 함께 정합니다." },
  ],
  prepareTitle: "준비물",
  prepare: ["따로 챙기실 준비물은 없습니다.", "아동은 보호자와 함께 오시면 됩니다."],
};

export const pricingPage = {
  title: "가격과 예약 안내",
  lead: "가격은 네이버 플레이스 메뉴를 기준으로 안내합니다. 검사 구성과 상담 유형에 따라 달라질 수 있으며, 정확한 금액은 예약 확인 전화에서 안내드립니다.",
  menuTitle: "상담·검사 메뉴",
  policyTitle: "예약 안내",
  paymentTitle: "결제 수단",
  voucher: pricingData.vouchers.text,
  policies: pricingData.bookingPolicy.found,
  payment: pricingData.payment,
  menu: pricingData.menu,
  bookingCta: homeData.hero.primaryCta,
};

export const locationPage = {
  title: homeData.location.title,
  lead: "송도 아크리아2 2층. 건물 안 무료 주차로 오시면 됩니다.",
  mapCta: "네이버 지도에서 보기",
};

export const contactPage = {
  title: "상담 문의",
};

export const privacyPage = {
  path: "/privacy",
};
