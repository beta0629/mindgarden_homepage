import homeData from "./data/home.json";
import pricingData from "./data/pricing.json";
import { images } from "./images";

const menuByName = new Map(pricingData.menu.map((item) => [item.name, item]));

function menus(names: string[]) {
  return names.flatMap((name) => {
    const item = menuByName.get(name);
    return item ? [item] : [];
  });
}

const shared = {
  flowTitle: "진행 방식",
  forTitle: "이런 분께",
  costTitle: "회기와 비용",
  cta: "이 프로그램 예약",
  back: "전체 프로그램",
} as const;

export const programsPage = {
  eyebrow: homeData.programs.eyebrow,
  title: "상담 프로그램",
  lead: "연령과 상황에 맞춰 검사와 상담을 조합합니다. 한 사람의 어려움을 하나의 이름표로 단정하지 않습니다.",
  more: homeData.programs.more,
  bookingLabel: homeData.hero.primaryCta,
};

const detail = {
  "adhd-child": {
    lead: "학교와 가정에서 흔들리는 주의력과 행동 조절. 아이의 기질과 환경을 함께 보고, 보호자와 같은 목표를 세워 생활 루틴을 다시 잡습니다.",
    forWhom: [
      "수업 집중이 어렵다는 이야기를 자주 듣는 경우",
      "숙제·준비물 챙기기로 매일 갈등이 생기는 경우",
      "또래 관계에서 충동적인 반응이 반복되는 경우",
    ],
    flow: "초기 면담으로 학교와 가정의 장면을 듣고, 필요하면 주의력·정서 검사를 진행합니다. 보호자와 목표를 맞춘 뒤 상담과 생활 루틴을 이어 갑니다.",
    menuNames: ["아동,청소년,성인 심층상담 (50분)", "ADHD 검사(A.B.C) 선택형"],
  },
  "adhd-adult": {
    lead: "늦게 알아차린 산만함, 미루기, 감정 소진. 직장과 관계의 맥락에서 나에게 맞는 실행 전략을 찾습니다.",
    forWhom: [
      "마감 직전까지 시작이 어려운 경우",
      "여러 일을 벌이고 마무리가 어려운 경우",
      "성인이 되어 ADHD 가능성을 처음 알게 된 경우",
    ],
    flow: "지금의 생활 패턴을 함께 정리하고, 필요하면 표준화 검사로 특성을 확인합니다. 결과는 상담으로 풀어 설명하고, 실행 가능한 전략으로 옮깁니다.",
    menuNames: ["아동,청소년,성인 심층상담 (50분)", "ADHD 검사(A.B.C) 선택형"],
  },
  assessment: {
    lead: "CAT·TCI·MMPI·SCT 등 표준화 검사로 지금의 강점과 어려움을 객관적으로 정리하고, 결과는 상담으로 풀어 설명합니다.",
    forWhom: [
      "지금 상태를 검사로 정확히 이해하고 싶은 경우",
      "상담 방향을 정하기 전에 객관적인 자료가 필요한 경우",
      "ADHD, 기질, 성격, 정서 특성을 함께 보고 싶은 경우",
    ],
    flow: "목적에 맞는 검사를 고르고, 센터에서 진행합니다. 결과 확인 후 해석 상담으로 의미와 이후 방향을 설명합니다. 검사 결과만으로 특정 진단이 확정되지는 않습니다.",
    menuNames: [
      "기질성격정서 검사(50분) l 쿠폰가",
      "ADHD 검사(A.B.C) 선택형",
      "부모.자녀/커플.부부기질검사(60분)",
    ],
  },
  "couple-family": {
    lead: "반복되는 갈등과 끊어진 대화. 관계의 패턴을 이해하고 다시 연결되는 방법을 함께 연습합니다.",
    forWhom: ["반복되는 다툼", "신뢰 회복", "양육관 차이", "가족 갈등"],
    flow: "관계의 장면을 함께 듣고, 필요하면 애착·기질 검사를 더합니다. 60분 상담에서 패턴을 이해하고 대화 방식을 연습합니다.",
    menuNames: ["커플/부부상담 (60분)", "부모.자녀/커플.부부기질검사(60분)"],
  },
  "child-youth": {
    lead: "말로 다 하기 어려운 마음은 놀이와 모래, 그림으로 먼저 만납니다.",
    forWhom: ["불안·위축", "분노 조절", "학교 적응", "부모-자녀 갈등"],
    flow: "아동·청소년은 놀이, 모래, 미술로 마음을 표현하고, 보호자 면담을 병행합니다. 목표는 첫 만남에서 함께 정합니다.",
    menuNames: ["아동,청소년,성인 심층상담 (50분)"],
  },
  adult: {
    lead: "우울과 불안, 관계의 반복되는 패턴, 번아웃. 50분의 온전한 시간 안에서 나를 다시 이해합니다.",
    forWhom: ["우울·불안", "트라우마", "직장 스트레스", "자기이해"],
    flow: "개인 심층상담 50분으로 진행합니다. 필요하면 심리검사로 현재 상태를 정리한 뒤, 상담 목표와 간격을 함께 정합니다.",
    menuNames: ["아동,청소년,성인 심층상담 (50분)", "기질성격정서 검사(50분) l 쿠폰가"],
  },
} as const;

const cards = {
  "adhd-child": homeData.programs.items[0],
  "adhd-adult": homeData.programs.items[1],
  assessment: homeData.programs.items[2],
  "couple-family": homeData.programs.items[3],
  "child-youth": {
    tag: "아동 · 청소년",
    title: "아동·청소년 상담",
    desc: "말로 다 하기 어려운 마음은 놀이와 모래, 그림으로 먼저 만납니다.",
    href: "/programs/child-youth",
  },
  adult: {
    tag: "성인",
    title: "성인 개인상담",
    desc: "우울과 불안, 관계의 반복되는 패턴, 번아웃. 50분의 온전한 시간 안에서 나를 다시 이해합니다.",
    href: "/programs/adult",
  },
} as const;

const programImages = {
  "adhd-child": images.sandplay,
  "adhd-adult": images.counseling,
  assessment: images.firstSession,
  "couple-family": images.waiting,
  "child-youth": images.sandplay,
  adult: images.counseling,
} as const;

export const programs = (Object.keys(detail) as (keyof typeof detail)[]).map((slug) => {
  const card = cards[slug];
  const extra = detail[slug];
  return {
    slug,
    href: card.href,
    tag: card.tag,
    title: card.title,
    desc: card.desc,
    lead: extra.lead,
    forWhom: extra.forWhom,
    flow: extra.flow,
    image: programImages[slug],
    prices: menus([...extra.menuNames]),
    labels: shared,
  };
});

export function programBySlug(slug: string) {
  return programs.find((program) => program.slug === slug);
}
