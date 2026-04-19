type ProductsViewToggleProps = {
  activeView: 'products' | 'packages';
  onChange: (view: 'products' | 'packages') => void;
};

export default function ProductsViewToggle({ activeView, onChange }: ProductsViewToggleProps) {
  return (
    <div className="landing-toggle" aria-label="产品视图切换">
      <button
        type="button"
        className={activeView === 'products' ? 'landing-toggle-button is-active' : 'landing-toggle-button'}
        aria-pressed={activeView === 'products'}
        onClick={() => onChange('products')}
      >
        核心产品
      </button>
      <button
        type="button"
        className={activeView === 'packages' ? 'landing-toggle-button is-active' : 'landing-toggle-button'}
        aria-pressed={activeView === 'packages'}
        onClick={() => onChange('packages')}
      >
        会员套餐
      </button>
    </div>
  );
}
