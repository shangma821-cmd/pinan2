import FranchiseApplication from '../sections/franchise/FranchiseApplication';
import FranchiseGuarantees from '../sections/franchise/FranchiseGuarantees';
import FranchiseHero from '../sections/franchise/FranchiseHero';
import FranchiseModels from '../sections/franchise/FranchiseModels';
import FranchiseRevenueTable from '../sections/franchise/FranchiseRevenueTable';
import FranchiseSupport from '../sections/franchise/FranchiseSupport';

export default function LandingFranchisePage() {
  return (
    <div data-testid="landing-page-franchise" className="landing-page-container">
      <FranchiseHero />
      <section className="landing-franchise-body-section">
        <div className="landing-franchise-body-bg" />
        <div className="landing-franchise-body-inner">
          <FranchiseModels />
          <FranchiseRevenueTable />
          <div className="landing-franchise-two-col">
            <FranchiseSupport />
            <FranchiseGuarantees />
          </div>
          <FranchiseApplication />
        </div>
      </section>
    </div>
  );
}
