import { landingAssetPaths } from '../assets';

export type LandingNewsCategory = '全部' | '行业动态' | '应用观察' | '公司新闻';

export type LandingNewsArticle = {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: Exclude<LandingNewsCategory, '全部'>;
  author: string;
  readTime: string;
  content: string[];
};

export const landingNewsCategories: LandingNewsCategory[] = [
  '全部',
  '行业动态',
  '应用观察',
  '公司新闻',
];

export const landingNewsArticles: LandingNewsArticle[] = [
  {
    id: 1,
    title: '频谱健康管理的未来发展趋势',
    excerpt: '随着人工智能和数据技术的融入，频谱健康管理正在迎来新的发展机遇，行业正在从单点体验走向持续服务。',
    image: landingAssetPaths.newsAiHealth,
    date: '2025-12-15',
    category: '行业动态',
    author: '频安科技研究中心',
    readTime: '8分钟',
    content: [
      '频谱健康管理作为一种面向日常状态管理的服务方式，近年来正在加速进入家庭健康管理与门店服务协同场景。',
      '伴随 AI 分析和数据追踪能力的引入，服务机构不再只提供一次性体验，而是能够围绕评估、方案、追踪与复盘建立更连续的用户旅程。',
      '这类趋势对门店的意义在于，健康服务正在从项目制消费走向长期经营，复购与转介绍都更容易被持续激发。',
    ],
  },
  {
    id: 2,
    title: '频谱节律健康管理应用观察',
    excerpt: '围绕特定频段与人体节律的应用观察持续推进，为健康状态管理、生活方式服务和数据追踪带来新方向。',
    image: landingAssetPaths.newsCellRepair,
    date: '2025-12-10',
    category: '应用观察',
    author: '频安科技技术团队',
    readTime: '10分钟',
    content: [
      '围绕频谱节律调理体验的应用观察显示，特定频段、服务流程与数据记录结合后，更有利于建立可持续的健康管理体验。',
      '团队指出，技术价值不只在单次体验感受，更在于能否把评估、方案和后续追踪串联为完整流程。',
      '对于门店经营者而言，这意味着健康服务的交付不再停留在概念层面，而是能被拆解成看得见、可追踪、可复盘的服务流程。',
    ],
  },
  {
    id: 3,
    title: '频安科技荣获创新企业奖',
    excerpt: '凭借在数智健康与智慧服务领域的持续投入，频安科技获评年度最具创新力服务品牌。',
    image: landingAssetPaths.newsAward,
    date: '2025-12-05',
    category: '公司新闻',
    author: '频安科技品牌部',
    readTime: '5分钟',
    content: [
      '在年度健康产业峰会上，频安科技凭借 AI健康评估体验站模式与数据化健康管理方法，获得创新企业奖项。',
      '评审认为，品牌真正的优势不只是设备本身，而是把体验、追踪、复盘与经营逻辑结合成一套可复制的门店模型。',
      '这类认可进一步提升了品牌公信力，也为加盟合作与门店复制提供了更稳定的信任背书。',
    ],
  },
  {
    id: 4,
    title: '健康服务流程持续升级',
    excerpt: '健康服务门店正在进一步明确标准化服务流程和管理要求，推动体验、记录与跟进更加规范。',
    image: landingAssetPaths.newsCertification,
    date: '2025-11-28',
    category: '行业动态',
    author: '健康产业观察',
    readTime: '6分钟',
    content: [
      '本轮体系升级进一步强调了门店服务的规范性、流程透明度以及持续追踪能力。',
      '对行业来说，这意味着未来的竞争重点将不再只是单次引流，而是用户长期留存、服务可见性和结果可复盘性。',
      '对于具备标准化服务路径的门店而言，这样的升级也会让既有优势更容易被用户和合作方看见。',
    ],
  },
  {
    id: 5,
    title: '智能健康设备市场持续增长',
    excerpt: '行业报告显示，智能健康设备市场规模未来几年仍将持续扩大，家庭健康场景的接受度不断提高。',
    image: landingAssetPaths.newsMarket,
    date: '2025-11-20',
    category: '行业动态',
    author: '市场研究部',
    readTime: '7分钟',
    content: [
      '随着用户健康意识提高，智能手环、家庭健康设备与线下服务联动场景正在持续增长。',
      '报告指出，用户越来越看重“到店体验 + 家庭延续 + 数据追踪”的组合式服务，而不是孤立产品。',
      '这也验证了体验站模式的方向：服务能力越闭环，用户越容易感知价值，门店也更容易建立可持续收益结构。',
    ],
  },
  {
    id: 6,
    title: '频安科技深圳首家旗舰店开业',
    excerpt: '频安科技深圳首家旗舰店正式开业，标志着品牌在重点城市的体验站布局迈出关键一步。',
    image: landingAssetPaths.newsOpening,
    date: '2025-11-15',
    category: '公司新闻',
    author: '频安科技运营部',
    readTime: '4分钟',
    content: [
      '深圳旗舰店集评估、体验、咨询与后续跟踪于一体，为本地用户提供更完整的健康管理入口。',
      '新店不仅承担品牌展示功能，也承担门店经营模型验证与服务流程迭代任务，为后续复制提供真实场景样本。',
      '品牌团队表示，未来会继续围绕重点城市和高潜力区域完善体验网络，让更多门店以标准化方式快速落地。',
    ],
  },
];
