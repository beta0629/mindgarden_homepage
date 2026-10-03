import directorData from "./data/director.json";
import homeData from "./data/home.json";
import { images, spaceShots } from "./images";

const programImages = {
  "/programs/adhd-child": images.sandplay,
  "/programs/adhd-adult": images.counseling,
  "/programs/assessment": images.firstSession,
  "/programs/couple-family": images.waiting,
} as const;

export const home = {
  ...homeData,
  hero: {
    ...homeData.hero,
    image: images.hero,
  },
  programs: {
    ...homeData.programs,
    items: homeData.programs.items.map((item) => ({
      ...item,
      image: programImages[item.href as keyof typeof programImages] ?? images.counseling,
    })),
  },
  firstVisit: {
    ...homeData.firstVisit,
    image: images.firstSession,
  },
  director: {
    ...homeData.director,
    education: directorData.major,
    credentials: [directorData.major, ...homeData.director.credentials.slice(1)],
    imageNote: homeData.director.imageNote,
  },
  privacy: {
    ...homeData.privacy,
    image: images.waiting,
  },
  space: {
    ...homeData.space,
    items: spaceShots,
  },
  location: {
    ...homeData.location,
    mapImage: images.counseling,
  },
};
