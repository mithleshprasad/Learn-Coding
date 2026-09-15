import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Progress, Segmented, Tag, Typography } from 'antd';
import { BookOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import PageLayout from '../components/PageLayout.jsx';
import MermaidDiagram from '../components/MermaidDiagram.jsx';
import CapacityCalculator from '../components/CapacityCalculator.jsx';
import AskAi from '../components/AskAi.jsx';
import topics from '../data/systemDesignTopics.json';
import fundamentals from '../data/content/system-design/fundamentals.json';
import designProblems from '../data/content/system-design/design-problems.json';
import './SystemDesign.css';

const { Title, Paragraph, Text } = Typography;

const PROBLEMS_BY_TOPIC = {
  fundamentals,
  'design-problems': designProblems,
};

const FUNDAMENTALS_BY_KEY = Object.fromEntries(fundamentals.map((f) => [f.key, f]));

// Parking Lot is an OOP-design question (its own content says so explicitly)
// and Web Crawler's traffic isn't driven by users making requests - the
// DAU/requests-per-user model this calculator uses doesn't fit either one.
const CAPACITY_CALC_EXCLUDED = new Set(['parking-lot-system', 'web-crawler']);

const PROGRESS_KEY = 'systemDesign.progress';
const NOTES_KEY_PREFIX = 'systemDesign.notes.';
const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Done'];
const STATUS_TO_LABEL = { done: 'Done', 'in-progress': 'In Progress' };
const LABEL_TO_STATUS = { 'Not Started': undefined, 'In Progress': 'in-progress', Done: 'done' };
const DIFFICULTY_COLOR = { Easy: 'success', Medium: 'warning', Hard: 'error' };

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

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

export default function SystemDesign() {
  const allProblems = useMemo(
    () => topics.flatMap((t) => PROBLEMS_BY_TOPIC[t.key].map((p) => ({ ...p, topicKey: t.key }))),
    [],
  );

  // Supports deep links like /system-design?q=caching-strategies (used by
  // the "Related Fundamentals" cross-links on design problems) so landing
  // here opens straight to the right topic instead of always the first one.
  const [searchParams] = useSearchParams();
  const deepLinkKey = searchParams.get('q');
  const deepLinkProblem = deepLinkKey ? allProblems.find((p) => p.key === deepLinkKey) : undefined;
  const initialProblem = deepLinkProblem ?? allProblems[0];

  const [expandedTopic, setExpandedTopic] = useState(initialProblem?.topicKey ?? topics[0].key);
  const [selectedKey, setSelectedKey] = useState(initialProblem?.key);
  const [progress, setProgress] = useState(() => loadJson(PROGRESS_KEY, {}));
  const [revealedHints, setRevealedHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [notes, setNotes] = useState('');

  const selected = allProblems.find((p) => p.key === selectedKey) ?? allProblems[0];

  // The useState initializers above only run on first mount - clicking a
  // "Related Fundamentals" link while already on this page changes the URL
  // but doesn't remount the component, so the initial selection would
  // otherwise never update. This keeps it in sync on every ?q= change.
  useEffect(() => {
    const key = searchParams.get('q');
    if (!key || key === selectedKey) return;
    const problem = allProblems.find((p) => p.key === key);
    if (!problem) return;
    setSelectedKey(problem.key);
    setExpandedTopic(problem.topicKey);
    setRevealedHints(0);
    setShowSolution(false);
  }, [searchParams, allProblems, selectedKey]);

  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    if (!selected) return;
    setNotes(loadJson(NOTES_KEY_PREFIX + selected.key, ''));
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    localStorage.setItem(NOTES_KEY_PREFIX + selected.key, JSON.stringify(notes));
  }, [notes, selected]);

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
    ? `System design question: ${selected.title} (${selected.difficulty})\n\n${selected.statement}\n\nFunctional requirements: ${selected.requirements.functional.join('; ')}\nNon-functional requirements: ${selected.requirements.nonFunctional.join('; ')}`
    : '';

  return (
    <PageLayout
      title="System Design Practice"
      subtitle="Fundamentals plus classic design problems — requirements, an architecture diagram, hints, and a full walkthrough for each."
      sidebar={
        <nav className="dsa-sidebar" aria-label="System design topics">
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
                              {p.title}
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
              {selected.title}
            </Title>
            <Tag color={DIFFICULTY_COLOR[selected.difficulty]}>{selected.difficulty}</Tag>
          </div>

          <Segmented
            style={{ marginBottom: 20 }}
            options={STATUS_OPTIONS}
            value={STATUS_TO_LABEL[progress[selected.key]] ?? 'Not Started'}
            onChange={(label) => setStatus(selected.key, LABEL_TO_STATUS[label])}
          />

          {selected.relatedFundamentals?.length ? (
            <div className="sd-fundamentals-callout">
              <BookOutlined /> Related fundamentals:
              {selected.relatedFundamentals.map((key) => (
                <Link key={key} to={`/system-design?q=${key}`} className="sd-fundamentals-link">
                  {FUNDAMENTALS_BY_KEY[key]?.title ?? key}
                </Link>
              ))}
            </div>
          ) : null}

          {renderRichText(selected.statement)}

          <Title level={4}>Requirements</Title>
          <div className="sd-requirements">
            <div>
              <Text strong>Functional</Text>
              <ul>
                {selected.requirements.functional.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
            <div>
              <Text strong>Non-functional</Text>
              <ul>
                {selected.requirements.nonFunctional.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          {selected.topicKey === 'design-problems' && !CAPACITY_CALC_EXCLUDED.has(selected.key) ? (
            <CapacityCalculator key={selected.key} />
          ) : null}

          <Title level={4}>Architecture</Title>
          <MermaidDiagram definition={selected.diagram} />

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
            Try It Yourself
          </Title>
          <Paragraph type="secondary">{selected.practicePrompt}</Paragraph>
          <textarea
            className="sd-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Sketch your own approach here before revealing the solution — components, data model, API shape, trade-offs. Saved automatically in this browser."
            rows={8}
          />

          <Title level={4} style={{ marginTop: 32 }}>
            Solution
          </Title>
          {showSolution ? (
            <>
              {renderRichText(selected.solution.approach)}
              <Title level={5}>Key Points</Title>
              <ul>
                {selected.solution.keyPoints.map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
              </ul>
            </>
          ) : (
            <Button onClick={() => setShowSolution(true)}>Show Solution</Button>
          )}

          <Title level={4} style={{ marginTop: 32 }}>
            Ask AI
          </Title>
          <AskAi context={aiContext} heading="🤖 Ask AI about this design problem" />
        </div>
      ) : null}
    </PageLayout>
  );
}
