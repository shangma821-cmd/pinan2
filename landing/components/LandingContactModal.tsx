import { useEffect, useRef } from 'react';

import { useLandingContact } from '../contexts/LandingContactContext';

export default function LandingContactModal() {
  const { isOpen, close } = useLandingContact();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    };
    document.addEventListener('keydown', handleKeydown);

    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      close();
    }
  };

  return (
    <div
      data-testid="landing-contact-modal"
      className="landing-contact-modal-root"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div className="landing-contact-modal-backdrop" aria-hidden="true" />
      <div
        className="landing-contact-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="landing-contact-modal-title"
      >
        <div className="landing-contact-modal-head">
          <h3 id="landing-contact-modal-title" className="landing-contact-modal-title">
            联系我们
          </h3>
          <button
            ref={closeButtonRef}
            type="button"
            className="landing-contact-modal-close"
            aria-label="关闭"
            onClick={close}
          >
            ×
          </button>
        </div>
        <div className="landing-contact-modal-content">
          <div>
            <span className="landing-contact-modal-label">产品加盟咨询：</span>
            叶总监
          </div>
          <div>
            <span className="landing-contact-modal-label">联系电话：</span>
            <a className="landing-contact-modal-link" href="tel:18948301116">
              18948301116
            </a>
          </div>
          <div>
            <span className="landing-contact-modal-label">邮箱：</span>
            <a className="landing-contact-modal-link" href="mailto:Pinancs@163.com">
              Pinancs@163.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
