import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Radio, Space, Tag, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import PageLayout from '../components/PageLayout.jsx';
import DsaCodeRunner from '../components/DsaCodeRunner.jsx';
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
import hrQuestions from '../data/content/hr-questions.json';
import './MockInterview.css';

const { Title, Paragraph, Text } = Typography;

const ALL_DSA_PROBLEMS = [
  ...arraysStrings, ...linkedList, ...stack, ...binarySearch, ...trees,
  ...tries, ...heap, ...backtracking, ...graphs, ...dp, ...greedy,
].map((p) => ({ ...p, kind: 'dsa' }));

const ALL_HR_QUESTIONS = hrQuestions.map((q) => ({ ...q, kind: 'hr' }));

const DIFFICULTY_COLOR = { Easy: 'success', Medium: 'warning', Hard: 'error' };

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

function pickRandom(pool, n) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function buildQuestionSet(roundType, questionCount) {
  let picked = [];
  if (roundType === 'technical') {
    picked = pickRandom(ALL_DSA_PROBLEMS, questionCount);
  } else if (roundType === 'behavioral') {
    picked = pickRandom(ALL_HR_QUESTIONS, questionCount);
  } else {
    const dsaCount = Math.ceil(questionCount / 2);
    const hrCount = questionCount - dsaCount;
    picked = [...pickRandom(ALL_DSA_PROBLEMS, dsaCount), ...pickRandom(ALL_HR_QUESTIONS, hrCount)];
  }
  return pickRandom(picked, picked.length); // shuffle final order
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function DsaQuestion({ problem }) {
  return (
    <>
      <div className="mock-question-header">
        <Title level={3} style={{ margin: 0 }}>
          {problem.title}
        </Title>
        <Tag color={DIFFICULTY_COLOR[problem.difficulty]}>{problem.difficulty}</Tag>
      </div>
      {renderRichText(problem.statement)}
      {problem.examples.map((ex, i) => (
        <div className="mock-example" key={i}>
          <Text strong>Example {i + 1}:</Text>
          <div className="mock-example-row">
            <span>Input:</span>
            <code>{ex.input}</code>
          </div>
          <div className="mock-example-row">
            <span>Output:</span>
            <code>{ex.output}</code>
          </div>
        </div>
      ))}
      <Title level={4}>Your Solution</Title>
      <DsaCodeRunner
        key={problem.key}
        starterCode={problem.starterCode}
        functionName={problem.functionName}
        testCases={problem.testCases}
      />
    </>
  );
}

function HrQuestion({ question }) {
  const [answer, setAnswer] = useState('');
  const [showSample, setShowSample] = useState(false);

  return (
    <>
      <Title level={3} style={{ margin: '0 0 16px' }}>
        {question.question}
      </Title>
      <Paragraph type="secondary">
        Say your answer out loud or type it here — practicing the delivery matters as much as the content.
      </Paragraph>
      <textarea
        key={question.key}
        className="mock-hr-answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type or outline your answer here..."
        rows={6}
      />
      <div style={{ marginTop: 16 }}>
        {showSample ? (
          <Paragraph>{question.answer}</Paragraph>
        ) : (
          <Button onClick={() => setShowSample(true)}>Show Sample Answer</Button>
        )}
      </div>
    </>
  );
}

export default function MockInterview() {
  const [phase, setPhase] = useState('setup'); // 'setup' | 'in-progress' | 'finished'
  const [roundType, setRoundType] = useState('mixed');
  const [questionCount, setQuestionCount] = useState(5);
  const [durationMinutes, setDurationMinutes] = useState(45);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attemptedCount, setAttemptedCount] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);

  useEffect(() => {
    if (phase !== 'in-progress') return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === 'in-progress' && secondsLeft === 0 && totalSeconds > 0) {
      setPhase('finished');
    }
  }, [secondsLeft, phase, totalSeconds]);

  function startInterview() {
    const built = buildQuestionSet(roundType, questionCount);
    setQuestions(built);
    setCurrentIndex(0);
    setAttemptedCount(0);
    const total = durationMinutes * 60;
    setTotalSeconds(total);
    setSecondsLeft(total);
    setPhase('in-progress');
  }

  function nextQuestion() {
    setAttemptedCount((n) => Math.max(n, currentIndex + 1));
    if (currentIndex + 1 >= questions.length) {
      setPhase('finished');
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function finishNow() {
    setAttemptedCount((n) => Math.max(n, currentIndex + 1));
    setPhase('finished');
  }

  function restart() {
    setPhase('setup');
  }

  const timeUsed = totalSeconds - secondsLeft;
  const lowTime = secondsLeft <= 300;

  if (phase === 'setup') {
    return (
      <PageLayout
        title="Mock Interview"
        subtitle="A timed session mixing DSA problems and HR questions — practice under real interview pressure, not just untimed reading."
      >
        <Card>
          <Title level={4}>Round Type</Title>
          <Radio.Group value={roundType} onChange={(e) => setRoundType(e.target.value)}>
            <Radio.Button value="technical">Technical (DSA only)</Radio.Button>
            <Radio.Button value="behavioral">Behavioral (HR only)</Radio.Button>
            <Radio.Button value="mixed">Mixed</Radio.Button>
          </Radio.Group>

          <Title level={4} style={{ marginTop: 24 }}>
            Number of Questions
          </Title>
          <Radio.Group value={questionCount} onChange={(e) => setQuestionCount(e.target.value)}>
            <Radio.Button value={3}>3</Radio.Button>
            <Radio.Button value={5}>5</Radio.Button>
            <Radio.Button value={7}>7</Radio.Button>
          </Radio.Group>

          <Title level={4} style={{ marginTop: 24 }}>
            Duration
          </Title>
          <Radio.Group value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)}>
            <Radio.Button value={30}>30 min</Radio.Button>
            <Radio.Button value={45}>45 min</Radio.Button>
            <Radio.Button value={60}>60 min</Radio.Button>
          </Radio.Group>

          <div style={{ marginTop: 32 }}>
            <Button type="primary" size="large" onClick={startInterview}>
              Start Interview
            </Button>
          </div>
        </Card>
      </PageLayout>
    );
  }

  if (phase === 'finished') {
    return (
      <PageLayout title="Interview Complete" subtitle="Here's what you covered — go back and review anything you want to look at again.">
        <Card>
          <Title level={2}>
            {attemptedCount} / {questions.length} questions covered
          </Title>
          <Text type="secondary">
            Time used: {formatTime(timeUsed)} / {formatTime(totalSeconds)}
          </Text>

          <div className="mock-results-list">
            {questions.map((q, i) => (
              <div className="mock-results-row" key={q.key}>
                <Tag color={q.kind === 'dsa' ? 'blue' : 'purple'}>{q.kind === 'dsa' ? 'DSA' : 'HR'}</Tag>
                <span className="mock-results-title">{i < attemptedCount ? '✓ ' : ''}{q.kind === 'dsa' ? q.title : q.question}</span>
                <Link to={q.kind === 'dsa' ? '/dsa-practice' : '/hr-questions'}>Review →</Link>
              </div>
            ))}
          </div>

          <Space style={{ marginTop: 24 }}>
            <Button type="primary" onClick={restart}>
              Start Another Mock Interview
            </Button>
          </Space>
        </Card>
      </PageLayout>
    );
  }

  const current = questions[currentIndex];

  return (
    <PageLayout title="Mock Interview" subtitle="" wide>
      <div className="mock-toolbar">
        <Text strong>
          Question {currentIndex + 1} of {questions.length}
        </Text>
        <Tag icon={<ClockCircleOutlined />} color={lowTime ? 'error' : 'default'} className="mock-timer">
          {formatTime(secondsLeft)}
        </Tag>
        <Button danger onClick={finishNow}>
          Finish Interview
        </Button>
      </div>

      <Card>
        {current.kind === 'dsa' ? <DsaQuestion problem={current} /> : <HrQuestion question={current} />}

        <div style={{ marginTop: 32 }}>
          <Button type="primary" size="large" onClick={nextQuestion}>
            {currentIndex + 1 >= questions.length ? 'Finish Interview' : 'Next Question →'}
          </Button>
        </div>
      </Card>
    </PageLayout>
  );
}
