import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Select, Space, Typography } from 'antd';
import { CaretRightOutlined, ReloadOutlined, StepForwardOutlined } from '@ant-design/icons';
import PageLayout from '../components/PageLayout.jsx';

const { Title, Paragraph, Text } = Typography;

const DEFAULT_ARRAY_TEXT = '64, 34, 25, 12, 22, 11, 90';
const DEFAULT_ARRAY = [64, 34, 25, 12, 22, 11, 90];

const SPEED_OPTIONS = [
  { value: 1000, label: 'Slow' },
  { value: 500, label: 'Medium' },
  { value: 200, label: 'Fast' },
];

const COLORS = {
  normal: '#3498db',
  comparing: '#e74c3c',
  swapping: '#2ecc71',
  sorted: '#9b59b6',
};

const READY_MESSAGE = 'Ready to sort. Click "Start Sorting" or "Next Step".';

const cellStyle = { border: '1px solid #ddd', padding: 8, textAlign: 'left' };

// Same parsing rule as the original page: split on commas, coerce with
// Number (so blank segments become 0, same quirk as the legacy page), drop
// NaNs, and fall back to the default array if nothing usable was typed.
function parseArrayText(text) {
  const parsed = text
    .split(',')
    .map(Number)
    .filter((n) => !Number.isNaN(n));
  return parsed.length > 0 ? parsed : DEFAULT_ARRAY;
}

// Generate every compare/swap/sorted/complete step bubble sort performs for
// the given array -- this mirrors generateBubbleSortSteps() from bubble.html
// exactly (same comparisons, same swaps, same messages).
function generateBubbleSortSteps(inputArray) {
  const arr = [...inputArray];
  const n = arr.length;
  const steps = [];

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        type: 'compare',
        indices: [j, j + 1],
        message: `Comparing ${arr[j]} and ${arr[j + 1]}`,
      });

      if (arr[j] > arr[j + 1]) {
        steps.push({
          type: 'swap',
          indices: [j, j + 1],
          message: `${arr[j]} > ${arr[j + 1]}, swapping them`,
        });
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }

    steps.push({
      type: 'sorted',
      index: n - i - 1,
      message: `Element ${arr[n - i - 1]} is now in its final position`,
    });
  }

  if (n > 0) {
    steps.push({
      type: 'complete',
      message: 'Sorting complete! The array is now fully sorted.',
    });
  }

  return steps;
}

// Replay steps[0..stepIndex) onto the base array to derive the array values,
// the active highlight and the sorted markers to render. Driving everything
// from a pure replay (instead of mutating array/DOM state incrementally, as
// the original did) keeps the animation entirely state-driven and immune to
// stale-closure bugs.
function replaySteps(baseArray, steps, stepIndex) {
  const array = [...baseArray];
  const sortedIndices = new Set();
  let highlight = null;
  let message = READY_MESSAGE;

  for (let i = 0; i < stepIndex; i++) {
    const step = steps[i];
    message = step.message;

    switch (step.type) {
      case 'compare':
        highlight = { type: 'comparing', indices: step.indices };
        break;
      case 'swap': {
        highlight = { type: 'swapping', indices: step.indices };
        const [a, b] = step.indices;
        [array[a], array[b]] = [array[b], array[a]];
        break;
      }
      case 'sorted':
        sortedIndices.add(step.index);
        highlight = null;
        break;
      case 'complete':
        for (let k = 0; k < array.length; k++) sortedIndices.add(k);
        highlight = null;
        break;
      default:
        break;
    }
  }

  return { array, sortedIndices, highlight, message };
}

export default function BubbleSortVisualizer() {
  const [arrayText, setArrayText] = useState(DEFAULT_ARRAY_TEXT);
  const [speed, setSpeed] = useState(500);
  const [baseArray, setBaseArray] = useState(() => parseArrayText(DEFAULT_ARRAY_TEXT));
  const [steps, setSteps] = useState(() =>
    generateBubbleSortSteps(parseArrayText(DEFAULT_ARRAY_TEXT)),
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [isSorting, setIsSorting] = useState(false);

  const finished = stepIndex >= steps.length;

  const { array, sortedIndices, highlight, message } = useMemo(
    () => replaySteps(baseArray, steps, stepIndex),
    [baseArray, steps, stepIndex],
  );

  // Auto-play loop: advance one step every `speed` ms while sorting, exactly
  // like the original's recursive setTimeout chain in performStep().
  useEffect(() => {
    if (!isSorting) return undefined;
    if (stepIndex >= steps.length) {
      setIsSorting(false);
      return undefined;
    }
    const timer = setTimeout(() => {
      setStepIndex((i) => Math.min(i + 1, steps.length));
    }, speed);
    return () => clearTimeout(timer);
  }, [isSorting, stepIndex, steps, speed]);

  const handleReset = () => {
    const parsed = parseArrayText(arrayText);
    setBaseArray(parsed);
    setSteps(generateBubbleSortSteps(parsed));
    setStepIndex(0);
    setIsSorting(false);
  };

  const handleStart = () => {
    if (isSorting || finished) return;
    setIsSorting(true);
    // The original applies the first step synchronously the moment "Start
    // Sorting" is clicked, then waits `speed` ms between every later step --
    // replicate that instant first move here.
    setStepIndex((i) => Math.min(i + 1, steps.length));
  };

  const handleNextStep = () => {
    if (isSorting) return;
    setStepIndex((i) => Math.min(i + 1, steps.length));
  };

  const maxValue = Math.max(...array, 1);

  const barColor = (index) => {
    if (sortedIndices.has(index)) return COLORS.sorted;
    if (highlight && highlight.indices.includes(index)) return COLORS[highlight.type];
    return COLORS.normal;
  };

  return (
    <PageLayout
      title="Bubble Sort Visualizer"
      subtitle="Step through -- or auto-play -- every comparison and swap bubble sort makes."
      wide
    >
      <Card style={{ marginBottom: 20 }}>
        <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>
              Array (comma-separated numbers)
            </Text>
            <Input
              value={arrayText}
              onChange={(e) => setArrayText(e.target.value)}
              placeholder="e.g. 64, 34, 25, 12, 22, 11, 90"
            />
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>
              Animation Speed
            </Text>
            <Select value={speed} onChange={setSpeed} options={SPEED_OPTIONS} style={{ width: 160 }} />
          </div>

          <Space wrap>
            <Button
              type="primary"
              icon={<CaretRightOutlined />}
              onClick={handleStart}
              disabled={isSorting || finished}
            >
              Start Sorting
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              Reset
            </Button>
            <Button
              icon={<StepForwardOutlined />}
              onClick={handleNextStep}
              disabled={isSorting || finished}
            >
              Next Step
            </Button>
          </Space>
        </Space>
      </Card>

      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            height: 300,
            margin: '20px 0',
            gap: 5,
            overflowX: 'auto',
          }}
        >
          {array.map((value, index) => (
            <div
              key={index}
              style={{
                width: 40,
                flexShrink: 0,
                background: barColor(index),
                transition: 'all 0.3s ease',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                color: '#fff',
                fontWeight: 'bold',
                position: 'relative',
                height: `${(value / maxValue) * 100}%`,
                paddingBottom: 4,
              }}
            >
              {value}
            </div>
          ))}
        </div>

        <Space size={20} wrap style={{ justifyContent: 'center', width: '100%', marginTop: 15 }}>
          {[
            ['Normal', COLORS.normal],
            ['Comparing', COLORS.comparing],
            ['Swapping', COLORS.swapping],
            ['Sorted', COLORS.sorted],
          ].map(([label, color]) => (
            <Space key={label} size={6}>
              <div style={{ width: 20, height: 20, borderRadius: 3, background: color }} />
              <Text style={{ fontSize: 14 }}>{label}</Text>
            </Space>
          ))}
        </Space>

        <div
          style={{
            marginTop: 20,
            padding: 15,
            backgroundColor: '#f8f9fa',
            borderRadius: 4,
            borderLeft: '4px solid #3498db',
            minHeight: 60,
            textAlign: 'left',
          }}
        >
          {message}
        </div>
      </Card>

      <Card style={{ marginTop: 20, textAlign: 'left' }}>
        <Title level={2}>How Bubble Sort Works</Title>
        <Paragraph>
          Bubble Sort is a simple sorting algorithm that repeatedly steps through the list,
          compares adjacent elements and swaps them if they are in the wrong order.
        </Paragraph>

        <Title level={3}>Algorithm Steps</Title>
        <ol>
          <li>Start at the beginning of the array</li>
          <li>Compare the current element with the next one</li>
          <li>If they are in the wrong order, swap them</li>
          <li>Move to the next pair</li>
          <li>Repeat until no more swaps are needed</li>
        </ol>

        <Title level={3}>Time Complexity</Title>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <th style={cellStyle}>Case</th>
              <th style={cellStyle}>Time Complexity</th>
            </tr>
            <tr>
              <td style={cellStyle}>Best Case (Already sorted)</td>
              <td style={cellStyle}>O(n)</td>
            </tr>
            <tr>
              <td style={cellStyle}>Average Case</td>
              <td style={cellStyle}>O(n²)</td>
            </tr>
            <tr>
              <td style={cellStyle}>Worst Case (Reverse sorted)</td>
              <td style={cellStyle}>O(n²)</td>
            </tr>
          </tbody>
        </table>

        <Title level={3}>Characteristics</Title>
        <ul>
          <li>Simple to understand and implement</li>
          <li>Inefficient for large datasets</li>
          <li>Stable (maintains relative order of equal elements)</li>
          <li>Performs well on nearly sorted data</li>
        </ul>
      </Card>
    </PageLayout>
  );
}
