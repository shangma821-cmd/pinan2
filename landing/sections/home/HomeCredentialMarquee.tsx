const credentialItems = [
  '国家认证 · 技术领先 · 值得信赖',
  '二类医疗器械认证',
  '3项国家发明专利',
  '30项计算机软著',
];

export default function HomeCredentialMarquee() {
  return (
    <section data-testid="home-credentials" className="landing-section">
      <p className="landing-kicker">国家认证 · 技术领先 · 值得信赖</p>
      <div className="landing-grid-4">
        {credentialItems.map((item) => (
          <div key={item} className="landing-card">
            <h3>{item}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}
