type ProductsViewToggleProps = {
  activeView: 'products' | 'packages';
  onChange: (view: 'products' | 'packages') => void;
};

export default function ProductsViewToggle({ activeView, onChange }: ProductsViewToggleProps) {
  return (
    <div className="landing-products-toggle" aria-label="产品视图切换">
      <button
        type="button"
        className={`landing-products-toggle-btn${activeView === 'products' ? ' is-active' : ''}`}
        aria-pressed={activeView === 'products'}
        onClick={() => onChange('products')}
      >
        核心产品
      </button>
      <button
        type="button"
        className={`landing-products-toggle-btn${activeView === 'packages' ? ' is-active' : ''}`}
        aria-pressed={activeView === 'packages'}
        onClick={() => onChange('packages')}
      >
        会员套餐
      </button>
    </div>
  );
}
