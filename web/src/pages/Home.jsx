import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Card, Col, Row, Typography } from 'antd';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import tutorials from '../data/tutorials.json';
import topics from '../data/topics.json';
import testimonials from '../data/testimonials.json';

const { Title, Paragraph, Text } = Typography;

export default function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  return (
    <>
      <SiteHeader />

      <section className="hero" id="home">
        <div className="hero-content">
          <Title level={1} style={{ color: '#fff', fontSize: 48, marginBottom: 20 }}>
            Master Coding with Ease
          </Title>
          <Paragraph style={{ color: '#fff', fontSize: 20, opacity: 0.9, marginBottom: 30 }}>
            Learn, practice, and excel in programming with our interactive tutorials and quizzes.
          </Paragraph>
          <Button type="primary" size="large" href="#tutorials">
            Get Started
          </Button>
        </div>
      </section>

      <section className="section section-surface" id="tutorials">
        <Title level={2} className="section-title">
          Featured Tutorials
        </Title>
        <Row gutter={[20, 20]}>
          {tutorials.map((tutorial) => (
            <Col key={tutorial.key} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                className="tutorial-card"
                cover={
                  <img
                    className="tutorial-thumb"
                    src={tutorial.image}
                    alt={tutorial.title}
                    loading="lazy"
                  />
                }
              >
                <Card.Meta
                  title={tutorial.title}
                  description={<Text type="secondary">{tutorial.description}</Text>}
                />
                <Link to={tutorial.to}>
                  <Button type="primary" className="tutorial-cta">
                    Start Learning
                  </Button>
                </Link>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section className="section section-alt" id="topics">
        <Title level={2} className="section-title">
          Popular Topics
        </Title>
        <Row gutter={[20, 20]}>
          {topics.map((topic) => (
            <Col key={topic.key} xs={24} sm={12} md={6}>
              <Card className="topic-card">
                <Title level={4} style={{ marginTop: 0 }}>
                  {topic.title}
                </Title>
                <Text type="secondary">{topic.description}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section className="section section-surface" id="testimonials">
        <Title level={2} className="section-title">
          What Our Learners Say
        </Title>
        <Row gutter={[20, 20]}>
          {testimonials.map((item) => (
            <Col key={item.key} xs={24} sm={12} md={8}>
              <Card className="testimonial-card">
                <Paragraph italic style={{ marginBottom: 8 }}>
                  &ldquo;{item.quote}&rdquo;
                </Paragraph>
                <Text strong>- {item.author}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section className="cta-section">
        <Title level={2} style={{ color: '#fff' }}>
          Ready to Start Your Coding Journey?
        </Title>
        <Paragraph style={{ color: '#fff', opacity: 0.9 }}>
          Join thousands of learners and master coding today.
        </Paragraph>
        <Button type="primary" size="large" href="#tutorials">
          Get Started
        </Button>
      </section>

      <SiteFooter />
    </>
  );
}
