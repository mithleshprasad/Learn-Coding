import { Link } from 'react-router-dom';
import { Card, Col, Progress, Row, Typography } from 'antd';
import { StarFilled } from '@ant-design/icons';
import PageLayout from '../components/PageLayout.jsx';
import dsaTopics from '../data/dsaTopics.json';
import arraysStrings from '../data/content/dsa-problems/arrays-strings.json';
import linkedList from '../data/content/dsa-problems/linked-list.json';
import stack from '../data/content/dsa-problems/stack.json';
import binarySearch from '../data/content/dsa-problems/binary-search.json';
import trees from '../data/content/dsa-problems/trees.json';
import tries from '../data/content/dsa-problems/tries.json';
import heap from '../data/content/dsa-problems/heap.json';
import backtracking from '../data/content/dsa-problems/backtracking.json';
import graphs from '../data/content/dsa-problems/graphs.json';
import dp from '../data/content/dsa-problems/dp.json';
import greedy from '../data/content/dsa-problems/greedy.json';
import sdTopics from '../data/systemDesignTopics.json';
import fundamentals from '../data/content/system-design/fundamentals.json';
import designProblems from '../data/content/system-design/design-problems.json';
import reactTopics from '../data/content/react-tutorial.json';
import nodeTopics from '../data/content/node-tutorial.json';
import htmlTopics from '../data/content/html-tutorial.json';
import './ProgressDashboard.css';

const { Title, Text, Paragraph } = Typography;

const DSA_PROBLEMS_BY_TOPIC = {
  'arrays-strings': arraysStrings,
  'linked-list': linkedList,
  stack,
  'binary-search': binarySearch,
  trees,
  tries,
  heap,
  backtracking,
  graphs,
  dp,
  greedy,
};

const SD_PROBLEMS_BY_TOPIC = { fundamentals, 'design-problems': designProblems };

const TUTORIALS = [
  { key: 'react', label: 'React.js Tutorial', to: '/tutorials/react', total: reactTopics.length, storagePrefix: 'reactTutorial' },
  { key: 'node', label: 'Node.js Tutorial', to: '/tutorials/node', total: nodeTopics.length, storagePrefix: 'nodeTutorial' },
  { key: 'html', label: 'HTML Tutorial', to: '/tutorials/html', total: htmlTopics.length, storagePrefix: 'htmlTutorial' },
];

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function TopicProgressRow({ label, done, total }) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="progress-topic-row">
      <div className="progress-topic-row-label">
        <Text>{label}</Text>
        <Text type="secondary">
          {done} / {total}
        </Text>
      </div>
      <Progress percent={percent} size="small" showInfo={false} strokeColor="#2f8d46" />
    </div>
  );
}

export default function ProgressDashboard() {
  const dsaProgress = loadJson('dsaPractice.progress', {});
  const sdProgress = loadJson('systemDesign.progress', {});

  const dsaTopicStats = dsaTopics.map((topic) => {
    const problems = DSA_PROBLEMS_BY_TOPIC[topic.key];
    const done = problems.filter((p) => dsaProgress[p.key] === 'done').length;
    return { key: topic.key, label: topic.label, done, total: problems.length };
  });
  const dsaTotal = dsaTopicStats.reduce((sum, t) => sum + t.total, 0);
  const dsaDone = dsaTopicStats.reduce((sum, t) => sum + t.done, 0);

  const sdTopicStats = sdTopics.map((topic) => {
    const problems = SD_PROBLEMS_BY_TOPIC[topic.key];
    const done = problems.filter((p) => sdProgress[p.key] === 'done').length;
    return { key: topic.key, label: topic.label, done, total: problems.length };
  });
  const sdTotal = sdTopicStats.reduce((sum, t) => sum + t.total, 0);
  const sdDone = sdTopicStats.reduce((sum, t) => sum + t.done, 0);

  const tutorialStats = TUTORIALS.map((t) => {
    const viewed = loadJson(`${t.storagePrefix}.viewedQuestions`, []);
    const bookmarked = loadJson(`${t.storagePrefix}.bookmarkedQuestions`, []);
    return { ...t, viewed: viewed.length, bookmarked: bookmarked.length };
  });

  const totalSolved = dsaDone + sdDone;

  return (
    <PageLayout
      title="My Progress"
      subtitle="Everything you've solved and bookmarked, in one place — tracked locally in this browser."
      wide
    >
      <Card className="progress-hero-card">
        <Text type="secondary">Total problems solved</Text>
        <Title level={1} style={{ margin: '4px 0 0' }}>
          {totalSolved}
        </Title>
        <Text type="secondary">
          {dsaDone} DSA &nbsp;·&nbsp; {sdDone} System Design
        </Text>
      </Card>

      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        <Col xs={24} lg={12}>
          <Card
            title="DSA Practice"
            extra={<Link to="/dsa-practice">Continue →</Link>}
          >
            <Progress
              percent={dsaTotal > 0 ? Math.round((dsaDone / dsaTotal) * 100) : 0}
              strokeColor="#2f8d46"
            />
            <Text type="secondary">
              {dsaDone} / {dsaTotal} problems done
            </Text>
            <div className="progress-topic-list">
              {dsaTopicStats.map((t) => (
                <TopicProgressRow key={t.key} label={t.label} done={t.done} total={t.total} />
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="System Design Practice"
            extra={<Link to="/system-design">Continue →</Link>}
          >
            <Progress
              percent={sdTotal > 0 ? Math.round((sdDone / sdTotal) * 100) : 0}
              strokeColor="#2f8d46"
            />
            <Text type="secondary">
              {sdDone} / {sdTotal} problems done
            </Text>
            <div className="progress-topic-list">
              {sdTopicStats.map((t) => (
                <TopicProgressRow key={t.key} label={t.label} done={t.done} total={t.total} />
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Title level={3} style={{ marginTop: 32 }}>
        Tutorials
      </Title>
      <Paragraph type="secondary">
        Questions you've opened and bookmarked in each tutorial.
      </Paragraph>
      <Row gutter={[20, 20]}>
        {tutorialStats.map((t) => (
          <Col xs={24} sm={12} lg={8} key={t.key}>
            <Card title={t.label} extra={<Link to={t.to}>Continue →</Link>}>
              <TopicProgressRow label="Viewed" done={t.viewed} total={t.total} />
              <Text type="secondary" className="progress-bookmark-count">
                <StarFilled style={{ color: 'gold' }} /> {t.bookmarked} bookmarked
              </Text>
            </Card>
          </Col>
        ))}
      </Row>
    </PageLayout>
  );
}
