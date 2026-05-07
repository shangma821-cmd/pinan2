import { useState } from 'react';

import ProductsCases from '../sections/products/ProductsCases';
import ProductsCatalogView from '../sections/products/ProductsCatalogView';
import ProductsHero from '../sections/products/ProductsHero';
import ProductsPackagesView from '../sections/products/ProductsPackagesView';
import ProductsViewToggle from '../sections/products/ProductsViewToggle';

export default function LandingProductsPage() {
  const [activeView, setActiveView] = useState<'products' | 'packages'>('products');

  return (
    <div data-testid="landing-page-products" className="landing-page-container">
      <ProductsHero />
      <section className="landing-products-list-section">
        <div className="landing-products-list-bg" />
        <div className="landing-products-list-inner">
          <ProductsViewToggle activeView={activeView} onChange={setActiveView} />
          {activeView === 'products' ? <ProductsCatalogView /> : <ProductsPackagesView />}
        </div>
      </section>
      <ProductsCases />
    </div>
  );
}
