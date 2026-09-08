import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Space, Typography, message } from 'antd';
import { DownloadOutlined, MoonOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import PageLayout from '../components/PageLayout.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import DetailSidebar from '../components/DetailSidebar.jsx';
import AskAi from '../components/AskAi.jsx';
import topics from '../data/content/html-tutorial.json';

const { Paragraph, Title } = Typography;

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
  const [activeKey, setActiveKey] = useState('0');
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
    () => topics.map((t) => ({ key: String(t.id), label: `${t.id + 1}. ${t.question}` })),
    [],
  );

  const filteredSidebarItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sidebarItems;
    return sidebarItems.filter((item) => item.label.toLowerCase().includes(query));
  }, [sidebarItems, search]);

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
    setActiveKey(String(randomIndex));
    message.info(`Showing Question ${randomIndex + 1}`);
  }, []);

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

  const wrapperStyle = darkMode
    ? { background: '#222', color: '#fff', padding: 16, borderRadius: 10 }
    : undefined;

  const activeIndex = Number(activeKey);
  const activeTopic = topics[activeIndex] ?? topics[0];
  const isBookmarked = bookmarks.includes(activeTopic.id);

  return (
    <PageLayout
      title="📌 HTML Tutorial - Questions & Answers"
      subtitle="Master HTML and create well-structured web pages."
      sidebar={
        <DetailSidebar items={filteredSidebarItems} activeKey={activeKey} onSelect={setActiveKey} />
      }
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
        <Space style={{ justifyContent: 'space-between', width: '100%' }} align="start" wrap>
          <Title level={3} style={darkMode ? { color: '#fff' } : undefined}>
            {activeTopic.id + 1}. {activeTopic.question}
          </Title>
          <Button
            icon={isBookmarked ? <StarFilled style={{ color: 'gold' }} /> : <StarOutlined />}
            onClick={() => toggleBookmark(activeTopic.id)}
          >
            {isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
          </Button>
        </Space>
        <Paragraph style={darkMode ? { color: '#fff' } : undefined}>{activeTopic.description}</Paragraph>
        <CodeBlock language="html" code={activeTopic.code} />
        <Paragraph style={darkMode ? { color: '#fff' } : undefined}>{activeTopic.note}</Paragraph>
        <Space>
          <Button
            type="primary"
            style={{ background: '#28a745', borderColor: '#28a745' }}
            onClick={() => runCode(activeTopic.code)}
          >
            Run
          </Button>
          <Button onClick={() => copyCode(activeTopic.code)}>Copy</Button>
        </Space>
      </div>

      <AskAi context={topics} />

      <Paragraph style={{ textAlign: 'center', marginTop: 24 }}>
        <Link to="/">
          <Button type="primary">⬅️ Back to Home</Button>
        </Link>
      </Paragraph>
    </PageLayout>
  );
}
