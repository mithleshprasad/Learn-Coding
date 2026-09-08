import { useState } from 'react';
import { Alert, Button, Input, Spin, Typography } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import './AskAi.css';

const { Paragraph } = Typography;

/**
 * Freeform "ask a question about this tutorial" box. Sends the question plus
 * this page's Q&A content to /api/search (a Vercel serverless function) so
 * the Groq API key never reaches the browser.
 */
export default function AskAi({ context }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ask = async () => {
    if (!question.trim() || loading) return;
    setLoading(true);
    setError('');
    setAnswer('');
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setAnswer(data.answer);
    } catch (err) {
      setError(err.message || 'Could not reach the AI search right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ask-ai">
      <div className="ask-ai-heading">🤖 Ask AI about this tutorial</div>
      <Input.Search
        placeholder="e.g. When would I use useMemo instead of useCallback?"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onSearch={ask}
        enterButton={<Button icon={<SendOutlined />} loading={loading}>Ask</Button>}
        disabled={loading}
      />
      {loading ? (
        <div className="ask-ai-loading">
          <Spin size="small" /> Thinking…
        </div>
      ) : null}
      {error ? <Alert type="error" showIcon title={error} style={{ marginTop: 12 }} /> : null}
      {answer ? (
        <div className="ask-ai-answer">
          <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{answer}</Paragraph>
        </div>
      ) : null}
    </div>
  );
}
