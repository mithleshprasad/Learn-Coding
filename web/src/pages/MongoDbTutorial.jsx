import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Space, Typography, message } from 'antd';
import { MoonOutlined } from '@ant-design/icons';
import PageLayout from '../components/PageLayout.jsx';
import DetailSidebar from '../components/DetailSidebar.jsx';
import AskAi from '../components/AskAi.jsx';
import topics from '../data/content/mongodb-tutorial.json';

const { Paragraph, Text, Title } = Typography;

// Renders the light markdown (**bold** and `code`) used in the answer text.
function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return (
        <Text strong key={i}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    if (/^`[^`]+`$/.test(part)) {
      return (
        <Text code key={i}>
          {part.slice(1, -1)}
        </Text>
      );
    }
    return part;
  });
}

export default function MongoDbTutorial() {
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [activeKey, setActiveKey] = useState('0');

  const sidebarItems = useMemo(
    () => topics.map((t) => ({ key: String(t.id), label: `${t.id + 1}. ${t.question}` })),
    [],
  );

  const filteredSidebarItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sidebarItems;
    return sidebarItems.filter((item) => item.label.toLowerCase().includes(query));
  }, [sidebarItems, search]);

  function toggleDarkMode() {
    setDarkMode((d) => {
      const next = !d;
      message.info('🌙 Dark mode ' + (next ? 'enabled' : 'disabled'));
      return next;
    });
  }

  async function copyAnswer(text) {
    try {
      await navigator.clipboard.writeText(text);
      message.success('✅ Code copied!');
    } catch (err) {
      message.error('❌ Error: ' + err.message);
    }
  }

  const wrapperStyle = darkMode
    ? { background: '#222', color: '#fff', padding: 16, borderRadius: 10 }
    : undefined;

  const activeIndex = Number(activeKey);
  const activeTopic = topics[activeIndex] ?? topics[0];

  return (
    <PageLayout
      title="📌 MongoDB Tutorial - Questions & Answers"
      subtitle="Learn the fundamentals of MongoDB, the leading NoSQL database."
      sidebar={
        <DetailSidebar items={filteredSidebarItems} activeKey={activeKey} onSelect={setActiveKey} />
      }
    >
      <Space orientation="vertical" size="middle" style={{ width: '100%', marginBottom: 24 }}>
        <Input
          size="large"
          placeholder="🔍 Search topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
        <Space style={{ justifyContent: 'center', width: '100%' }}>
          <Button icon={<MoonOutlined />} onClick={toggleDarkMode}>
            Toggle Dark Mode
          </Button>
        </Space>
      </Space>

      <div style={wrapperStyle}>
        <Title level={3} style={darkMode ? { color: '#fff' } : undefined}>
          {activeTopic.id + 1}. {activeTopic.question}
        </Title>
        <Paragraph style={darkMode ? { color: '#fff' } : undefined}>
          {renderInline(activeTopic.answer)}
        </Paragraph>
        <Button onClick={() => copyAnswer(activeTopic.answer)}>Copy</Button>
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
