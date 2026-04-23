import { LANDING_ASSET_MODE } from './runtimeConfig';
import aboutImage from '../public/entry-station/about-img.jpg';
import caseElderly from '../public/entry-station/case-elderly.jpg';
import caseEnergy from '../public/entry-station/case-energy.jpg';
import caseMenopause from '../public/entry-station/case-menopause.jpg';
import caseNeck from '../public/entry-station/case-neck.jpg';
import casePain from '../public/entry-station/case-pain.jpg';
import caseSleep from '../public/entry-station/case-sleep.jpg';
import equipmentDetail from '../public/entry-station/equipment-detail.jpg';
import franchiseHero from '../public/entry-station/franchise-hero.jpg';
import heroBg from '../public/entry-station/hero-bg.jpg';
import lifestyleSmart from '../public/entry-station/lifestyle-smart.jpg';
import newsAiHealth from '../public/entry-station/news-ai-health.jpg';
import newsAward from '../public/entry-station/news-award.jpg';
import newsCellRepair from '../public/entry-station/news-cell-repair.jpg';
import newsCertification from '../public/entry-station/news-certification.jpg';
import newsMarket from '../public/entry-station/news-market.jpg';
import newsOpening from '../public/entry-station/news-opening.jpg';
import productBand from '../public/entry-station/product-band.jpg';
import productDetection from '../public/entry-station/product-detection.jpg';
import productWater from '../public/entry-station/product-water.jpg';
import serviceScene from '../public/entry-station/service-scene.jpg';
import storeFrontNew from '../public/entry-station/store-front-new.jpg';
import successCase1 from '../public/entry-station/success-case-1.jpg';
import teamPhoto from '../public/entry-station/team-photo.jpg';
import techSpectrum from '../public/entry-station/tech-spectrum.jpg';
import whyChoose from '../public/entry-station/why-choose.jpg';

const bundledAssetPaths = {
  heroBg,
  storeFrontNew,
  aboutImage,
  teamPhoto,
  equipmentDetail,
  serviceScene,
  productDetection,
  productBand,
  productWater,
  franchiseHero,
  successCase1,
  lifestyleSmart,
  techSpectrum,
  whyChoose,
  caseSleep,
  casePain,
  caseEnergy,
  caseElderly,
  caseNeck,
  caseMenopause,
  newsAiHealth,
  newsCellRepair,
  newsAward,
  newsCertification,
  newsMarket,
  newsOpening,
} as const;

const publicAssetPaths = {
  heroBg: '/entry-station/hero-bg.jpg',
  storeFrontNew: '/entry-station/store-front-new.jpg',
  aboutImage: '/entry-station/about-img.jpg',
  teamPhoto: '/entry-station/team-photo.jpg',
  equipmentDetail: '/entry-station/equipment-detail.jpg',
  serviceScene: '/entry-station/service-scene.jpg',
  productDetection: '/entry-station/product-detection.jpg',
  productBand: '/entry-station/product-band.jpg',
  productWater: '/entry-station/product-water.jpg',
  franchiseHero: '/entry-station/franchise-hero.jpg',
  successCase1: '/entry-station/success-case-1.jpg',
  lifestyleSmart: '/entry-station/lifestyle-smart.jpg',
  techSpectrum: '/entry-station/tech-spectrum.jpg',
  whyChoose: '/entry-station/why-choose.jpg',
  caseSleep: '/entry-station/case-sleep.jpg',
  casePain: '/entry-station/case-pain.jpg',
  caseEnergy: '/entry-station/case-energy.jpg',
  caseElderly: '/entry-station/case-elderly.jpg',
  caseNeck: '/entry-station/case-neck.jpg',
  caseMenopause: '/entry-station/case-menopause.jpg',
  newsAiHealth: '/entry-station/news-ai-health.jpg',
  newsCellRepair: '/entry-station/news-cell-repair.jpg',
  newsAward: '/entry-station/news-award.jpg',
  newsCertification: '/entry-station/news-certification.jpg',
  newsMarket: '/entry-station/news-market.jpg',
  newsOpening: '/entry-station/news-opening.jpg',
} as const;

export const landingAssetPaths =
  LANDING_ASSET_MODE === 'bundled' ? bundledAssetPaths : publicAssetPaths;
