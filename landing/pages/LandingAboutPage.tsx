import AboutIntroHero from '../sections/about/AboutIntroHero';
import AboutProofGrid from '../sections/about/AboutProofGrid';
import AboutQualifications from '../sections/about/AboutQualifications';
import AboutServiceExperience from '../sections/about/AboutServiceExperience';
import AboutTeamEquipment from '../sections/about/AboutTeamEquipment';
import AboutTimeline from '../sections/about/AboutTimeline';

export default function LandingAboutPage() {
  return (
    <div data-testid="landing-page-about" className="landing-page-container">
      <AboutIntroHero />
      <AboutQualifications />
      <AboutTimeline />
      <AboutTeamEquipment />
      <AboutServiceExperience />
      <AboutProofGrid />
    </div>
  );
}
