import { Card, Typography } from 'antd';
import PageLayout from '../components/PageLayout.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import sections from '../data/content/geometry.json';

const { Title, Paragraph, Text } = Typography;

export default function Geometry() {
  return (
    <PageLayout
      title="Geometry"
      subtitle="Area, volume, surface area, and angle formulas for common 2D and 3D shapes."
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
