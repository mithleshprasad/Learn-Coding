import { useEffect, useRef, useState } from 'react';
import { Button, Card, InputNumber, Select, Slider, Space, Typography } from 'antd';
import PageLayout from '../components/PageLayout.jsx';

const { Title, Paragraph, Text } = Typography;

const dataPointColor = '#e74c3c';
const currentLineColor = '#3498db';
const trueLineColor = '#2ecc71';
const costLineColor = '#9b59b6';

const mathStyle = {
  fontFamily: "'Courier New', monospace",
  backgroundColor: '#f0f0f0',
  padding: '2px 5px',
  borderRadius: 3,
};

// Generate a fresh random dataset + the underlying "true" relationship
function generateDataset(noiseLevelPercent) {
  const noiseLevel = noiseLevelPercent / 100;

  const trueSlope = (Math.random() - 0.5) * 4;
  const trueIntercept = (Math.random() - 0.5) * 10;

  const data = [];
  const numPoints = 50;
  for (let i = 0; i < numPoints; i++) {
    const x = Math.random() * 18 - 4; // Range: -4 to 14
    const noise = (Math.random() - 0.5) * 10 * noiseLevel;
    const y = trueIntercept + trueSlope * x + noise;
    data.push({ x, y });
  }

  return { data, trueSlope, trueIntercept };
}

function randomModel() {
  return {
    slope: (Math.random() - 0.5) * 4,
    intercept: (Math.random() - 0.5) * 10,
  };
}

// Compute gradients of the MSE cost w.r.t. slope/intercept
function computeGradients(data, intercept, slope) {
  let interceptGradient = 0;
  let slopeGradient = 0;
  const m = data.length;

  data.forEach((point) => {
    const error = intercept + slope * point.x - point.y;
    interceptGradient += error;
    slopeGradient += error * point.x;
  });

  return {
    interceptGradient: interceptGradient / m,
    slopeGradient: slopeGradient / m,
  };
}

// Compute cost (Mean Squared Error)
function computeCost(data, intercept, slope) {
  let sum = 0;
  const m = data.length;

  data.forEach((point) => {
    const error = intercept + slope * point.x - point.y;
    sum += error * error;
  });

  return sum / (2 * m);
}

function syncCanvasSize(canvas) {
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;
  if (canvas.width !== displayWidth) canvas.width = displayWidth;
  if (canvas.height !== displayHeight) canvas.height = displayHeight;
}

function drawRegressionPlot(ctx, canvas, { data, trueSlope, trueIntercept, currentSlope, currentIntercept }) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (data.length === 0) return;

  const padding = 40;
  const plotWidth = canvas.width - 2 * padding;
  const plotHeight = canvas.height - 2 * padding;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  data.forEach((point) => {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  });

  const xRange = maxX - minX;
  const yRange = maxY - minY;
  minX -= xRange * 0.1;
  maxX += xRange * 0.1;
  minY -= yRange * 0.1;
  maxY += yRange * 0.1;

  const scaleX = (x) => padding + ((x - minX) / (maxX - minX)) * plotWidth;
  const scaleY = (y) => canvas.height - padding - ((y - minY) / (maxY - minY)) * plotHeight;

  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.stroke();

  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 0.5;

  const xStep = Math.pow(10, Math.floor(Math.log10(xRange))) / 2;
  for (let x = Math.ceil(minX / xStep) * xStep; x <= maxX; x += xStep) {
    const sx = scaleX(x);
    ctx.beginPath();
    ctx.moveTo(sx, padding);
    ctx.lineTo(sx, canvas.height - padding);
    ctx.stroke();

    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText(x.toFixed(1), sx, canvas.height - padding + 15);
  }

  const yStep = Math.pow(10, Math.floor(Math.log10(yRange))) / 2;
  for (let y = Math.ceil(minY / yStep) * yStep; y <= maxY; y += yStep) {
    const sy = scaleY(y);
    ctx.beginPath();
    ctx.moveTo(padding, sy);
    ctx.lineTo(canvas.width - padding, sy);
    ctx.stroke();

    ctx.fillStyle = '#333';
    ctx.textAlign = 'right';
    ctx.fillText(y.toFixed(1), padding - 5, sy + 5);
  }

  ctx.strokeStyle = trueLineColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(scaleX(minX), scaleY(trueIntercept + trueSlope * minX));
  ctx.lineTo(scaleX(maxX), scaleY(trueIntercept + trueSlope * maxX));
  ctx.stroke();

  ctx.strokeStyle = currentLineColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(scaleX(minX), scaleY(currentIntercept + currentSlope * minX));
  ctx.lineTo(scaleX(maxX), scaleY(currentIntercept + currentSlope * maxX));
  ctx.stroke();

  ctx.fillStyle = dataPointColor;
  data.forEach((point) => {
    ctx.beginPath();
    ctx.arc(scaleX(point.x), scaleY(point.y), 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawCostPlot(ctx, canvas, costHistory, iterationsInputValue) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (costHistory.length === 0) return;

  const padding = 40;
  const plotWidth = canvas.width - 2 * padding;
  const plotHeight = canvas.height - 2 * padding;

  const maxIteration = Math.max(costHistory.length, parseInt(iterationsInputValue, 10) || 0);
  const maxCost = Math.max(...costHistory, 1);

  const scaleX = (i) => padding + (i / maxIteration) * plotWidth;
  const scaleY = (cost) => canvas.height - padding - (cost / maxCost) * plotHeight;

  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.stroke();

  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 0.5;

  const xStep = maxIteration / 5;
  for (let i = 0; i <= maxIteration; i += xStep) {
    const sx = scaleX(i);
    ctx.beginPath();
    ctx.moveTo(sx, padding);
    ctx.lineTo(sx, canvas.height - padding);
    ctx.stroke();

    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(i), sx, canvas.height - padding + 15);
  }

  const yStep = maxCost / 5;
  for (let cost = 0; cost <= maxCost; cost += yStep) {
    const sy = scaleY(cost);
    ctx.beginPath();
    ctx.moveTo(padding, sy);
    ctx.lineTo(canvas.width - padding, sy);
    ctx.stroke();

    ctx.fillStyle = '#333';
    ctx.textAlign = 'right';
    ctx.fillText(cost.toFixed(1), padding - 5, sy + 5);
  }

  ctx.strokeStyle = costLineColor;
  ctx.lineWidth = 2;
  ctx.beginPath();

  costHistory.forEach((cost, i) => {
    if (i === 0) {
      ctx.moveTo(scaleX(i), scaleY(cost));
    } else {
      ctx.lineTo(scaleX(i), scaleY(cost));
    }
  });

  ctx.stroke();

  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.fillText('Iteration', canvas.width / 2, canvas.height - 5);

  ctx.save();
  ctx.translate(10, canvas.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillText('Cost J(θ)', 0, 0);
  ctx.restore();
}

export default function LinearRegressionVisualizer() {
  const regressionCanvasRef = useRef(null);
  const costCanvasRef = useRef(null);
  const timeoutRef = useRef(null);
  const runConfigRef = useRef({ learningRate: 0.1, maxIterations: 100, animationSpeed: 200 });

  const [learningRate, setLearningRate] = useState(0.1);
  const [iterations, setIterations] = useState(100);
  const [noiseLevel, setNoiseLevel] = useState(30);
  const [animationSpeed, setAnimationSpeed] = useState(200);

  const [dataset, setDataset] = useState(() => generateDataset(30));
  const { data, trueSlope, trueIntercept } = dataset;

  const [currentSlope, setCurrentSlope] = useState(() => randomModel().slope);
  const [currentIntercept, setCurrentIntercept] = useState(() => randomModel().intercept);
  const [costHistory, setCostHistory] = useState([]);
  const [iterationCount, setIterationCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [stepInfoText, setStepInfoText] = useState(
    "Click \"Generate New Data\" to create random data points, then \"Run Gradient Descent\" to start the optimization."
  );

  function generateData() {
    if (isRunning) return;

    setDataset(generateDataset(noiseLevel));
    const model = randomModel();
    setCurrentSlope(model.slope);
    setCurrentIntercept(model.intercept);
    setCostHistory([]);
    setIterationCount(0);
    setStepInfoText("Data generated. Click 'Run Gradient Descent' to start optimization.");
  }

  function runGradientDescent() {
    if (isRunning) return;

    runConfigRef.current = {
      learningRate: parseFloat(learningRate),
      maxIterations: parseInt(iterations, 10),
      animationSpeed,
    };
    setIsRunning(true);
  }

  function reset() {
    if (isRunning) {
      clearTimeout(timeoutRef.current);
      setIsRunning(false);
    }

    const model = randomModel();
    setCurrentSlope(model.slope);
    setCurrentIntercept(model.intercept);
    setCostHistory([]);
    setIterationCount(0);
    setStepInfoText("Reset to initial random parameters. Click 'Run Gradient Descent' to start optimization.");
  }

  // Drive the gradient-descent animation loop. Values are threaded through
  // the recursive step() as parameters (rather than re-read from React
  // state each tick) so the loop always operates on consistent values and
  // never suffers from stale closures.
  useEffect(() => {
    if (!isRunning) return undefined;

    let cancelled = false;
    const { learningRate: lr, maxIterations, animationSpeed: speed } = runConfigRef.current;

    function step(iterCount, slope, intercept, history) {
      if (cancelled) return;

      if (iterCount >= maxIterations) {
        setIsRunning(false);
        setStepInfoText(`Optimization completed after ${maxIterations} iterations.`);
        return;
      }

      const gradients = computeGradients(data, intercept, slope);
      const newIntercept = intercept - lr * gradients.interceptGradient;
      const newSlope = slope - lr * gradients.slopeGradient;
      const cost = computeCost(data, newIntercept, newSlope);
      const newHistory = [...history, cost];
      const newIterCount = iterCount + 1;

      setCurrentSlope(newSlope);
      setCurrentIntercept(newIntercept);
      setCostHistory(newHistory);
      setIterationCount(newIterCount);

      timeoutRef.current = setTimeout(() => step(newIterCount, newSlope, newIntercept, newHistory), speed);
    }

    step(0, currentSlope, currentIntercept, costHistory);

    return () => {
      cancelled = true;
      clearTimeout(timeoutRef.current);
    };
    // Intentionally only re-run when isRunning toggles: the loop captures
    // its starting values once, matching the original's local-closure loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  // Redraw both canvases whenever the plotted data changes.
  useEffect(() => {
    const regressionCanvas = regressionCanvasRef.current;
    const costCanvas = costCanvasRef.current;
    if (!regressionCanvas || !costCanvas) return;

    syncCanvasSize(regressionCanvas);
    syncCanvasSize(costCanvas);

    drawRegressionPlot(regressionCanvas.getContext('2d'), regressionCanvas, {
      data,
      trueSlope,
      trueIntercept,
      currentSlope,
      currentIntercept,
    });
    drawCostPlot(costCanvas.getContext('2d'), costCanvas, costHistory, iterations);
  }, [data, trueSlope, trueIntercept, currentSlope, currentIntercept, costHistory]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayedCost = data.length > 0 ? computeCost(data, currentIntercept, currentSlope) : 0;

  return (
    <PageLayout
      title="Linear Regression with Gradient Descent"
      subtitle="Watch gradient descent fit a line to noisy data, step by step."
      wide
    >
      <Card style={{ marginBottom: 20 }}>
        <Space size="large" wrap style={{ width: '100%' }}>
          <div style={{ minWidth: 200 }}>
            <Text strong style={{ display: 'block', marginBottom: 5 }}>
              Learning Rate (α):
            </Text>
            <InputNumber
              min={0.001}
              max={1}
              step={0.001}
              value={learningRate}
              onChange={(val) => setLearningRate(val ?? 0.001)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ minWidth: 200 }}>
            <Text strong style={{ display: 'block', marginBottom: 5 }}>
              Iterations:
            </Text>
            <InputNumber
              min={10}
              max={1000}
              value={iterations}
              onChange={(val) => setIterations(val ?? 10)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ minWidth: 200 }}>
            <Text strong style={{ display: 'block', marginBottom: 5 }}>
              Noise Level:
            </Text>
            <Space style={{ width: '100%' }}>
              <Slider
                min={0}
                max={100}
                value={noiseLevel}
                onChange={setNoiseLevel}
                style={{ width: 140 }}
              />
              <Text>{noiseLevel}%</Text>
            </Space>
          </div>

          <div style={{ minWidth: 200 }}>
            <Text strong style={{ display: 'block', marginBottom: 5 }}>
              Animation Speed:
            </Text>
            <Select
              value={animationSpeed}
              onChange={setAnimationSpeed}
              style={{ width: '100%' }}
              options={[
                { value: 500, label: 'Slow' },
                { value: 200, label: 'Medium' },
                { value: 50, label: 'Fast' },
              ]}
            />
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 5 }}>
              &nbsp;
            </Text>
            <Space wrap>
              <Button onClick={generateData} disabled={isRunning}>
                Generate New Data
              </Button>
              <Button type="primary" onClick={runGradientDescent} disabled={isRunning}>
                Run Gradient Descent
              </Button>
              <Button onClick={reset}>Reset</Button>
            </Space>
          </div>
        </Space>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ height: 500, position: 'relative' }}>
          <canvas
            ref={regressionCanvasRef}
            style={{ border: '1px solid #ddd', backgroundColor: '#fff', width: '100%', height: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 15, flexWrap: 'wrap' }}>
          <LegendItem color={dataPointColor} label="Data Points" />
          <LegendItem color={currentLineColor} label="Current Regression Line" />
          <LegendItem color={trueLineColor} label="True Relationship" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 15, flexWrap: 'wrap', gap: 10 }}>
          <Parameter label="Slope (θ₁)" value={currentSlope.toFixed(4)} />
          <Parameter label="Intercept (θ₀)" value={currentIntercept.toFixed(4)} />
          <Parameter label="Cost (J(θ))" value={displayedCost.toFixed(4)} />
          <Parameter label="Iteration" value={iterationCount} />
        </div>

        <div style={{ height: 300, position: 'relative', marginTop: 20 }}>
          <canvas
            ref={costCanvasRef}
            style={{ border: '1px solid #ddd', backgroundColor: '#fff', width: '100%', height: '100%' }}
          />
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
          {stepInfoText}
        </div>
      </Card>

      <Card>
        <Title level={2}>How Gradient Descent Works for Linear Regression</Title>

        <Title level={3}>Linear Regression Model</Title>
        <Paragraph>
          The model predicts:{' '}
          <Text style={mathStyle}>
            h<sub>θ</sub>(x) = θ₀ + θ₁x
          </Text>
        </Paragraph>

        <Title level={3}>Cost Function (Mean Squared Error)</Title>
        <Paragraph>
          <Text style={mathStyle}>
            J(θ) = 1/(2m) ∑<sub>i=1</sub>
            <sup>m</sup> (h<sub>θ</sub>(x<sup>(i)</sup>) - y<sup>(i)</sup>)<sup>2</sup>
          </Text>
        </Paragraph>

        <Title level={3}>Gradient Descent Algorithm</Title>
        <Paragraph>Repeat until convergence:</Paragraph>
        <Paragraph>
          <Text style={mathStyle}>
            θ<sub>j</sub> := θ<sub>j</sub> - α ∂J(θ)/∂θ<sub>j</sub>
          </Text>{' '}
          (for j = 0,1)
        </Paragraph>

        <Title level={3}>Partial Derivatives</Title>
        <Paragraph>
          <Text style={mathStyle}>
            ∂J(θ)/∂θ₀ = 1/m ∑<sub>i=1</sub>
            <sup>m</sup> (h<sub>θ</sub>(x<sup>(i)</sup>) - y<sup>(i)</sup>)
          </Text>
        </Paragraph>
        <Paragraph>
          <Text style={mathStyle}>
            ∂J(θ)/∂θ₁ = 1/m ∑<sub>i=1</sub>
            <sup>m</sup> (h<sub>θ</sub>(x<sup>(i)</sup>) - y<sup>(i)</sup>)x<sup>(i)</sup>
          </Text>
        </Paragraph>

        <Title level={3}>Key Parameters</Title>
        <ul>
          <li>
            <strong>Learning Rate (α)</strong>: Controls step size (too small = slow convergence, too large = may
            diverge)
          </li>
          <li>
            <strong>Iterations</strong>: Number of optimization steps
          </li>
        </ul>
      </Card>
    </PageLayout>
  );
}

function LegendItem({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14 }}>
      <div style={{ width: 15, height: 15, borderRadius: '50%', border: '1px solid #333', backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );
}

function Parameter({ label, value }) {
  return (
    <div style={{ backgroundColor: '#f8f9fa', padding: 10, borderRadius: 4, textAlign: 'center', minWidth: 100 }}>
      <div>{label}</div>
      <div>{value}</div>
    </div>
  );
}
