const qualifications = [
  '国家黄十字亚健康服务体系',
  '二类医疗器械认证',
  '3项国家发明专利',
  '30项计算机软著',
];

export default function AboutQualifications() {
  return (
    <section className="landing-section">
      <p className="landing-kicker">品牌资质</p>
      <h2 className="landing-section-title">权威资质认证</h2>
      <div className="landing-qualification-grid">
        {qualifications.map((item) => (
          <article key={item} className="landing-qualification-card">
            <span className="landing-badge">认证</span>
            <h3 className="landing-card-title">{item}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
