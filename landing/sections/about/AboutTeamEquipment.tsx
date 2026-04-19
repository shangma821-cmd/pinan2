import { landingAssetPaths } from '../../assets';

export default function AboutTeamEquipment() {
  return (
    <section className="landing-section">
      <p className="landing-kicker">团队与空间</p>
      <h2 className="landing-section-title">专业团队与设备</h2>
      <div className="landing-photo-stack">
        <article className="landing-photo-card">
          <img src={landingAssetPaths.teamPhoto} alt="专业团队与设备团队现场" />
        </article>
        <article className="landing-photo-card">
          <img src={landingAssetPaths.equipmentDetail} alt="专业团队与设备器械细节" />
        </article>
      </div>
    </section>
  );
}
