import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Space, Typography, message } from 'antd';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import PageLayout from '../components/PageLayout.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import DetailSidebar from '../components/DetailSidebar.jsx';
import AskAi from '../components/AskAi.jsx';
import topics from '../data/content/node-tutorial.json';

const { Paragraph, Text, Title } = Typography;

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

function AnswerBody({ raw }) {
  const parts = useMemo(() => splitAnswer(raw), [raw]);
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
            <Paragraph key={`${i}-${j}`}>
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
  const [bookmarks, setBookmarks] = useState(() => loadJson(BOOKMARKS_KEY, []));
  const [viewed, setViewed] = useState(() => loadJson(VIEWED_KEY, []));
  const [activeKey, setActiveKey] = useState('0');

  useEffect(() => {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem(VIEWED_KEY, JSON.stringify(viewed));
  }, [viewed]);

  useEffect(() => {
    const id = Number(activeKey);
    setViewed((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, [activeKey]);

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

  const sidebarItems = useMemo(
    () => topics.map(([question], index) => ({ key: String(index), label: `${index + 1}. ${question}` })),
    [],
  );

  const filteredSidebarItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sidebarItems;
    return sidebarItems.filter((item) => item.label.toLowerCase().includes(query));
  }, [sidebarItems, search]);

  const askAiContext = useMemo(
    () => topics.map(([question, answer]) => ({ question, description: answer })),
    [],
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

  const activeIndex = Number(activeKey);
  const [activeQuestion, activeAnswer] = topics[activeIndex] ?? topics[0];
  const isBookmarked = bookmarks.includes(activeIndex);

  return (
    <PageLayout
      title="📌 Node.js Tutorial"
      subtitle="Node.js tutorial — questions and answers, from the runtime basics to WebSockets and deployment."
      sidebar={
        <DetailSidebar items={filteredSidebarItems} activeKey={activeKey} onSelect={setActiveKey} />
      }
    >
      <Input
        size="large"
        placeholder="🔍 Search topics..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
        style={{ marginBottom: 24 }}
      />

      <Space style={{ justifyContent: 'space-between', width: '100%' }} align="start" wrap>
        <Title level={3}>
          {activeIndex + 1}. {activeQuestion}
        </Title>
        <Button
          icon={isBookmarked ? <StarFilled style={{ color: 'gold' }} /> : <StarOutlined />}
          onClick={() => toggleBookmark(activeIndex)}
        >
          {isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
        </Button>
      </Space>
      <AnswerBody raw={activeAnswer} />
      <Button onClick={() => copyAnswer(activeAnswer)}>Copy</Button>

      <AskAi context={askAiContext} />

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
