import { SwapOutlined } from '@ant-design/icons';
import './TradeoffTable.css';

/**
 * A structured pros/cons comparison for the specific either/or decision a
 * design problem's solution actually makes - e.g. token bucket vs sliding
 * window for a rate limiter. Scanning a table beats digging the same
 * comparison out of solution prose.
 */
export default function TradeoffTable({ tradeoffs }) {
  if (!tradeoffs) return null;

  return (
    <div className="sd-tradeoff">
      <div className="sd-tradeoff-question">
        <SwapOutlined /> {tradeoffs.question}
      </div>
      <div className="sd-tradeoff-table-wrap">
        <table className="sd-tradeoff-table">
          <thead>
            <tr>
              <th>Approach</th>
              <th>Pros</th>
              <th>Cons</th>
            </tr>
          </thead>
          <tbody>
            {tradeoffs.options.map((opt) => (
              <tr key={opt.name} className={opt.name === tradeoffs.chosen ? 'sd-tradeoff-row-chosen' : ''}>
                <td>
                  {opt.name}
                  {opt.name === tradeoffs.chosen ? <span className="sd-tradeoff-chosen-badge">Chosen</span> : null}
                </td>
                <td>{opt.pros}</td>
                <td>{opt.cons}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
