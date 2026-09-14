import { useCallback, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { Button, Input, Tag, Typography } from 'antd';
import { CaretRightOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import './DsaCodeRunner.css';

const { Text } = Typography;

function formatValue(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/**
 * Compiles the user's code with `new Function` (isolated scope, no access to
 * this component's closure) and pulls out the named function, so we never
 * pollute — or read from — the surrounding app state. This is a client-side
 * judge only: the user runs their own code in their own tab, same trust
 * model as the site's other in-browser code editor.
 */
function compileFunction(code, functionName) {
  // eslint-disable-next-line no-new-func
  const factory = new Function(`${code}\nreturn typeof ${functionName} === 'function' ? ${functionName} : undefined;`);
  return factory();
}

function runTests(code, functionName, testCases) {
  let fn;
  try {
    fn = compileFunction(code, functionName);
  } catch (err) {
    return { compileError: err.message, results: [] };
  }

  if (typeof fn !== 'function') {
    return { compileError: `No function named "${functionName}" was found in your code.`, results: [] };
  }

  const results = testCases.map((tc) => {
    try {
      const actual = fn(...tc.args.map((a) => (Array.isArray(a) ? [...a] : a)));
      const pass = JSON.stringify(actual) === JSON.stringify(tc.expected);
      return { pass, actual, error: null };
    } catch (err) {
      return { pass: false, actual: undefined, error: err.message };
    }
  });

  return { compileError: null, results };
}

// Runs the user's function against one custom, user-typed set of arguments.
// No pass/fail verdict — like LeetCode's "Run" (vs "Submit"), this just shows
// what your code actually returns so you can sanity-check it yourself.
function runCustom(code, functionName, argsText) {
  let args;
  try {
    args = JSON.parse(argsText);
    if (!Array.isArray(args)) throw new Error('Arguments must be a JSON array, e.g. [[2,7,11,15], 9]');
  } catch (err) {
    return { error: `Invalid arguments: ${err.message}` };
  }

  let fn;
  try {
    fn = compileFunction(code, functionName);
  } catch (err) {
    return { error: err.message };
  }
  if (typeof fn !== 'function') {
    return { error: `No function named "${functionName}" was found in your code.` };
  }

  try {
    return { actual: fn(...args) };
  } catch (err) {
    return { error: err.message };
  }
}

export default function DsaCodeRunner({ starterCode, functionName, testCases }) {
  const [code, setCode] = useState(starterCode);
  const [outcome, setOutcome] = useState(null); // { compileError, results } | null
  const [showCustom, setShowCustom] = useState(false);
  const [customArgs, setCustomArgs] = useState(formatValue(testCases[0]?.args ?? []));
  const [customResult, setCustomResult] = useState(null); // { actual } | { error } | null

  const handleRun = useCallback(() => {
    setOutcome(runTests(code, functionName, testCases));
  }, [code, functionName, testCases]);

  const handleReset = useCallback(() => {
    setCode(starterCode);
    setOutcome(null);
    setCustomResult(null);
  }, [starterCode]);

  const handleRunCustom = useCallback(() => {
    setCustomResult(runCustom(code, functionName, customArgs));
  }, [code, functionName, customArgs]);

  const passCount = outcome?.results.filter((r) => r.pass).length ?? 0;
  const totalCount = testCases.length;

  return (
    <div className="dsa-runner">
      <div className="dsa-runner-editor">
        <CodeMirror
          value={code}
          height="220px"
          theme={oneDark}
          extensions={[javascript()]}
          onChange={setCode}
        />
      </div>

      <div className="dsa-runner-controls">
        <Button type="primary" icon={<CaretRightOutlined />} onClick={handleRun}>
          Run Tests
        </Button>
        <Button icon={<PlusOutlined />} onClick={() => setShowCustom((v) => !v)}>
          Custom Test Case
        </Button>
        <Button icon={<ReloadOutlined />} onClick={handleReset}>
          Reset
        </Button>
        {outcome && !outcome.compileError ? (
          <Tag color={passCount === totalCount ? 'success' : 'error'} className="dsa-runner-summary">
            {passCount} / {totalCount} passed
          </Tag>
        ) : null}
      </div>

      {showCustom ? (
        <div className="dsa-runner-custom">
          <Text type="secondary" className="dsa-runner-custom-label">
            Arguments as a JSON array (matches the function's parameter order):
          </Text>
          <div className="dsa-runner-custom-row">
            <Input
              value={customArgs}
              onChange={(e) => setCustomArgs(e.target.value)}
              placeholder="[[2,7,11,15], 9]"
              onPressEnter={handleRunCustom}
            />
            <Button onClick={handleRunCustom}>Run</Button>
          </div>
          {customResult ? (
            <div className="dsa-runner-case-row">
              <span>Output:</span>
              <code>
                {customResult.error ? `Error: ${customResult.error}` : formatValue(customResult.actual)}
              </code>
            </div>
          ) : null}
        </div>
      ) : null}

      {outcome?.compileError ? (
        <div className="dsa-runner-case dsa-runner-case-fail">
          <Text strong>Error</Text>
          <pre>{outcome.compileError}</pre>
        </div>
      ) : null}

      {outcome?.results.map((r, i) => (
        <div key={i} className={`dsa-runner-case ${r.pass ? 'dsa-runner-case-pass' : 'dsa-runner-case-fail'}`}>
          <Text strong>
            {r.pass ? '✓' : '✗'} Test case {i + 1}
          </Text>
          <div className="dsa-runner-case-row">
            <span>Input:</span>
            <code>{testCases[i].args.map(formatValue).join(', ')}</code>
          </div>
          <div className="dsa-runner-case-row">
            <span>Expected:</span>
            <code>{formatValue(testCases[i].expected)}</code>
          </div>
          <div className="dsa-runner-case-row">
            <span>Got:</span>
            <code>{r.error ? `Error: ${r.error}` : formatValue(r.actual)}</code>
          </div>
        </div>
      ))}
    </div>
  );
}
