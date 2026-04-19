import HomeAdvantages from '../sections/home/HomeAdvantages';
import HomeClosingCta from '../sections/home/HomeClosingCta';
import HomeCredentialMarquee from '../sections/home/HomeCredentialMarquee';
import HomeHero from '../sections/home/HomeHero';
import HomeNewsPreview from '../sections/home/HomeNewsPreview';
import HomePainPoints from '../sections/home/HomePainPoints';
import HomeProcess from '../sections/home/HomeProcess';
import HomeResults from '../sections/home/HomeResults';

export default function LandingHomePage() {
  return (
    <div data-testid="landing-page-home" className="landing-page-container">
      <HomeHero />
      <HomeCredentialMarquee />
      <HomePainPoints />
      <HomeAdvantages />
      <HomeProcess />
      <HomeResults />
      <HomeNewsPreview />
      <HomeClosingCta />
    </div>
  );
}
