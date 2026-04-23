export default function FranchiseApplication() {
  return (
    <section className="landing-section">
      <div className="landing-form-layout">
        <div className="landing-surface">
          <p className="landing-kicker">立即咨询</p>
          <h2 className="landing-section-title">立即申请加盟</h2>
          <div className="landing-form-grid">
            <div className="landing-field">
              <label htmlFor="franchise-name">姓名</label>
              <input id="franchise-name" name="name" placeholder="请输入您的姓名" />
            </div>
            <div className="landing-field">
              <label htmlFor="franchise-phone">电话</label>
              <input id="franchise-phone" name="phone" placeholder="请输入您的电话" />
            </div>
            <div className="landing-field">
              <label htmlFor="franchise-email">邮箱</label>
              <input id="franchise-email" name="email" placeholder="请输入您的邮箱" />
            </div>
            <div className="landing-field">
              <label htmlFor="franchise-city">所在城市</label>
              <input id="franchise-city" name="city" placeholder="请输入您所在的城市" />
            </div>
            <div className="landing-field">
              <label htmlFor="franchise-message">留言</label>
              <textarea
                id="franchise-message"
                name="message"
                placeholder="请简要介绍您的情况和加盟意向"
              />
            </div>
            <button type="button" className="landing-button-primary">
              提交申请
            </button>
          </div>
        </div>
        <aside className="landing-contact-block">
          <div className="landing-contact-item">
            <strong>招商热线</strong>
            <span>18948301116</span>
          </div>
          <div className="landing-contact-item">
            <strong>商务邮箱</strong>
            <span>Pinancs@163.com</span>
          </div>
          <div className="landing-contact-item">
            <strong>总部地址</strong>
            <span>江苏省苏州市常熟市东南街道久隆路88号</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
