import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Select, Space, Typography } from 'antd';
import { CaretRightOutlined, ReloadOutlined, StepForwardOutlined } from '@ant-design/icons';
import PageLayout from '../components/PageLayout.jsx';
import CodeBlock from '../components/CodeBlock.jsx';

const { Title, Paragraph, Text } = Typography;

const DEFAULT_ARRAY_TEXT = '38, 27, 43, 3, 9, 82, 10';
const DEFAULT_ARRAY = [38, 27, 43, 3, 9, 82, 10];

const SPEED_OPTIONS = [
  { value: 1500, label: 'Slow' },
  { value: 800, label: 'Medium' },
  { value: 400, label: 'Fast' },
];

const COLORS = {
  normal: '#3498db',
  dividing: '#e74c3c',
  comparing: '#f39c12',
  merging: '#2ecc71',
  sorted: '#9b59b6',
};

const READY_MESSAGE = 'Ready to sort. Click "Start Sorting" or "Next Step".';
const COMPLETE_MESSAGE = 'Sorting complete! The array is now fully sorted.';

const cellStyle = { border: '1px solid #ddd', padding: 8, textAlign: 'left' };

const MERGE_SORT_CODE = `
function mergeSort(array) {
    if (array.length <= 1) return array;

    const middle = Math.floor(array.length / 2);
    const left = array.slice(0, middle);
    const right = array.slice(middle);

    return merge(mergeSort(left), mergeSort(right));
}

function merge(left, right) {
    let result = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
        if (left[leftIndex] < right[rightIndex]) {
            result.push(left[leftIndex]);
            leftIndex++;
        } else {
            result.push(right[rightIndex]);
            rightIndex++;
        }
    }

    return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
}
`;

// Same parsing rule as the original page: split on commas, coerce with
// Number (blank segments become 0, same quirk as the legacy page), drop
// NaNs, and fall back to the default array if nothing usable was typed.
function parseArrayText(text) {
  const parsed = text
    .split(',')
    .map(Number)
    .filter((n) => !Number.isNaN(n));
  return parsed.length > 0 ? parsed : DEFAULT_ARRAY;
}

// Recursively generate the divide-left / divide-right / merge / base-case
// steps merge sort performs, mirroring generateMergeSortSteps() from
// merge.html exactly -- same recursion order, same captured left/right
// slices, same messages, same depth/parentId bookkeeping for the call stack.
function generateMergeSortSteps(inputArray) {
  const steps = [];

  function recurse(arr, depth = 0, parentId = null) {
    const stepId = steps.length;

    if (arr.length <= 1) {
      steps.push({
        type: 'base-case',
        array: [...arr],
        depth,
        parentId,
        message: `Base case reached (single element: ${arr[0]})`,
      });
      return;
    }

    const mid = Math.floor(arr.length / 2);
    const left = arr.slice(0, mid);
    const right = arr.slice(mid);

    steps.push({
      type: 'divide-left',
      array: [...arr],
      left: [...left],
      right: [...right],
      depth,
      parentId,
      message: `Dividing array [${arr}] into left half [${left}]`,
    });
    recurse(left, depth + 1, stepId);

    steps.push({
      type: 'divide-right',
      array: [...arr],
      left: [...left],
      right: [...right],
      depth,
      parentId,
      message: `Dividing array [${arr}] into right half [${right}]`,
    });
    recurse(right, depth + 1, stepId);

    steps.push({
      type: 'merge',
      array: [...arr],
      left: [...left],
      right: [...right],
      depth,
      parentId,
      message: `Merging sorted halves [${left}] and [${right}]`,
    });
  }

  recurse(inputArray);
  return steps;
}

// Replay steps[0..stepIndex) onto the base array to derive the displayed
// array, the active dividing/merging highlight, the call stack panel and the
// step message -- all pure/derived, no direct DOM mutation. `steps.length`
// real steps exist, plus one trailing "complete" state (stepIndex ===
// maxStepIndex) that mirrors the original's extra tick where performStep()
// notices currentStep >= steps.length and paints every bar sorted.
function replayMergeSort(baseArray, steps, stepIndex) {
  const maxStepIndex = steps.length + 1;
  const displayArray = [...baseArray];
  let highlightType = null;
  let highlightIndices = [];
  let message = READY_MESSAGE;
  let callStack = [];

  const appliedCount = Math.min(stepIndex, steps.length);
  for (let i = 0; i < appliedCount; i++) {
    const step = steps[i];
    message = step.message;

    if (step.type === 'divide-left' || step.type === 'divide-right' || step.type === 'merge') {
      callStack.push(step);
    } else if (step.type === 'base-case') {
      callStack = callStack.filter((s) => s.depth < step.depth);
    }

    if (step.type === 'divide-left' || step.type === 'divide-right') {
      highlightType = 'dividing';
      highlightIndices = [];
      const startIndex = displayArray.indexOf(step.array[0]);
      if (startIndex !== -1) {
        for (let k = 0; k < step.array.length; k++) {
          if (startIndex + k < displayArray.length) highlightIndices.push(startIndex + k);
        }
      }
    } else if (step.type === 'merge') {
      // Both halves are already individually sorted by the time this step
      // runs (their own recursive merge steps ran first); sorting the union
      // of the original left/right values yields the same result as a
      // proper merge, exactly like the original's performVisualMerge().
      const mergedArray = [...step.left, ...step.right].sort((a, b) => a - b);
      const startIndex = displayArray.indexOf(step.array[0]);
      highlightType = 'merging';
      highlightIndices = [];
      if (startIndex !== -1) {
        for (let k = 0; k < mergedArray.length; k++) {
          if (startIndex + k < displayArray.length) {
            displayArray[startIndex + k] = mergedArray[k];
            highlightIndices.push(startIndex + k);
          }
        }
      }
    } else if (step.type === 'base-case') {
      highlightType = null;
      highlightIndices = [];
    }
  }

  const finished = stepIndex >= maxStepIndex;
  if (finished) {
    message = COMPLETE_MESSAGE;
    highlightType = 'sorted';
    highlightIndices = displayArray.map((_, idx) => idx);
  }

  return { displayArray, highlightType, highlightIndices, message, callStack, finished, maxStepIndex };
}

export default function MergeSortVisualizer() {
  const [arrayText, setArrayText] = useState(DEFAULT_ARRAY_TEXT);
  const [speed, setSpeed] = useState(800);
  const [baseArray, setBaseArray] = useState(() => parseArrayText(DEFAULT_ARRAY_TEXT));
  const [steps, setSteps] = useState(() =>
    generateMergeSortSteps(parseArrayText(DEFAULT_ARRAY_TEXT)),
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [isSorting, setIsSorting] = useState(false);

  const { displayArray, highlightType, highlightIndices, message, callStack, finished, maxStepIndex } =
    useMemo(() => replayMergeSort(baseArray, steps, stepIndex), [baseArray, steps, stepIndex]);

  // Auto-play loop: advance one step every `speed` ms while sorting, exactly
  // like the original's recursive setTimeout chain in performStep().
  useEffect(() => {
    if (!isSorting) return undefined;
    if (stepIndex >= maxStepIndex) {
      setIsSorting(false);
      return undefined;
    }
    const timer = setTimeout(() => {
      setStepIndex((i) => Math.min(i + 1, maxStepIndex));
    }, speed);
    return () => clearTimeout(timer);
  }, [isSorting, stepIndex, maxStepIndex, speed]);

  const handleReset = () => {
    const parsed = parseArrayText(arrayText);
    setBaseArray(parsed);
    setSteps(generateMergeSortSteps(parsed));
    setStepIndex(0);
    setIsSorting(false);
  };

  const handleStart = () => {
    if (isSorting || finished) return;
    setIsSorting(true);
    // The original applies the first step synchronously the moment "Start
    // Sorting" is clicked, then waits `speed` ms between every later step --
    // replicate that instant first move here.
    setStepIndex((i) => Math.min(i + 1, maxStepIndex));
  };

  const handleNextStep = () => {
    if (isSorting) return;
    setStepIndex((i) => Math.min(i + 1, maxStepIndex));
  };

  const maxValue = Math.max(...displayArray, 1);

  const barColor = (index) => {
    if (highlightType && highlightIndices.includes(index)) return COLORS[highlightType];
    return COLORS.normal;
  };

  return (
    <PageLayout
      title="Merge Sort Visualizer"
      subtitle="Watch the divide-and-conquer recursion split and merge the array back together."
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
              placeholder="e.g. 38, 27, 43, 3, 9, 82, 10"
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
          {displayArray.map((value, index) => (
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
            ['Dividing', COLORS.dividing],
            ['Comparing', COLORS.comparing],
            ['Merging', COLORS.merging],
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

        <div
          style={{
            marginTop: 20,
            padding: 15,
            backgroundColor: '#f8f9fa',
            borderRadius: 4,
            textAlign: 'left',
          }}
        >
          <Text strong>Call Stack:</Text>
          <br />
          {callStack.length === 0 ? (
            'Empty'
          ) : (
            callStack.map((s, i) => (
              <div key={i}>
                {'→'} {s.message}
              </div>
            ))
          )}
        </div>
      </Card>

      <Card style={{ marginTop: 20, textAlign: 'left' }}>
        <Title level={2}>How Merge Sort Works</Title>
        <Paragraph>Merge Sort is a divide-and-conquer algorithm that works by:</Paragraph>
        <ol>
          <li>
            <Text strong>Dividing</Text> the unsorted list into n sublists, each containing one
            element
          </li>
          <li>
            <Text strong>Repeatedly merging</Text> sublists to produce new sorted sublists until
            there is only one sublist remaining
          </li>
        </ol>

        <Title level={3}>Algorithm Steps</Title>
        <CodeBlock language="javascript" code={MERGE_SORT_CODE} />

        <Title level={3}>Time Complexity</Title>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <th style={cellStyle}>Case</th>
              <th style={cellStyle}>Time Complexity</th>
            </tr>
            <tr>
              <td style={cellStyle}>Best Case</td>
              <td style={cellStyle}>O(n log n)</td>
            </tr>
            <tr>
              <td style={cellStyle}>Average Case</td>
              <td style={cellStyle}>O(n log n)</td>
            </tr>
            <tr>
              <td style={cellStyle}>Worst Case</td>
              <td style={cellStyle}>O(n log n)</td>
            </tr>
          </tbody>
        </table>

        <Title level={3}>Space Complexity</Title>
        <Paragraph>O(n) - Requires additional space for the temporary arrays</Paragraph>
      </Card>
    </PageLayout>
  );
}
