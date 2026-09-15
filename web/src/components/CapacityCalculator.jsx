import { useState } from 'react';
import { Col, InputNumber, Row, Typography } from 'antd';
import { CalculatorOutlined } from '@ant-design/icons';
import './CapacityCalculator.css';

const { Text, Title } = Typography;

function formatNumber(n) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return Math.round(n).toString();
}

function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(2)} ${units[i]}`;
}

function Field({ label, value, onChange, step = 1, min = 0 }) {
  return (
    <Col xs={24} sm={12} md={8}>
      <Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
        {label}
      </Text>
      <InputNumber
        style={{ width: '100%' }}
        value={value}
        onChange={(v) => onChange(v ?? 0)}
        min={min}
        step={step}
      />
    </Col>
  );
}

function Result({ label, value }) {
  return (
    <div className="capacity-calc-result">
      <Text type="secondary" style={{ fontSize: 12 }}>
        {label}
      </Text>
      <Title level={4} style={{ margin: 0 }}>
        {value}
      </Title>
    </div>
  );
}

/**
 * A generic back-of-envelope estimator: propose your own assumptions for
 * traffic and scale (like a real interview does - nobody hands you the DAU
 * figure), and it computes the QPS/storage numbers live. Deliberately
 * doesn't ship "correct" per-problem defaults - reasoning about what's
 * plausible for a given system is part of the skill being practiced.
 */
export default function CapacityCalculator() {
  const [dau, setDau] = useState(10_000_000);
  const [requestsPerUser, setRequestsPerUser] = useState(10);
  const [payloadKb, setPayloadKb] = useState(1);
  const [retentionDays, setRetentionDays] = useState(365);
  const [replication, setReplication] = useState(3);

  const requestsPerDay = dau * requestsPerUser;
  const avgQps = requestsPerDay / 86400;
  const peakQps = avgQps * 3;
  const bytesPerDay = requestsPerDay * payloadKb * 1024;
  const storageOverRetention = bytesPerDay * retentionDays * replication;

  return (
    <div className="capacity-calc">
      <div className="capacity-calc-heading">
        <CalculatorOutlined /> Capacity Estimation
      </div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Propose your own assumptions for this system, then see the resulting scale.
      </Text>

      <Row gutter={[16, 16]}>
        <Field label="Daily active users / clients" value={dau} onChange={setDau} step={100_000} />
        <Field label="Requests per user / day" value={requestsPerUser} onChange={setRequestsPerUser} />
        <Field label="Avg payload size (KB)" value={payloadKb} onChange={setPayloadKb} step={0.1} />
        <Field label="Data retention (days)" value={retentionDays} onChange={setRetentionDays} min={1} />
        <Field label="Replication factor" value={replication} onChange={setReplication} min={1} />
      </Row>

      <div className="capacity-calc-results">
        <Result label="Requests / day" value={formatNumber(requestsPerDay)} />
        <Result label="Avg QPS" value={formatNumber(avgQps)} />
        <Result label="Peak QPS (~3x avg)" value={formatNumber(peakQps)} />
        <Result label="Storage / day" value={formatBytes(bytesPerDay)} />
        <Result label={`Storage over ${retentionDays}d (×${replication})`} value={formatBytes(storageOverRetention)} />
      </div>
    </div>
  );
}
