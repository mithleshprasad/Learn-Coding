import { Card, Typography } from 'antd';
import PageLayout from '../components/PageLayout.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import sections from '../data/content/algebra.json';

const { Title } = Typography;

export default function Algebra() {
  return (
    <PageLayout
      title="Algebra"
      subtitle="Core algebraic identities, the quadratic formula, progressions, and binomial expansion."
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
