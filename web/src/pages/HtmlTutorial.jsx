import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Collapse, Input, Space, Typography, message } from 'antd';
import {
  CheckCircleFilled,
  DownloadOutlined,
  MoonOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import PageLayout from '../components/PageLayout.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import topics from '../data/content/html-tutorial.json';

const { Paragraph, Text } = Typography;

const BOOKMARKS_KEY = 'htmlTutorial.bookmarkedQuestions';
const VIEWED_KEY = 'htmlTutorial.viewedQuestions';
const DARK_MODE_KEY = 'htmlTutorial.darkMode';

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function HtmlTutorial() {
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(() => loadJson(DARK_MODE_KEY, false));
  const [bookmarks, setBookmarks] = useState(() => loadJson(BOOKMARKS_KEY, []));
  const [viewed, setViewed] = useState(() => loadJson(VIEWED_KEY, []));
  const [activeKeys, setActiveKeys] = useState([]);
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

  const copyCode = useCallback(async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      message.success('✅ Code copied!');
    } catch (err) {
      message.error('❌ Error: ' + err.message);
    }
  }, []);

  const runCode = useCallback((code) => {
    try {
      const blob = new Blob([code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      message.success('✅ HTML rendered in a new tab!');
    } catch (err) {
      message.error('❌ Error: ' + err.message);
    }
  }, []);

  const showRandomQuestion = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * topics.length);
    setSearch('');
    setActiveKeys([String(randomIndex)]);
    markViewed(randomIndex);
    message.info(`Showing Question ${randomIndex + 1}`);
  }, [markViewed]);

  const exportQuestions = useCallback(() => {
    const data = topics.map(({ question, description, note }) => ({
      question,
      answer: `${description} ${note}`,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'html_tutorial_questions.json';
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
    const query = search.toLowerCase();
    if (!query) return topics;
    return topics.filter(
      (t) =>
        t.question.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query),
    );
  }, [search]);

  const wrapperStyle = darkMode
    ? { background: '#222', color: '#fff', padding: 16, borderRadius: 10 }
    : undefined;

  const items = filteredTopics.map((topic) => {
    const isBookmarked = bookmarks.includes(topic.id);
    const isViewed = viewed.includes(topic.id);
    return {
      key: String(topic.id),
      label: (
        <Space wrap>
          <Text strong style={darkMode ? { color: '#fff' } : undefined}>
            {topic.id + 1}️⃣ {topic.question}
          </Text>
          {isBookmarked && <StarFilled style={{ color: 'gold' }} />}
          {isViewed && <CheckCircleFilled style={{ color: 'green' }} />}
        </Space>
      ),
      extra: (
        <Button
          size="small"
          icon={isBookmarked ? <StarFilled style={{ color: 'gold' }} /> : <StarOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            toggleBookmark(topic.id);
          }}
        >
          {isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
        </Button>
      ),
      children: (
        <>
          <Paragraph style={darkMode ? { color: '#fff' } : undefined}>
            {topic.description}
          </Paragraph>
          <CodeBlock language="html" code={topic.code} />
          <Paragraph style={darkMode ? { color: '#fff' } : undefined}>{topic.note}</Paragraph>
          <Space>
            <Button type="primary" style={{ background: '#28a745', borderColor: '#28a745' }} onClick={() => runCode(topic.code)}>
              Run
            </Button>
            <Button onClick={() => copyCode(topic.code)}>Copy</Button>
          </Space>
        </>
      ),
    };
  });

  return (
    <PageLayout
      title="📌 HTML Tutorial - Questions & Answers"
      subtitle="Master HTML and create well-structured web pages."
    >
      <Space orientation="vertical" size="middle" style={{ width: '100%', marginBottom: 24 }}>
        <Input
          ref={searchInputRef}
          size="large"
          placeholder="🔍 Search topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
        <Link to="/">
          <Button type="primary">⬅️ Back to Home</Button>
        </Link>
      </Paragraph>
    </PageLayout>
  );
}
