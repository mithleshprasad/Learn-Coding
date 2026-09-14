import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Progress, Segmented, Tag, Typography } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import PageLayout from '../components/PageLayout.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import DsaCodeRunner from '../components/DsaCodeRunner.jsx';
import AskAi from '../components/AskAi.jsx';
import topics from '../data/dsaTopics.json';
import arraysStrings from '../data/content/dsa-problems/arrays-strings.json';
import linkedList from '../data/content/dsa-problems/linked-list.json';
import stack from '../data/content/dsa-problems/stack.json';
import binarySearch from '../data/content/dsa-problems/binary-search.json';
import trees from '../data/content/dsa-problems/trees.json';
import tries from '../data/content/dsa-problems/tries.json';
import heap from '../data/content/dsa-problems/heap.json';
import backtracking from '../data/content/dsa-problems/backtracking.json';
import graphs from '../data/content/dsa-problems/graphs.json';
import dp from '../data/content/dsa-problems/dp.json';
import greedy from '../data/content/dsa-problems/greedy.json';
import './DsaPractice.css';

const { Title, Paragraph, Text } = Typography;

const PROBLEMS_BY_TOPIC = {
  'arrays-strings': arraysStrings,
  'linked-list': linkedList,
  stack,
  'binary-search': binarySearch,
  trees,
  tries,
  heap,
  backtracking,
  graphs,
  dp,
  greedy,
};

const PROGRESS_KEY = 'dsaPractice.progress';
const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Done'];
const STATUS_TO_LABEL = { done: 'Done', 'in-progress': 'In Progress' };
const LABEL_TO_STATUS = { 'Not Started': undefined, 'In Progress': 'in-progress', Done: 'done' };

const DIFFICULTY_COLOR = { Easy: 'success', Medium: 'warning', Hard: 'error' };

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Renders `**bold**` and `` `code` `` inline spans, plus blank-line paragraph
// breaks, matching the lightweight markdown convention used elsewhere on
// this site's tutorial pages.
function renderRichText(text) {
  return text.split(/\n\n+/).map((paragraph, pIndex) => (
    <Paragraph key={pIndex} style={{ marginBottom: 10 }}>
      {paragraph.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return <Text code key={i}>{part.slice(1, -1)}</Text>;
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <Text strong key={i}>{part.slice(2, -2)}</Text>;
        }
        return part;
      })}
    </Paragraph>
  ));
}

export default function DsaPractice() {
  const allProblems = useMemo(
    () => topics.flatMap((t) => PROBLEMS_BY_TOPIC[t.key].map((p) => ({ ...p, topicKey: t.key }))),
    [],
  );

  const [expandedTopic, setExpandedTopic] = useState(topics[0].key);
  const [selectedKey, setSelectedKey] = useState(allProblems[0]?.key);
  const [progress, setProgress] = useState(loadProgress);
  const [revealedHints, setRevealedHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }, [progress]);

  const selected = allProblems.find((p) => p.key === selectedKey) ?? allProblems[0];

  const selectProblem = useCallback((problem) => {
    setSelectedKey(problem.key);
    setExpandedTopic(problem.topicKey);
    setRevealedHints(0);
    setShowSolution(false);
  }, []);

  const setStatus = useCallback((key, status) => {
    setProgress((prev) => {
      const next = { ...prev };
      if (status) next[key] = status;
      else delete next[key];
      return next;
    });
  }, []);

  const doneCount = Object.values(progress).filter((s) => s === 'done').length;

  const aiContext = selected
    ? `DSA problem: ${selected.title} (${selected.difficulty})\n\n${selected.statement}\n\nExamples:\n${selected.examples
        .map((e) => `Input: ${e.input}\nOutput: ${e.output}`)
        .join('\n')}`
    : '';

  return (
    <PageLayout
      title="DSA Practice"
      subtitle="The cross-company must-do list — Arrays through Greedy, with hints, solutions, and a runnable judge for every problem."
      sidebar={
        <nav className="dsa-sidebar" aria-label="DSA topics">
          <div className="dsa-sidebar-progress">
            <Text className="dsa-sidebar-progress-label">
              {doneCount} / {allProblems.length} done
            </Text>
            <Progress
              percent={Math.round((doneCount / allProblems.length) * 100)}
              size="small"
              showInfo={false}
              strokeColor="#2f8d46"
            />
          </div>
          <ul className="dsa-topic-list">
            {topics.map((topic) => {
              const problems = PROBLEMS_BY_TOPIC[topic.key];
              const isExpanded = topic.key === expandedTopic;
              const topicDone = problems.filter((p) => progress[p.key] === 'done').length;
              return (
                <li key={topic.key}>
                  <button
                    type="button"
                    className={'dsa-topic-header' + (isExpanded ? ' dsa-topic-header-active' : '')}
                    onClick={() => setExpandedTopic(isExpanded ? null : topic.key)}
                  >
                    {isExpanded ? <DownOutlined /> : <RightOutlined />}
                    <span>{topic.label}</span>
                    <span className="dsa-topic-count">
                      {topicDone}/{problems.length}
                    </span>
                  </button>
                  {isExpanded ? (
                    <ul className="dsa-problem-list">
                      {problems.map((p) => {
                        const status = progress[p.key];
                        return (
                          <li key={p.key}>
                            <button
                              type="button"
                              className={
                                'dsa-problem-link' + (p.key === selectedKey ? ' dsa-problem-link-active' : '')
                              }
                              onClick={() => selectProblem({ ...p, topicKey: topic.key })}
                            >
                              <span className={`dsa-status-dot dsa-status-dot-${status || 'none'}`} />
                              {p.number}. {p.title}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>
      }
    >
      {selected ? (
        <div key={selected.key}>
          <div className="dsa-problem-header">
            <Title level={2} style={{ margin: 0 }}>
              {selected.number}. {selected.title}
            </Title>
            <Tag color={DIFFICULTY_COLOR[selected.difficulty]}>{selected.difficulty}</Tag>
          </div>

          <Segmented
            style={{ marginBottom: 20 }}
            options={STATUS_OPTIONS}
            value={STATUS_TO_LABEL[progress[selected.key]] ?? 'Not Started'}
            onChange={(label) => setStatus(selected.key, LABEL_TO_STATUS[label])}
          />

          {renderRichText(selected.statement)}

          {selected.examples.map((ex, i) => (
            <div className="dsa-example" key={i}>
              <Text strong>Example {i + 1}:</Text>
              <div className="dsa-example-row">
                <span>Input:</span>
                <code>{ex.input}</code>
              </div>
              <div className="dsa-example-row">
                <span>Output:</span>
                <code>{ex.output}</code>
              </div>
              {ex.explanation ? (
                <div className="dsa-example-row">
                  <span>Explanation:</span>
                  <span>{ex.explanation}</span>
                </div>
              ) : null}
            </div>
          ))}

          {selected.constraints?.length ? (
            <>
              <Title level={4}>Constraints</Title>
              <ul>
                {selected.constraints.map((c, i) => (
                  <li key={i}>
                    <Text code>{c}</Text>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <Title level={4}>Try It</Title>
          <DsaCodeRunner
            starterCode={selected.starterCode}
            functionName={selected.functionName}
            testCases={selected.testCases}
          />

          <Title level={4}>Hints</Title>
          <div className="dsa-hints">
            {selected.hints.slice(0, revealedHints).map((hint, i) => (
              <Paragraph key={i} className="dsa-hint-revealed">
                <Text strong>Hint {i + 1}:</Text> {hint}
              </Paragraph>
            ))}
            {revealedHints < selected.hints.length ? (
              <Button onClick={() => setRevealedHints((n) => n + 1)}>
                Show Hint {revealedHints + 1} of {selected.hints.length}
              </Button>
            ) : null}
          </div>

          <Title level={4} style={{ marginTop: 32 }}>
            Solution
          </Title>
          {showSolution ? (
            <>
              {renderRichText(selected.solution.approach)}
              <CodeBlock language={selected.solution.language} code={selected.solution.code} />
              <Text type="secondary">
                Time: {selected.solution.timeComplexity} &nbsp;·&nbsp; Space: {selected.solution.spaceComplexity}
              </Text>
            </>
          ) : (
            <Button onClick={() => setShowSolution(true)}>Show Solution</Button>
          )}

          <Title level={4} style={{ marginTop: 32 }}>
            Ask AI
          </Title>
          <AskAi
            context={aiContext}
            heading="🤖 Paste your approach or ask AI to explain/solve this problem"
          />
        </div>
      ) : null}
    </PageLayout>
  );
}
