import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Input, Row, Select, Space, Tabs, Tag, Typography } from 'antd';
import { PlayCircleOutlined, ReloadOutlined, StepForwardOutlined } from '@ant-design/icons';
import PageLayout from '../components/PageLayout.jsx';

const { Title, Paragraph, Text } = Typography;

// Colors mirror the original stylesheet's .array-element.* classes.
const COLORS = {
  default: '#3498db',
  target: '#e74c3c',
  left: '#2ecc71',
  right: '#f39c12',
  mid: '#9b59b6',
  checked: '#95a5a6',
  current: '#2ecc71',
};

const BINARY_LEGEND = [
  { color: COLORS.target, label: 'Target' },
  { color: COLORS.left, label: 'Left Pointer' },
  { color: COLORS.right, label: 'Right Pointer' },
  { color: COLORS.mid, label: 'Mid Pointer' },
  { color: COLORS.checked, label: 'Checked' },
];

const LINEAR_LEGEND = [
  { color: COLORS.target, label: 'Target' },
  { color: COLORS.current, label: 'Current' },
  { color: COLORS.checked, label: 'Checked' },
];

const SPEED_OPTIONS = [
  { value: '1000', label: 'Slow' },
  { value: '500', label: 'Medium' },
  { value: '200', label: 'Fast' },
];

const DEFAULT_ARRAY_TEXT = '1, 3, 5, 7, 9, 11, 13, 15, 17, 19';
const DEFAULT_TARGET_TEXT = '13';
const DEFAULT_SPEED_TEXT = '500';

function parseArray(text) {
  return text.split(',').map((item) => parseInt(item.trim(), 10));
}

/**
 * Binary search final-color rules replicate the original CSS cascade: when an
 * element carries both `mid-pointer` and `checked`, `mid-pointer` is declared
 * later in the stylesheet and wins. `left-pointer`/`right-pointer` never
 * coincide with `checked`, so mid > right > left is the effective priority.
 */
function getBinaryElementVisual(index, value, step, target) {
  if (!step) {
    return { color: value === target ? COLORS.target : COLORS.default, labels: [] };
  }
  if (step.finished && step.found) {
    return index === step.mid
      ? { color: COLORS.target, labels: ['Found!'] }
      : { color: COLORS.default, labels: [] };
  }
  if (step.finished) {
    return { color: COLORS.default, labels: [] };
  }

  const labels = [];
  if (index === step.left) labels.push('L');
  if (index === step.right) labels.push('R');
  if (index === step.mid) labels.push('M');

  let color = COLORS.default;
  if (index === step.mid) color = COLORS.mid;
  else if (index === step.left) color = COLORS.left;
  else if (index === step.right) color = COLORS.right;

  return { color, labels };
}

/**
 * Linear search: `checked` is declared after `current` in the original
 * stylesheet, so whenever both classes land on the same element `checked`
 * (gray) wins over `current` (green) - i.e. every non-matching "current"
 * element renders gray, and only an exact match briefly renders green.
 */
function getLinearElementVisual(index, value, step, target) {
  if (!step) {
    return { color: value === target ? COLORS.target : COLORS.default, labels: [] };
  }
  if (step.finished && step.found) {
    return index === step.current
      ? { color: COLORS.target, labels: ['Found!'] }
      : { color: COLORS.default, labels: [] };
  }
  if (step.finished) {
    return { color: COLORS.default, labels: [] };
  }
  if (index === step.current) {
    return { color: value !== target ? COLORS.checked : COLORS.current, labels: ['Current'] };
  }
  return { color: COLORS.default, labels: [] };
}

function getAlertType(step) {
  if (!step) return 'info';
  if (step.found) return 'success';
  if (step.finished) return 'error';
  return 'info';
}

function ArrayBars({ array, target, step, getVisual }) {
  if (array.length === 0) {
    return <Text type="secondary">No array to display.</Text>;
  }
  const maxValue = Math.max(...array);
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        height: 200,
        marginTop: 20,
        position: 'relative',
        overflowX: 'auto',
        gap: 4,
      }}
    >
      {array.map((value, index) => {
        const { color, labels } = getVisual(index, value, step, target);
        const heightPercentage = (value / maxValue) * 80 + 20;
        return (
          <div
            key={index}
            style={{
              flex: '0 0 auto',
              width: 30,
              background: color,
              transition: 'all 0.3s ease',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#fff',
              fontWeight: 'bold',
              position: 'relative',
              fontSize: 12,
              height: `${heightPercentage}%`,
            }}
          >
            {labels.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: -22,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 12,
                  color: '#333',
                  whiteSpace: 'nowrap',
                }}
              >
                {labels.join(' / ')}
              </div>
            )}
            {value}
          </div>
        );
      })}
    </div>
  );
}

function Legend({ items }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 15, marginTop: 15, flexWrap: 'wrap' }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
          <div style={{ width: 15, height: 15, borderRadius: 3, background: item.color }} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function ComplexityTable({ rows }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 15 }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'center', background: '#f2f2f2' }}>
            Case
          </th>
          <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'center', background: '#f2f2f2' }}>
            Time Complexity
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([caseName, complexity]) => (
          <tr key={caseName}>
            <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'center' }}>{caseName}</td>
            <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'center' }}>{complexity}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// --- Comparison graph (canvas) -------------------------------------------
// Ported line-for-line from the original renderComparisonGraph/
// drawComparisonCurve functions, including the canvas context state
// carrying over between draw calls exactly as it did in the source (e.g.
// the "Your array size" label inherits the 12px/left-aligned text settings
// left behind by the legend loop, just like in binary.html).

function drawComparisonCurve(ctx, points, color, scaleX, scaleY) {
  ctx.beginPath();
  ctx.moveTo(scaleX(points[0].x), scaleY(points[0].y));
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(scaleX(points[i].x), scaleY(points[i].y));
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawComparisonGraph(ctx, canvasWidth, canvasHeight, currentN) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const padding = 40;
  const graphWidth = canvasWidth - padding * 2;
  const graphHeight = canvasHeight - padding * 2;

  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, padding + graphHeight);
  ctx.lineTo(padding + graphWidth, padding + graphHeight);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = '14px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.fillText('Input Size (n)', padding + graphWidth / 2, canvasHeight - 5);

  ctx.save();
  ctx.translate(10, padding + graphHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillText('Operations (time complexity)', 0, 0);
  ctx.restore();

  const maxN = 100;
  const linearPoints = [];
  const logarithmicPoints = [];
  for (let n = 1; n <= maxN; n += 1) {
    linearPoints.push({ x: n, y: n });
    logarithmicPoints.push({ x: n, y: Math.log2(n) });
  }

  const maxY = maxN;
  const scaleX = (x) => padding + (x / maxN) * graphWidth;
  const scaleY = (y) => padding + graphHeight - (y / maxY) * graphHeight;

  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;

  for (let n = 0; n <= maxN; n += 10) {
    const x = scaleX(n);
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, padding + graphHeight);
    ctx.stroke();
    if (n > 0) {
      ctx.fillText(n.toString(), x, padding + graphHeight + 15);
    }
  }

  for (let y = 0; y <= maxY; y += 20) {
    const scaledY = scaleY(y);
    ctx.beginPath();
    ctx.moveTo(padding, scaledY);
    ctx.lineTo(padding + graphWidth, scaledY);
    ctx.stroke();
    ctx.fillText(y.toString(), padding - 20, scaledY + 5);
  }

  drawComparisonCurve(ctx, linearPoints, '#e74c3c', scaleX, scaleY);
  drawComparisonCurve(ctx, logarithmicPoints, '#2ecc71', scaleX, scaleY);

  const legendItems = [
    { color: '#e74c3c', label: 'Linear Search O(n)' },
    { color: '#2ecc71', label: 'Binary Search O(log n)' },
  ];
  const legendX = padding + graphWidth - 200;
  const legendY = padding + 20;

  legendItems.forEach((item, index) => {
    ctx.fillStyle = item.color;
    ctx.fillRect(legendX, legendY + index * 25, 15, 15);
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(item.label, legendX + 20, legendY + 12 + index * 25);
  });

  if (currentN > 0) {
    const xPos = scaleX(currentN);

    ctx.beginPath();
    ctx.moveTo(xPos, padding);
    ctx.lineTo(xPos, padding + graphHeight);
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#3498db';
    ctx.fillText(`Your array size: ${currentN}`, xPos, padding - 10);

    const linearY = scaleY(currentN);
    const logY = scaleY(Math.log2(currentN));

    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(xPos, linearY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(xPos, logY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`For ${currentN} elements:`, padding + 10, padding + 30);
    ctx.fillText(`Linear search would take ~${currentN} operations`, padding + 10, padding + 60);
    ctx.fillText(`Binary search would take ~${Math.round(Math.log2(currentN))} operations`, padding + 10, padding + 90);
  }
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 280;

export default function BinarySearchVisualizer() {
  const [arrayText, setArrayText] = useState(DEFAULT_ARRAY_TEXT);
  const [targetText, setTargetText] = useState(DEFAULT_TARGET_TEXT);
  const [speedText, setSpeedText] = useState(DEFAULT_SPEED_TEXT);
  const [array, setArray] = useState(() => parseArray(DEFAULT_ARRAY_TEXT));
  const [target, setTarget] = useState(() => parseInt(DEFAULT_TARGET_TEXT, 10));
  const [activeTab, setActiveTab] = useState('visualization');

  const [binary, setBinary] = useState({
    step: null,
    message: 'Ready to perform binary search.',
    comparisons: 0,
    startDisabled: false,
    nextDisabled: false,
  });
  const [linear, setLinear] = useState({
    step: null,
    message: 'Ready to perform linear search.',
    comparisons: 0,
    startDisabled: false,
    nextDisabled: false,
  });

  // Mutable "algorithm engine" bookkeeping that mirrors the original's
  // plain global variables (left/right/mid, the accumulated steps queue,
  // the cursor into that queue, and the autoplay/timeout flags). These
  // don't drive rendering directly - the step objects pulled out of them
  // are copied into `binary`/`linear` state above, which is what JSX reads.
  const binaryEngineRef = useRef({ left: 0, right: 0, mid: 0, steps: [], stepIndex: 0, autoPlaying: false, timeoutId: null });
  const linearEngineRef = useRef({ current: 0, steps: [], stepIndex: 0, autoPlaying: false, timeoutId: null });
  const arrayRef = useRef(array);
  const targetRef = useRef(target);
  const speedRef = useRef(parseInt(DEFAULT_SPEED_TEXT, 10));
  const canvasRef = useRef(null);

  function resetBinaryEngine(arr, invalid) {
    const eng = binaryEngineRef.current;
    if (eng.timeoutId) {
      clearTimeout(eng.timeoutId);
      eng.timeoutId = null;
    }
    eng.autoPlaying = false;

    if (invalid.array) {
      setBinary({ step: null, message: 'Please enter a valid array of numbers.', comparisons: 0, startDisabled: false, nextDisabled: false });
      return;
    }
    if (invalid.target) {
      setBinary({ step: null, message: 'Please enter a valid target number.', comparisons: 0, startDisabled: false, nextDisabled: false });
      return;
    }

    eng.left = 0;
    eng.right = arr.length - 1;
    eng.mid = 0;
    eng.steps = [];
    eng.stepIndex = 0;
    setBinary({ step: null, message: 'Ready to perform binary search.', comparisons: 0, startDisabled: false, nextDisabled: false });
  }

  function resetLinearEngine(arr, invalid) {
    const eng = linearEngineRef.current;
    if (eng.timeoutId) {
      clearTimeout(eng.timeoutId);
      eng.timeoutId = null;
    }
    eng.autoPlaying = false;

    if (invalid.array) {
      setLinear({ step: null, message: 'Please enter a valid array of numbers.', comparisons: 0, startDisabled: false, nextDisabled: false });
      return;
    }
    if (invalid.target) {
      setLinear({ step: null, message: 'Please enter a valid target number.', comparisons: 0, startDisabled: false, nextDisabled: false });
      return;
    }

    eng.current = 0;
    eng.steps = [];
    eng.stepIndex = 0;
    setLinear({ step: null, message: 'Ready to perform linear search.', comparisons: 0, startDisabled: false, nextDisabled: false });
  }

  function handleReset() {
    const parsedArray = parseArray(arrayText);
    const parsedTarget = parseInt(targetText, 10);
    const parsedSpeed = parseInt(speedText, 10);
    const invalid = {
      array: parsedArray.some((n) => Number.isNaN(n)),
      target: Number.isNaN(parsedTarget),
    };

    arrayRef.current = parsedArray;
    targetRef.current = parsedTarget;
    speedRef.current = parsedSpeed;
    setArray(parsedArray);
    setTarget(parsedTarget);

    resetBinaryEngine(parsedArray, invalid);
    resetLinearEngine(parsedArray, invalid);
  }

  useEffect(() => {
    handleReset();
    return () => {
      if (binaryEngineRef.current.timeoutId) clearTimeout(binaryEngineRef.current.timeoutId);
      if (linearEngineRef.current.timeoutId) clearTimeout(linearEngineRef.current.timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Binary search step engine ------------------------------------

  function calculateNextBinaryStep(eng, arr, tgt) {
    if (eng.left > eng.right) {
      eng.steps.push({
        message: `Search complete. Target ${tgt} not found in the array.`,
        left: -1,
        right: -1,
        mid: -1,
        finished: true,
      });
      return;
    }

    eng.mid = Math.floor((eng.left + eng.right) / 2);
    eng.steps.push({
      message: `Calculating mid = floor((${eng.left} + ${eng.right}) / 2) = ${eng.mid}. Checking if array[${eng.mid}] (${arr[eng.mid]}) == ${tgt}`,
      left: eng.left,
      right: eng.right,
      mid: eng.mid,
      comparison: true,
      finished: false,
    });

    if (arr[eng.mid] === tgt) {
      eng.steps.push({
        message: `Found target ${tgt} at index ${eng.mid}!`,
        left: eng.left,
        right: eng.right,
        mid: eng.mid,
        found: true,
        finished: true,
      });
    } else if (arr[eng.mid] < tgt) {
      eng.steps.push({
        message: `${arr[eng.mid]} < ${tgt}, so we search the right half. Setting left = mid + 1 = ${eng.mid + 1}`,
        left: eng.mid + 1,
        right: eng.right,
        mid: eng.mid,
        finished: false,
      });
      eng.left = eng.mid + 1;
    } else {
      eng.steps.push({
        message: `${arr[eng.mid]} > ${tgt}, so we search the left half. Setting right = mid - 1 = ${eng.mid - 1}`,
        left: eng.left,
        right: eng.mid - 1,
        mid: eng.mid,
        finished: false,
      });
      eng.right = eng.mid - 1;
    }
  }

  function performBinaryStep() {
    const eng = binaryEngineRef.current;
    if (eng.stepIndex >= eng.steps.length) {
      calculateNextBinaryStep(eng, arrayRef.current, targetRef.current);
    }
    if (eng.stepIndex < eng.steps.length) {
      const step = eng.steps[eng.stepIndex];
      eng.stepIndex += 1;
      if (step.finished) eng.autoPlaying = false;

      setBinary((prev) => ({
        step,
        message: step.message,
        comparisons: step.comparison ? prev.comparisons + 1 : prev.comparisons,
        startDisabled: step.finished ? true : prev.startDisabled,
        nextDisabled: eng.autoPlaying || step.finished,
      }));

      if (eng.autoPlaying && !step.finished) {
        eng.timeoutId = setTimeout(performBinaryStep, speedRef.current);
      }
    }
  }

  function startBinarySearch() {
    const eng = binaryEngineRef.current;
    eng.autoPlaying = true;
    setBinary((prev) => ({ ...prev, startDisabled: true, nextDisabled: true }));
    performBinaryStep();
  }

  function nextBinaryStep() {
    const eng = binaryEngineRef.current;
    eng.autoPlaying = false;
    if (eng.timeoutId) {
      clearTimeout(eng.timeoutId);
      eng.timeoutId = null;
    }
    performBinaryStep();
  }

  // --- Linear search step engine -------------------------------------

  function calculateNextLinearStep(eng, arr, tgt) {
    if (eng.current >= arr.length) {
      eng.steps.push({ message: `Search complete. Target ${tgt} not found in the array.`, current: -1, finished: true });
      return;
    }

    eng.steps.push({
      message: `Checking if array[${eng.current}] (${arr[eng.current]}) == ${tgt}`,
      current: eng.current,
      comparison: true,
      finished: false,
    });

    if (arr[eng.current] === tgt) {
      eng.steps.push({ message: `Found target ${tgt} at index ${eng.current}!`, current: eng.current, found: true, finished: true });
    } else {
      eng.steps.push({
        message: `${arr[eng.current]} != ${tgt}, moving to next element.`,
        current: eng.current,
        finished: false,
      });
      eng.current += 1;
    }
  }

  function performLinearStep() {
    const eng = linearEngineRef.current;
    if (eng.stepIndex >= eng.steps.length) {
      calculateNextLinearStep(eng, arrayRef.current, targetRef.current);
    }
    if (eng.stepIndex < eng.steps.length) {
      const step = eng.steps[eng.stepIndex];
      eng.stepIndex += 1;
      if (step.finished) eng.autoPlaying = false;

      setLinear((prev) => ({
        step,
        message: step.message,
        comparisons: step.comparison ? prev.comparisons + 1 : prev.comparisons,
        startDisabled: step.finished ? true : prev.startDisabled,
        nextDisabled: eng.autoPlaying || step.finished,
      }));

      if (eng.autoPlaying && !step.finished) {
        eng.timeoutId = setTimeout(performLinearStep, speedRef.current);
      }
    }
  }

  function startLinearSearch() {
    const eng = linearEngineRef.current;
    eng.autoPlaying = true;
    setLinear((prev) => ({ ...prev, startDisabled: true, nextDisabled: true }));
    performLinearStep();
  }

  function nextLinearStep() {
    const eng = linearEngineRef.current;
    eng.autoPlaying = false;
    if (eng.timeoutId) {
      clearTimeout(eng.timeoutId);
      eng.timeoutId = null;
    }
    performLinearStep();
  }

  function startAllSearches() {
    startBinarySearch();
    startLinearSearch();
  }

  // Redraw the comparison graph whenever it's visible and whenever the
  // committed array changes (the original only redrew on tab click, which
  // meant a reset while already on the Comparison tab left it stale - this
  // keeps it in sync, a small correctness improvement).
  useEffect(() => {
    if (activeTab !== 'comparison') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    drawComparisonGraph(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, array.length);
  }, [activeTab, array]);

  const visualizationContent = (
    <Row gutter={[20, 20]}>
      <Col xs={24} lg={12}>
        <Card title="Binary Search">
          <Legend items={BINARY_LEGEND} />
          <ArrayBars array={array} target={target} step={binary.step} getVisual={getBinaryElementVisual} />
          <Alert style={{ marginTop: 16, minHeight: 60 }} title={binary.message} type={getAlertType(binary.step)} showIcon />
          <Space size="middle" style={{ marginTop: 12 }} wrap>
            <Tag color="blue">Comparisons: {binary.comparisons}</Tag>
            <Tag color="purple">Time Complexity: O(log n)</Tag>
          </Space>
          <Space style={{ marginTop: 16 }} wrap>
            <Button type="primary" icon={<PlayCircleOutlined />} disabled={binary.startDisabled} onClick={startBinarySearch}>
              Start Binary Search
            </Button>
            <Button icon={<StepForwardOutlined />} disabled={binary.nextDisabled} onClick={nextBinaryStep}>
              Next Step
            </Button>
          </Space>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Brute Force (Linear Search)">
          <Legend items={LINEAR_LEGEND} />
          <ArrayBars array={array} target={target} step={linear.step} getVisual={getLinearElementVisual} />
          <Alert style={{ marginTop: 16, minHeight: 60 }} title={linear.message} type={getAlertType(linear.step)} showIcon />
          <Space size="middle" style={{ marginTop: 12 }} wrap>
            <Tag color="blue">Comparisons: {linear.comparisons}</Tag>
            <Tag color="orange">Time Complexity: O(n)</Tag>
          </Space>
          <Space style={{ marginTop: 16 }} wrap>
            <Button type="primary" icon={<PlayCircleOutlined />} disabled={linear.startDisabled} onClick={startLinearSearch}>
              Start Linear Search
            </Button>
            <Button icon={<StepForwardOutlined />} disabled={linear.nextDisabled} onClick={nextLinearStep}>
              Next Step
            </Button>
          </Space>
        </Card>
      </Col>
    </Row>
  );

  const comparisonContent = (
    <Card title="Algorithm Comparison">
      <div style={{ overflowX: 'auto' }}>
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{ display: 'block' }} />
      </div>
    </Card>
  );

  const explanationContent = (
    <Card>
      <Title level={3}>Search Algorithms Explained</Title>

      <Title level={4}>Brute Force (Linear Search)</Title>
      <Paragraph>
        Linear search is the simplest search algorithm. It checks each element in the list sequentially until it
        finds the target value or reaches the end of the list.
      </Paragraph>
      <Text strong>Algorithm Steps:</Text>
      <ol>
        <li>Start from the first element of the array</li>
        <li>Compare the current element with the target</li>
        <li>If they match, return the current index</li>
        <li>If they don&apos;t match, move to the next element</li>
        <li>Repeat steps 2-4 until the element is found or the end of the array is reached</li>
        <li>If the element is not found, return -1</li>
      </ol>
      <Text strong>Time Complexity:</Text>
      <ComplexityTable
        rows={[
          ['Best Case', 'O(1) - Target is the first element'],
          ['Average Case', 'O(n)'],
          ['Worst Case', 'O(n) - Target is the last element or not present'],
        ]}
      />

      <Title level={4} style={{ marginTop: 32 }}>
        Binary Search
      </Title>
      <Paragraph>
        Binary search is an efficient algorithm for finding an item from a sorted list of items. It works by
        repeatedly dividing in half the portion of the list that could contain the item.
      </Paragraph>
      <Text strong>Algorithm Steps:</Text>
      <ol>
        <li>
          Initialize two pointers: <code>left = 0</code> and <code>right = array.length - 1</code>
        </li>
        <li>
          While <code>left ≤ right</code>:
          <ol>
            <li>
              Calculate <code>mid = Math.floor((left + right) / 2)</code>
            </li>
            <li>
              If the element at <code>mid</code> is the target, return <code>mid</code>
            </li>
            <li>
              If the target is less than the element at <code>mid</code>, set <code>right = mid - 1</code>
            </li>
            <li>
              If the target is greater than the element at <code>mid</code>, set <code>left = mid + 1</code>
            </li>
          </ol>
        </li>
        <li>If the element is not found, return -1</li>
      </ol>
      <Text strong>Time Complexity:</Text>
      <ComplexityTable
        rows={[
          ['Best Case', 'O(1) - Target is the middle element'],
          ['Average Case', 'O(log n)'],
          ['Worst Case', 'O(log n) - Target is at the beginning or end'],
        ]}
      />

      <Title level={4} style={{ marginTop: 32 }}>
        When to Use Each Algorithm
      </Title>
      <Paragraph>
        <Text strong>Use Linear Search when:</Text>
      </Paragraph>
      <ul>
        <li>The list is unsorted</li>
        <li>The list is small</li>
        <li>You need to find all occurrences of a value</li>
      </ul>
      <Paragraph>
        <Text strong>Use Binary Search when:</Text>
      </Paragraph>
      <ul>
        <li>The list is sorted</li>
        <li>The list is large</li>
        <li>You need optimal search performance</li>
      </ul>
    </Card>
  );

  return (
    <PageLayout
      title="Search Algorithm Visualizer"
      subtitle="Step through binary search and linear (brute-force) search side by side, compare their performance, and see why O(log n) beats O(n)."
      wide
    >
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[20, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>
              Array (comma separated numbers):
            </Text>
            <Input value={arrayText} onChange={(e) => setArrayText(e.target.value)} placeholder="e.g. 1, 3, 5, 7, 9" />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>
              Target value to search:
            </Text>
            <Input type="number" value={targetText} onChange={(e) => setTargetText(e.target.value)} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>
              Animation Speed:
            </Text>
            <Select value={speedText} onChange={setSpeedText} options={SPEED_OPTIONS} style={{ width: '100%' }} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>
              &nbsp;
            </Text>
            <Space wrap>
              <Button type="primary" icon={<PlayCircleOutlined />} onClick={startAllSearches}>
                Start Both Searches
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'visualization', label: 'Visualization', children: visualizationContent },
          { key: 'comparison', label: 'Comparison', children: comparisonContent },
          { key: 'explanation', label: 'Explanation', children: explanationContent },
        ]}
      />
    </PageLayout>
  );
}
