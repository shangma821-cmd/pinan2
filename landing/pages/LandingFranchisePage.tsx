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
      <FranchiseModels />
      <FranchiseRevenueTable />
      <FranchiseSupport />
      <FranchiseGuarantees />
      <FranchiseApplication />
    </div>
  );
}
