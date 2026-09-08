import { useMemo, useState } from 'react';
import { Typography, Input } from 'antd';
import PageLayout from '../components/PageLayout.jsx';
import DetailSidebar from '../components/DetailSidebar.jsx';
import AskAi from '../components/AskAi.jsx';
import questions from '../data/content/hr-questions.json';

const { Paragraph, Title } = Typography;

export default function HrQuestions() {
  const [search, setSearch] = useState('');
  const [activeKey, setActiveKey] = useState('0');

  const sidebarItems = useMemo(
    () => questions.map((q) => ({ key: String(q.id), label: q.question })),
    [],
  );

  const filteredSidebarItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sidebarItems;
    return sidebarItems.filter((item) => item.label.toLowerCase().includes(query));
  }, [sidebarItems, search]);

  const activeIndex = Number(activeKey);
  const activeQuestion = questions[activeIndex] ?? questions[0];

  return (
    <PageLayout
      title="📌 HR Interview Questions & Answers"
      subtitle="Prepare for your next interview with common HR questions and sample answers."
      sidebar={
        <DetailSidebar items={filteredSidebarItems} activeKey={activeKey} onSelect={setActiveKey} />
      }
    >
      <Input
        size="large"
        placeholder="Search questions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
        style={{ marginBottom: 24 }}
      />

      <Title level={3}>{activeQuestion.question}</Title>
      <Paragraph style={{ marginBottom: 0 }}>{activeQuestion.answer}</Paragraph>

      <AskAi context={questions} />
    </PageLayout>
  );
}
