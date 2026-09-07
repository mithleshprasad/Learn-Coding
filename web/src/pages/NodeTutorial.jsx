import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Collapse, Input, Space, Typography, message } from 'antd';
import {
  DownloadOutlined,
  MoonOutlined,
  QuestionCircleOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import PageLayout from '../components/PageLayout.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import topics from '../data/content/node-tutorial.json';

const { Paragraph, Text } = Typography;

// `topics` (imported above) holds [question, answer] pairs, ported verbatim
// from the legacy node_tutorial.html `topics` array. Each answer is the
// original explanatory HTML string (it may contain <strong>, <br> and a
// <pre> code sample) — AnswerBody below parses it into rich text +
// <CodeBlock> pieces instead of using innerHTML like the legacy page did.

// Splits a legacy answer string into ordered { type: 'text' | 'code' } parts
// so the code samples render through <CodeBlock> instead of via innerHTML
// like the original page did.
function splitAnswer(raw) {
  const parts = [];
  const preRegex = /<pre>([\s\S]*?)<\/pre>/g;
  let lastIndex = 0;
  let match;
  while ((match = preRegex.exec(raw)) !== null) {
    const textChunk = raw.slice(lastIndex, match.index);
    if (textChunk.trim()) parts.push({ type: 'text', value: textChunk.trim() });
    parts.push({ type: 'code', value: match[1].trim() });
    lastIndex = preRegex.lastIndex;
  }
  const rest = raw.slice(lastIndex);
  if (rest.trim()) parts.push({ type: 'text', value: rest.trim() });
  return parts;
}

// Converts the legacy <br>/<strong> markup into plain text with **bold**
// markers, so it can be rendered without dangerouslySetInnerHTML.
function normalizeText(text) {
  return text
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<strong>/gi, '**')
    .replace(/<\/strong>/gi, '**')
    .trim();
}

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((segment, i) =>
    /^\*\*[^*]+\*\*$/.test(segment) ? (
      <Text strong key={i}>
        {segment.slice(2, -2)}
      </Text>
    ) : (
      segment
    ),
  );
}

function AnswerBody({ raw, darkMode }) {
  const parts = useMemo(() => splitAnswer(raw), [raw]);
  const textStyle = darkMode ? { color: '#fff' } : undefined;
  return (
    <>
      {parts.map((part, i) => {
        if (part.type === 'code') {
          return <CodeBlock key={i} language="javascript" code={part.value} />;
        }
        return normalizeText(part.value)
          .split('\n\n')
          .filter(Boolean)
          .map((para, j) => (
            <Paragraph key={`${i}-${j}`} style={textStyle}>
              {para.split('\n').map((line, k, arr) => (
                <span key={k}>
                  {renderInline(line)}
                  {k < arr.length - 1 ? <br /> : null}
                </span>
              ))}
            </Paragraph>
          ));
      })}
    </>
  );
}

const BOOKMARKS_KEY = 'nodeTutorial.bookmarkedQuestions';
const VIEWED_KEY = 'nodeTutorial.viewedQuestions';
const DARK_MODE_KEY = 'nodeTutorial.darkMode';

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function NodeTutorial() {
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(() => loadJson(DARK_MODE_KEY, false));
  const [bookmarks, setBookmarks] = useState(() => loadJson(BOOKMARKS_KEY, []));
  const [viewed, setViewed] = useState(() => loadJson(VIEWED_KEY, []));
  const [activeKeys, setActiveKeys] = useState([]);
  const [focusIndex, setFocusIndex] = useState(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem(VIEWED_KEY, JSON.stringify(viewed));
  }, [viewed]);

  useEffect(() => {
    localStorage.setItem(DARK_MODE_KEY, JSON.stringify(darkMode));
  }, [darkMode]);

  const markViewed = useCallback((id) => {
    setViewed((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const toggleBookmark = useCallback((id) => {
    setBookmarks((prev) => {
      if (prev.includes(id)) {
        message.info('Bookmark removed!');
        return prev.filter((i) => i !== id);
      }
      message.success('Question bookmarked!');
      return [...prev, id];
    });
  }, []);

  const handlePanelChange = useCallback(
    (keys) => {
      setActiveKeys(keys);
      keys.forEach((key) => markViewed(Number(key)));
    },
    [markViewed],
  );

  const copyAnswer = useCallback(async (raw) => {
    try {
      const plain = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      await navigator.clipboard.writeText(plain);
      message.success('✅ Answer copied!');
    } catch (err) {
      message.error('❌ Error: ' + err.message);
    }
  }, []);

  const showRandomQuestion = useCallback(() => {
    const idx = Math.floor(Math.random() * topics.length);
    setSearch('');
    setFocusIndex(idx);
    setActiveKeys([String(idx)]);
    markViewed(idx);
    message.info(`Showing Question ${idx + 1}`);
  }, [markViewed]);

  const exportQuestions = useCallback(() => {
    const data = topics.map(([question, answer]) => ({ question, answer }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nodejs_tutorial_questions.json';
    a.click();
    URL.revokeObjectURL(url);
    message.success('Questions exported as JSON!');
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (!e.ctrlKey) return;
      if (e.key === 'd') {
        e.preventDefault();
        setDarkMode((d) => !d);
      } else if (e.key === 's') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'r') {
        e.preventDefault();
        showRandomQuestion();
      } else if (e.key === 'e') {
        e.preventDefault();
        exportQuestions();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showRandomQuestion, exportQuestions]);

  const filteredTopics = useMemo(() => {
    if (focusIndex !== null) {
      return [{ question: topics[focusIndex][0], answer: topics[focusIndex][1], index: focusIndex }];
    }
    const all = topics.map(([question, answer], index) => ({ question, answer, index }));
    const query = search.trim().toLowerCase();
    if (!query) return all;
    return all.filter(({ question }) => question.toLowerCase().includes(query));
  }, [search, focusIndex]);

  const wrapperStyle = darkMode
    ? { background: '#222', color: '#fff', padding: 16, borderRadius: 10 }
    : undefined;

  const items = filteredTopics.map(({ question, answer, index }) => {
    const isBookmarked = bookmarks.includes(index);
    const isViewed = viewed.includes(index);
    return {
      key: String(index),
      label: (
        <Space wrap>
          <Text strong style={darkMode ? { color: '#fff' } : undefined}>
            {index + 1}️⃣ {question}
          </Text>
          {isBookmarked && <StarFilled style={{ color: 'gold' }} />}
          {isViewed && <QuestionCircleOutlined style={{ color: 'green' }} />}
        </Space>
      ),
      extra: (
        <Button
          size="small"
          icon={isBookmarked ? <StarFilled style={{ color: 'gold' }} /> : <StarOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            toggleBookmark(index);
          }}
        >
          {isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
        </Button>
      ),
      children: (
        <>
          <AnswerBody raw={answer} darkMode={darkMode} />
          <Button onClick={() => copyAnswer(answer)}>Copy</Button>
        </>
      ),
    };
  });

  return (
    <PageLayout
      title="📌 Node.js Tutorial"
      subtitle="Node.js tutorial — questions and answers, from the runtime basics to WebSockets and deployment."
    >
      <Space orientation="vertical" size="middle" style={{ width: '100%', marginBottom: 24 }}>
        <Input
          ref={searchInputRef}
          size="large"
          placeholder="🔍 Search topics..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setFocusIndex(null);
          }}
          allowClear
        />
        <Space wrap style={{ justifyContent: 'center', width: '100%' }}>
          <Button icon={<MoonOutlined />} onClick={() => setDarkMode((d) => !d)}>
            Toggle Dark Mode
          </Button>
          <Button onClick={showRandomQuestion}>🎲 Random Question</Button>
          <Button icon={<DownloadOutlined />} onClick={exportQuestions}>
            Export Questions
          </Button>
        </Space>
      </Space>

      <div style={wrapperStyle}>
        <Collapse activeKey={activeKeys} onChange={handlePanelChange} items={items} />
      </div>

      <Paragraph style={{ textAlign: 'center', marginTop: 24 }}>
        <Space wrap style={{ justifyContent: 'center' }}>
          <Link to="/">
            <Button type="primary">⬅️ Back to Home</Button>
          </Link>
          <Link to="/tutorials/react">
            <Button>React.js Tutorial</Button>
          </Link>
          <Link to="/tutorials/javascript">
            <Button>JavaScript Tutorial</Button>
          </Link>
          <Link to="/tutorials/html">
            <Button>HTML Tutorial</Button>
          </Link>
          <Link to="/tutorials/mongodb">
            <Button>MongoDB Tutorial</Button>
          </Link>
          <Link to="/hr-questions">
            <Button>HR Questions</Button>
          </Link>
        </Space>
      </Paragraph>
    </PageLayout>
  );
}
