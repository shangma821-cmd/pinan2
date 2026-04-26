interface RevenueRow {
  item: string;
  formula: string;
  amount: string;
}

const rows: RevenueRow[] = [
  { item: '会员卡销售', formula: '年卡30张×1825元+家庭卡10张×2990元', amount: '8.465万' },
  { item: '服务分成', formula: '检测5000次×5元+修复1万次×20元', amount: '22.5万' },
  { item: '手环零售', formula: '50套×2765元（差价）', amount: '13.825万' },
  { item: '增值服务', formula: '手环消杀500次×10元+方案下载300次×10元', amount: '0.8万' },
  { item: '年度返点', formula: '年营收60万×3%', amount: '1.8万' },
];

const rewards = [
  {
    title: '推荐奖励',
    desc: '推荐1家旗舰店（6.98万押金），享该店年营业额10%分成。例：该店年营收200万，推荐人年赚2万元。',
  },
  {
    title: '管理奖励',
    desc: '累计推荐10家店，升级区域服务商，额外享区域所有门店3%分成。例：区域100家店，年均营收100万，年赚30万元。',
  },
];

export default function FranchiseRevenueTable() {
  return (
    <div data-testid="franchise-revenue" className="landing-franchise-revenue-block">
      <h3 className="landing-franchise-revenue-title">店中店收益测算（示例）</h3>
      <div className="landing-franchise-revenue-table-wrap">
        <table className="landing-franchise-revenue-table">
          <thead>
            <tr>
              <th>收益项目</th>
              <th>计算方式</th>
              <th className="is-amount">金额</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.item}>
                <td>{r.item}</td>
                <td>{r.formula}</td>
                <td className="is-amount">{r.amount}</td>
              </tr>
            ))}
            <tr className="landing-franchise-revenue-total">
              <td>合计</td>
              <td />
              <td className="is-amount">47.39万</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="landing-franchise-rewards">
        {rewards.map((r) => (
          <div key={r.title} className="landing-franchise-reward-row">
            <span className="landing-franchise-reward-title">{r.title}</span>
            <span className="landing-franchise-reward-desc">{r.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
