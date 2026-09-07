import { Card, Typography } from 'antd';
import PageLayout from '../components/PageLayout.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import sections from '../data/content/calculus.json';

const { Title, Paragraph, Text } = Typography;

export default function Calculus() {
  return (
    <PageLayout
      title="Calculus"
      subtitle="Limits, derivatives, integrals, and the core differentiation and integration rules."
    >
      {sections.map((section) => (
        <Card key={section.title} style={{ marginBottom: 24 }}>
          <Title level={3} style={{ marginTop: 0 }}>
            {section.title}
          </Title>
          <CodeBlock language="text" code={section.code} />
          {section.example && (
            <Paragraph style={{ marginBottom: 0 }}>
              <Text strong>Example:</Text> {section.example}
            </Paragraph>
          )}
        </Card>
      ))}
    </PageLayout>
  );
}
