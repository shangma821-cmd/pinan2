import { landingAssetPaths } from '../assets';

export type LandingNewsCategory = '全部' | '行业动态' | '科研成果' | '公司新闻';

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
  '科研成果',
  '公司新闻',
];

export const landingNewsArticles: LandingNewsArticle[] = [
  {
    id: 1,
    title: '频谱治疗的未来发展趋势',
    excerpt: '随着人工智能和大数据技术的融入，频谱治疗正在迎来新的发展机遇，行业正在从单点体验走向持续健康服务。',
    image: landingAssetPaths.newsAiHealth,
    date: '2024-01-15',
    category: '行业动态',
    author: '频安健康研究院',
    readTime: '8分钟',
    content: [
      '频谱治疗作为一种非侵入式的健康干预手段，近年来正在加速进入家庭健康管理与门店服务协同场景。',
      '伴随 AI 诊断辅助和数据追踪能力的引入，服务机构不再只提供一次性体验，而是能够围绕检测、修复、追踪与复盘建立更连续的用户旅程。',
      '这类趋势对门店的意义在于，健康服务正在从项目制消费走向长期经营，复购与转介绍都更容易被持续激发。',
    ],
  },
  {
    id: 2,
    title: '细胞修复技术突破性研究',
    excerpt: '最新研究表明，特定频段的电磁波能够显著加速细胞再生过程，为慢性问题的长期改善带来新方向。',
    image: landingAssetPaths.newsCellRepair,
    date: '2024-01-10',
    category: '科研成果',
    author: '频安健康科研团队',
    readTime: '10分钟',
    content: [
      '一项围绕细胞修复的最新研究显示，特定频段的干预可以更稳定地促进局部循环、恢复效率与整体代谢平衡。',
      '研究团队指出，技术价值不只在单次体验结果，更在于能否把检测、干预和后续追踪串联为完整方案。',
      '对于门店经营者而言，这意味着健康服务的交付不再停留在概念层面，而是能被拆解成看得见、可追踪、可复盘的服务流程。',
    ],
  },
  {
    id: 3,
    title: '频安健康荣获创新企业奖',
    excerpt: '凭借在数智中医与亚健康服务领域的持续投入，频安健康获评年度最具创新力服务品牌。',
    image: landingAssetPaths.newsAward,
    date: '2024-01-05',
    category: '公司新闻',
    author: '频安健康品牌部',
    readTime: '5分钟',
    content: [
      '在年度健康产业峰会上，频安健康凭借 AI 细胞修复体验站模式与数据化健康管理方法，获得创新企业奖项。',
      '评审认为，品牌真正的优势不只是设备本身，而是把体验、追踪、复盘与经营逻辑结合成一套可复制的门店模型。',
      '这类认可进一步提升了品牌公信力，也为加盟合作与门店复制提供了更稳定的信任背书。',
    ],
  },
  {
    id: 4,
    title: '国家黄十字亚健康服务体系升级',
    excerpt: '国家黄十字亚健康服务体系迎来重要升级，更多标准化服务流程和认证要求被进一步明确。',
    image: landingAssetPaths.newsCertification,
    date: '2023-12-28',
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
    date: '2023-12-20',
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
    title: '频安健康深圳首家旗舰店开业',
    excerpt: '频安健康深圳首家旗舰店正式开业，标志着品牌在重点城市的体验站布局迈出关键一步。',
    image: landingAssetPaths.newsOpening,
    date: '2023-12-15',
    category: '公司新闻',
    author: '频安健康运营部',
    readTime: '4分钟',
    content: [
      '深圳旗舰店集检测、体验、咨询与后续跟踪于一体，为本地用户提供更完整的健康管理入口。',
      '新店不仅承担品牌展示功能，也承担门店经营模型验证与服务流程迭代任务，为后续复制提供真实场景样本。',
      '品牌团队表示，未来会继续围绕重点城市和高潜力区域完善体验网络，让更多门店以标准化方式快速落地。',
    ],
  },
];
