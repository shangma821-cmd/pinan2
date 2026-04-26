function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function FranchiseApplication() {
  return (
    <div data-testid="franchise-application" className="landing-franchise-form-block">
      <h3 className="landing-franchise-form-title">立即申请加盟</h3>
      <div className="landing-franchise-form-grid">
        <form className="landing-franchise-form" onSubmit={(e) => e.preventDefault()}>
          <div className="landing-franchise-form-row">
            <div className="landing-franchise-field">
              <label htmlFor="franchise-name">姓名</label>
              <input id="franchise-name" name="name" placeholder="请输入您的姓名" />
            </div>
            <div className="landing-franchise-field">
              <label htmlFor="franchise-phone">电话</label>
              <input id="franchise-phone" name="phone" placeholder="请输入您的电话" />
            </div>
          </div>
          <div className="landing-franchise-form-row">
            <div className="landing-franchise-field">
              <label htmlFor="franchise-email">邮箱</label>
              <input id="franchise-email" name="email" placeholder="请输入您的邮箱" />
            </div>
            <div className="landing-franchise-field">
              <label htmlFor="franchise-city">所在城市</label>
              <input id="franchise-city" name="city" placeholder="请输入您所在的城市" />
            </div>
          </div>
          <div className="landing-franchise-field">
            <label htmlFor="franchise-message">留言</label>
            <textarea
              id="franchise-message"
              name="message"
              placeholder="请简要介绍您的情况和加盟意向"
            />
          </div>
          <button type="submit" className="landing-franchise-form-submit">
            提交申请
          </button>
        </form>
        <aside className="landing-franchise-contact">
          <div className="landing-franchise-contact-item">
            <span className="landing-franchise-contact-icon"><IconPhone /></span>
            <div>
              <div className="landing-franchise-contact-label">招商热线</div>
              <div className="landing-franchise-contact-value">18948301116</div>
            </div>
          </div>
          <div className="landing-franchise-contact-item">
            <span className="landing-franchise-contact-icon"><IconMail /></span>
            <div>
              <div className="landing-franchise-contact-label">商务邮箱</div>
              <div className="landing-franchise-contact-value">franchise@puyuan-health.com</div>
            </div>
          </div>
          <div className="landing-franchise-contact-item">
            <span className="landing-franchise-contact-icon"><IconMapPin /></span>
            <div>
              <div className="landing-franchise-contact-label">总部地址</div>
              <div className="landing-franchise-contact-value">江苏省苏州市常熟市东南街道久隆路88号</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
