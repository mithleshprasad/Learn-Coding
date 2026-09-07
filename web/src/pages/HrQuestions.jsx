import { useMemo, useState } from 'react';
import { Collapse, Input, Typography } from 'antd';
import PageLayout from '../components/PageLayout.jsx';
import questions from '../data/content/hr-questions.json';

const { Paragraph } = Typography;

export default function HrQuestions() {
  const [search, setSearch] = useState('');
  const [activeKey, setActiveKey] = useState();

  const filteredQuestions = useMemo(() => {
    const query = search.toLowerCase();
    if (!query) return questions;
    return questions.filter((q) => q.question.toLowerCase().includes(query));
  }, [search]);

  const items = filteredQuestions.map((q) => ({
    key: String(q.id),
    label: <strong>{q.question}</strong>,
    children: <Paragraph style={{ marginBottom: 0 }}>{q.answer}</Paragraph>,
  }));

  return (
    <PageLayout
      title="📌 HR Interview Questions & Answers"
      subtitle="Prepare for your next interview with common HR questions and sample answers."
    >
      <Input
        size="large"
        placeholder="Search questions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
        style={{ marginBottom: 24 }}
      />

      <Collapse
        accordion
        activeKey={activeKey}
        onChange={(key) => setActiveKey(key)}
        items={items}
      />
    </PageLayout>
  );
}
