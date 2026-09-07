import { Card, Typography } from 'antd';
import PageLayout from '../components/PageLayout.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import sections from '../data/content/trigonometry.json';

const { Title } = Typography;

export default function Trigonometry() {
  return (
    <PageLayout
      title="Trigonometry"
      subtitle="Trigonometric ratios, identities, angle formulas, and the laws of sines and cosines."
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
