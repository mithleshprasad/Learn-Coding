import { Card, Typography } from 'antd';
import PageLayout from '../components/PageLayout.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import sections from '../data/content/statistics.json';

const { Title } = Typography;

export default function Statistics() {
  return (
    <PageLayout
      title="Statistics"
      subtitle="Central tendency, dispersion, probability, hypothesis testing, and regression formulas."
    >
      {sections.map((section) => (
        <Card key={section.title} style={{ marginBottom: 24 }}>
          <Title level={3} style={{ marginTop: 0 }}>
            {section.title}
          </Title>
          <CodeBlock language="text" code={section.code} />
        </Card>
      ))}
    </PageLayout>
  );
}
