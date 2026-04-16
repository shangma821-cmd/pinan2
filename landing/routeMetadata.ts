export type LandingPageKey = 'home' | 'about' | 'products' | 'franchise' | 'news';

export type LandingRouteRecord = {
  key: LandingPageKey;
  path: '/' | '/about' | '/products' | '/franchise' | '/news';
  name: '首页' | '关于我们' | '产品服务' | '加盟合作' | '新闻动态';
};

export const landingRouteMetadata: LandingRouteRecord[] = [
  { key: 'home', path: '/', name: '首页' },
  { key: 'about', path: '/about', name: '关于我们' },
  { key: 'products', path: '/products', name: '产品服务' },
  { key: 'franchise', path: '/franchise', name: '加盟合作' },
  { key: 'news', path: '/news', name: '新闻动态' },
];
