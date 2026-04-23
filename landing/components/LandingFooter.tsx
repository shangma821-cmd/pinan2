import { Link } from 'react-router-dom';

export default function LandingFooter() {
  return (
    <div data-testid="landing-footer" className="landing-footer landing-surface">
      <div className="landing-footer-grid">
        <div>
          <h2 className="landing-footer-title">频安健康事业部</h2>
          <p className="landing-footer-copy">
            以 AI 细胞修复体验站为入口，把检测、干预、追踪和公平返利整合为一体化健康服务路径。
          </p>
          <p className="landing-footer-copy">依托国家"黄十字"亚健康服务体系</p>
        </div>
        <div>
          <h3 className="landing-footer-heading">产品服务</h3>
          <ul className="landing-footer-list">
            <li><Link className="landing-inline-link" to="/products">AI细胞检测修复系统</Link></li>
            <li><Link className="landing-inline-link" to="/products">智能无线手环</Link></li>
            <li><Link className="landing-inline-link" to="/products">会员套餐</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="landing-footer-heading">加盟合作</h3>
          <ul className="landing-footer-list">
            <li><Link className="landing-inline-link" to="/franchise">店中店</Link></li>
            <li><Link className="landing-inline-link" to="/franchise">标准店</Link></li>
            <li><Link className="landing-inline-link" to="/franchise">旗舰店</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="landing-footer-heading">新闻动态</h3>
          <ul className="landing-footer-list">
            <li><Link className="landing-inline-link" to="/news">行业资讯</Link></li>
            <li><Link className="landing-inline-link" to="/news">政策动态</Link></li>
            <li><Link className="landing-inline-link" to="/news">案例更新</Link></li>
          </ul>
        </div>
      </div>
      <div className="landing-footer-bottom">
        <span className="landing-footer-meta">18948301116</span>
        <span className="landing-footer-meta">Pinancs@163.com</span>
        <span className="landing-footer-meta">江苏省苏州市常熟市东南街道久隆路88号</span>
        <button
          type="button"
          data-testid="landing-back-to-top"
          aria-label="返回顶部"
          className="landing-back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          返回顶部
        </button>
      </div>
    </div>
  );
}
