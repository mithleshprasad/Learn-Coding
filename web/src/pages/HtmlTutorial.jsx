import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Space, Typography, message } from 'antd';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import PageLayout from '../components/PageLayout.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import DetailSidebar from '../components/DetailSidebar.jsx';
import AskAi from '../components/AskAi.jsx';
import topics from '../data/content/html-tutorial.json';

const { Paragraph, Title } = Typography;

const BOOKMARKS_KEY = 'htmlTutorial.bookmarkedQuestions';
const VIEWED_KEY = 'htmlTutorial.viewedQuestions';

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
          {activeTopic.id + 1}. {activeTopic.question}
        </Title>
        <Button
          icon={isBookmarked ? <StarFilled style={{ color: 'gold' }} /> : <StarOutlined />}
          onClick={() => toggleBookmark(activeTopic.id)}
        >
          {isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
        </Button>
      </Space>
      <Paragraph>{activeTopic.description}</Paragraph>
      <CodeBlock language="html" code={activeTopic.code} />
      <Paragraph>{activeTopic.note}</Paragraph>
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

      <AskAi context={topics} />

      <Paragraph style={{ textAlign: 'center', marginTop: 24 }}>
        <Link to="/">
          <Button type="primary">⬅️ Back to Home</Button>
        </Link>
      </Paragraph>
    </PageLayout>
  );
}
