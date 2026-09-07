import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Collapse, Input, Space, Typography, message } from 'antd';
import { MoonOutlined } from '@ant-design/icons';
import PageLayout from '../components/PageLayout.jsx';
import topics from '../data/content/mongodb-tutorial.json';

const { Paragraph, Text } = Typography;

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
  const [activeKeys, setActiveKeys] = useState([]);

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

  const filteredTopics = useMemo(() => {
    const query = search.toLowerCase();
    if (!query) return topics;
    return topics.filter(
      (t) => t.question.toLowerCase().includes(query) || t.answer.toLowerCase().includes(query),
    );
  }, [search]);

  const wrapperStyle = darkMode
    ? { background: '#222', color: '#fff', padding: 16, borderRadius: 10 }
    : undefined;

  const items = filteredTopics.map((topic) => ({
    key: String(topic.id),
    label: (
      <Text strong style={darkMode ? { color: '#fff' } : undefined}>
        {topic.id + 1}️⃣ {topic.question}
      </Text>
    ),
    children: (
      <>
        <Paragraph style={darkMode ? { color: '#fff' } : undefined}>
          {renderInline(topic.answer)}
        </Paragraph>
        <Button onClick={() => copyAnswer(topic.answer)}>Copy</Button>
      </>
    ),
  }));

  return (
    <PageLayout
      title="📌 MongoDB Tutorial - Questions & Answers"
      subtitle="Learn the fundamentals of MongoDB, the leading NoSQL database."
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
        <Collapse activeKey={activeKeys} onChange={setActiveKeys} items={items} />
      </div>

      <Paragraph style={{ textAlign: 'center', marginTop: 24 }}>
        <Link to="/">
          <Button type="primary">⬅️ Back to Home</Button>
        </Link>
      </Paragraph>
    </PageLayout>
  );
}
