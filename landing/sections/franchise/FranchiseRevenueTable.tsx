const revenueRows = [
  ['会员卡销售', '8.465万'],
  ['服务分成', '22.5万'],
  ['手环零售', '13.825万'],
  ['增值服务', '0.8万'],
  ['年度返点', '1.8万'],
];

export default function FranchiseRevenueTable() {
  return (
    <section className="landing-section">
      <p className="landing-kicker">经营样板</p>
      <h2 className="landing-section-title">店中店收益测算（示例）</h2>
      <table className="landing-table">
        <thead>
          <tr>
            <th>项目</th>
            <th>金额</th>
          </tr>
        </thead>
        <tbody>
          {revenueRows.map(([label, value]) => (
            <tr key={label}>
              <td>{label}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
