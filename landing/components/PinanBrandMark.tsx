type PinanBrandMarkProps = {
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'inverse';
};

const pinanLogoSrc = '/entry-station/pinan-logo-pc.svg';

export default function PinanBrandMark({
  className = '',
  showText = true,
  variant = 'default',
}: PinanBrandMarkProps) {
  return (
    <span
      className={[
        'pinan-brand-lockup',
        showText ? 'pinan-brand-lockup--with-text' : 'pinan-brand-lockup--mark-only',
        variant === 'inverse' ? 'pinan-brand-lockup--inverse' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      <span className="pinan-brand-symbol" aria-hidden="true">
        <img src={pinanLogoSrc} alt="" decoding="async" />
      </span>
      {showText ? (
        <span className="pinan-brand-copy">
          <span className="pinan-brand-name">频安科技</span>
          <span className="pinan-brand-subtitle">健康平安 · PINAN Technology</span>
        </span>
      ) : null}
    </span>
  );
}
