import { useEffect, useRef, useState } from 'react';
import { Button, Card, InputNumber, Select, Space, Typography } from 'antd';
import PageLayout from '../components/PageLayout.jsx';

const { Title, Paragraph } = Typography;

const classColors = [
  '#e74c3c', // Class 1 (red)
  '#3498db', // Class 2 (blue)
  '#2ecc71', // Class 3 (green)
  '#9b59b6', // Class 4 (purple)
];
const testPointColor = '#f1c40f'; // Yellow

// Calculate distance between two points
function calculateDistance(p1, p2, metric) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;

  switch (metric) {
    case 'euclidean':
      return Math.sqrt(dx * dx + dy * dy);
    case 'manhattan':
      return Math.abs(dx) + Math.abs(dy);
    default:
      return Math.sqrt(dx * dx + dy * dy);
  }
}

// Classify a point against a set of training data using KNN
function knnPredict(point, data, k, metric, classCount) {
  const distances = data.map((dataPoint) => ({
    point: dataPoint,
    distance: calculateDistance(point, dataPoint, metric),
  }));

  distances.sort((a, b) => a.distance - b.distance);

  const neighbors = distances.slice(0, k);

  const classCounts = new Array(classCount).fill(0);
  neighbors.forEach((neighbor) => {
    classCounts[neighbor.point.class]++;
  });

  const maxCount = Math.max(...classCounts);
  const predictedClass = classCounts.indexOf(maxCount);

  return { neighbors, predictedClass };
}

// Lighten a hex color
function lightenColor(color, amount) {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + 255 * amount);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + 255 * amount);
  const b = Math.min(255, (num & 0x0000ff) + 255 * amount);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function generatePoints(classCount) {
  const clusterSpread = 0.15;
  const clusterCenters = [];
  for (let i = 0; i < classCount; i++) {
    clusterCenters.push({
      x: 0.2 + Math.random() * 0.6,
      y: 0.2 + Math.random() * 0.6,
    });
  }

  const points = [];
  const pointsPerClass = 50;
  for (let classIdx = 0; classIdx < classCount; classIdx++) {
    for (let i = 0; i < pointsPerClass; i++) {
      points.push({
        x: clusterCenters[classIdx].x + (Math.random() - 0.5) * clusterSpread,
        y: clusterCenters[classIdx].y + (Math.random() - 0.5) * clusterSpread,
        class: classIdx,
      });
    }
  }
  return points;
}

export default function KnnVisualizer() {
  const canvasRef = useRef(null);

  // Live controls
  const [k, setK] = useState(3);
  const [distanceMetric, setDistanceMetric] = useState('euclidean');
  const [showDecision, setShowDecision] = useState('true');

  // The class-count selector updates the legend instantly, but (matching the
  // original) only takes effect on the actual data/classification once
  // "Generate New Data" is clicked.
  const [classCountSelectValue, setClassCountSelectValue] = useState('2');
  const [activeClassCount, setActiveClassCount] = useState(2);

  const [data, setData] = useState(() => generatePoints(2));
  const [testPoint, setTestPoint] = useState(null);
  const [classification, setClassification] = useState(null);

  function generateData() {
    const count = parseInt(classCountSelectValue, 10);
    setActiveClassCount(count);
    setData(generatePoints(count));
    setTestPoint(null);
    setClassification(null);
  }

  function reset() {
    setTestPoint(null);
    setClassification(null);
  }

  function handleCanvasClick(event) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / canvas.width;
    const y = (event.clientY - rect.top) / canvas.height;
    const point = { x, y };

    setTestPoint(point);

    const { neighbors, predictedClass } = knnPredict(point, data, k, distanceMetric, activeClassCount);
    setClassification({
      x: point.x,
      y: point.y,
      k,
      metric: distanceMetric,
      neighborClasses: neighbors.map((neighbor) => neighbor.point.class),
      predictedClass,
    });
  }

  // Draw the decision boundary on the canvas. Data points / test point are
  // rendered as absolutely positioned overlay elements (matching the source,
  // which never draws them onto the canvas itself).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width !== displayWidth) canvas.width = displayWidth;
    if (canvas.height !== displayHeight) canvas.height = displayHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (showDecision !== 'true') return;

    const resolution = 20;
    const cellWidth = canvas.width / resolution;
    const cellHeight = canvas.height / resolution;

    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const x = (i + 0.5) / resolution;
        const y = (j + 0.5) / resolution;

        const { predictedClass } = knnPredict({ x, y }, data, k, distanceMetric, activeClassCount);

        ctx.fillStyle = lightenColor(classColors[predictedClass], 0.7);
        ctx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
      }
    }
  }, [data, k, distanceMetric, activeClassCount, showDecision]);

  return (
    <PageLayout
      title="K-Nearest Neighbors Visualizer"
      subtitle="Click the plot to classify a test point against the k nearest training examples."
      wide
    >
      <Card style={{ marginBottom: 20 }}>
        <Space size="large" wrap style={{ width: '100%' }}>
          <div style={{ minWidth: 200 }}>
            <Typography.Text strong style={{ display: 'block', marginBottom: 5 }}>
              Number of Neighbors (k):
            </Typography.Text>
            <InputNumber min={1} max={20} value={k} onChange={(val) => setK(val ?? 1)} style={{ width: '100%' }} />
          </div>

          <div style={{ minWidth: 200 }}>
            <Typography.Text strong style={{ display: 'block', marginBottom: 5 }}>
              Distance Metric:
            </Typography.Text>
            <Select
              value={distanceMetric}
              onChange={setDistanceMetric}
              style={{ width: '100%' }}
              options={[
                { value: 'euclidean', label: 'Euclidean' },
                { value: 'manhattan', label: 'Manhattan' },
              ]}
            />
          </div>

          <div style={{ minWidth: 200 }}>
            <Typography.Text strong style={{ display: 'block', marginBottom: 5 }}>
              Number of Classes:
            </Typography.Text>
            <Select
              value={classCountSelectValue}
              onChange={setClassCountSelectValue}
              style={{ width: '100%' }}
              options={[
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
              ]}
            />
          </div>

          <div style={{ minWidth: 200 }}>
            <Typography.Text strong style={{ display: 'block', marginBottom: 5 }}>
              Show Decision Boundary:
            </Typography.Text>
            <Select
              value={showDecision}
              onChange={setShowDecision}
              style={{ width: '100%' }}
              options={[
                { value: 'true', label: 'Yes' },
                { value: 'false', label: 'No' },
              ]}
            />
          </div>

          <div>
            <Typography.Text strong style={{ display: 'block', marginBottom: 5 }}>
              &nbsp;
            </Typography.Text>
            <Space>
              <Button type="primary" onClick={generateData}>
                Generate New Data
              </Button>
              <Button onClick={reset}>Reset</Button>
            </Space>
          </div>
        </Space>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <div
          style={{
            height: 500,
            position: 'relative',
          }}
        >
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{ border: '1px solid #ddd', backgroundColor: '#fff', width: '100%', height: '100%', cursor: 'crosshair' }}
          />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {data.map((point, idx) => (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  transform: 'translate(-6px, -6px)',
                  border: '1px solid #333',
                  backgroundColor: classColors[point.class],
                  left: `${point.x * 100}%`,
                  top: `${point.y * 100}%`,
                }}
              />
            ))}
            {testPoint && (
              <div
                style={{
                  position: 'absolute',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  transform: 'translate(-8px, -8px)',
                  border: '1px solid #333',
                  backgroundColor: testPointColor,
                  left: `${testPoint.x * 100}%`,
                  top: `${testPoint.y * 100}%`,
                }}
              />
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 15, flexWrap: 'wrap' }}>
          <LegendItem color={classColors[0]} label="Class 1" />
          <LegendItem color={classColors[1]} label="Class 2" />
          {parseInt(classCountSelectValue, 10) >= 3 && <LegendItem color={classColors[2]} label="Class 3" />}
          {parseInt(classCountSelectValue, 10) >= 4 && <LegendItem color={classColors[3]} label="Class 4" />}
          <LegendItem color={testPointColor} label="Test Point" />
        </div>

        <div
          style={{
            marginTop: 20,
            padding: 15,
            backgroundColor: '#f8f9fa',
            borderRadius: 4,
            borderLeft: '4px solid #3498db',
          }}
        >
          {classification ? (
            <>
              <strong>Classification Result:</strong>
              <br />- Test point at ({classification.x.toFixed(2)}, {classification.y.toFixed(2)})
              <br />- Using k = {classification.k} and {classification.metric} distance
              <br />- Nearest neighbors:{' '}
              {classification.neighborClasses.map((c) => `Class ${c + 1}`).join(', ')}
              <br />- Predicted class: <strong>Class {classification.predictedClass + 1}</strong>
            </>
          ) : (
            'Click on the plot to add a test point and see KNN classification.'
          )}
        </div>
      </Card>

      <Card>
        <Title level={2}>How K-Nearest Neighbors Works</Title>
        <Paragraph>
          K-Nearest Neighbors (KNN) is a simple, instance-based learning algorithm that classifies new data points
          based on their similarity to existing data points.
        </Paragraph>

        <Title level={3}>Algorithm Steps:</Title>
        <ol>
          <li>Store all training data points</li>
          <li>
            When classifying a new point:
            <ol>
              <li>Calculate distances to all stored points</li>
              <li>Select the k nearest points</li>
              <li>Assign the most common class among these neighbors</li>
            </ol>
          </li>
        </ol>

        <Title level={3}>Key Parameters:</Title>
        <ul>
          <li>
            <strong>k</strong>: Number of neighbors to consider (small k = more complex boundaries)
          </li>
          <li>
            <strong>Distance Metric</strong>: How to measure similarity between points
          </li>
        </ul>

        <Title level={3}>Characteristics:</Title>
        <ul>
          <li>No explicit training phase (lazy learning)</li>
          <li>Decision boundaries can be highly non-linear</li>
          <li>Sensitive to the choice of k and distance metric</li>
          <li>Works well for small to medium datasets</li>
        </ul>
      </Card>
    </PageLayout>
  );
}

function LegendItem({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14 }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid #333', backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );
}
