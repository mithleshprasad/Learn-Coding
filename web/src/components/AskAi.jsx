import { useCallback, useRef, useState } from 'react';
import { Alert, Button, Input, Space, Spin, Typography, message } from 'antd';
import { AudioOutlined, FilePdfOutlined, SendOutlined, SoundOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import './AskAi.css';

const { Paragraph, Text } = Typography;

// jsPDF's built-in fonts only cover the WinAnsi/Latin-1 range — the smart
// quotes, en-dashes and other Unicode punctuation Groq's answers use fall
// outside that and render as garbled, oddly-spaced text. Fold them down to
// plain ASCII equivalents, and drop anything else (emoji etc.) outright.
function sanitizeForPdf(text) {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/‑/g, '-')
    .replace(/…/g, '...')
    .replace(/[•●]/g, '-')
    // \x00-\x1f (incl. \n) are intentionally kept; only non-Latin-1
    // characters (emoji etc.) are dropped.
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x00-\xff]/g, '');
}

// Word-wraps `text` into `doc` starting at (x, startY), rendering **bold**
// markdown segments in a bold font instead of printing the asterisks
// literally, and paragraph breaks (blank lines) as extra vertical gap.
// Returns the y position after the last line drawn.
function renderFormattedText(doc, text, x, startY, maxWidth, pageHeight, margin, lineHeight = 6) {
  let y = startY;

  text
    .split(/\n+/)
    .filter((p) => p.trim())
    .forEach((paragraph, pIndex) => {
      if (pIndex > 0) y += 3;
      let cursorX = x;

      paragraph
        .split(/(\*\*[^*]+\*\*)/g)
        .filter(Boolean)
        .forEach((segment) => {
          const isBold = /^\*\*[^*]+\*\*$/.test(segment);
          doc.setFont('helvetica', isBold ? 'bold' : 'normal');
          const words = (isBold ? segment.slice(2, -2) : segment).split(/\s+/).filter(Boolean);

          words.forEach((word) => {
            const wordWidth = doc.getTextWidth(word);
            if (cursorX > x && cursorX + wordWidth > x + maxWidth) {
              cursorX = x;
              y += lineHeight;
              if (y > pageHeight - margin) {
                doc.addPage();
                y = margin;
              }
            }
            doc.text(word, cursorX, y);
            cursorX += wordWidth + doc.getTextWidth(' ');
          });
        });

      y += lineHeight;
    });

  return y;
}

// Renders every saved Q&A as its own colorful page: a dark header band with
// a green accent stripe (matching the site's theme), the question in green,
// the answer in body text.
function buildSavedAnswersPdf(entries) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  entries.forEach((entry, i) => {
    if (i > 0) doc.addPage();

    doc.setFillColor(22, 27, 34);
    doc.rect(0, 0, pageWidth, 34, 'F');
    doc.setFillColor(47, 141, 70);
    doc.rect(0, 34, pageWidth, 2, 'F');

    doc.setTextColor(230, 237, 243);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Ask AI - Saved Answer', margin, 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(145, 152, 161);
    doc.text(`Saved ${new Date(entry.savedAt).toLocaleString()}`, margin, 25);

    let y = 50;

    doc.setTextColor(47, 141, 70);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    const questionLines = doc.splitTextToSize(sanitizeForPdf(entry.question), contentWidth);
    doc.text(questionLines, margin, y);
    y += questionLines.length * 7 + 8;

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(11);
    renderFormattedText(doc, sanitizeForPdf(entry.answer), margin, y, contentWidth, pageHeight, margin);
  });

  return doc;
}

/**
 * Freeform "ask a question about this tutorial" box. Sends the question plus
 * this page's Q&A content to /api/search (a Vercel serverless function) so
 * the Groq API key never reaches the browser. Also supports asking by voice
 * and having the answer read aloud. "Save" regenerates a colorful PDF with
 * one page per saved answer (this session) and downloads it — no server,
 * no localStorage.
 */
export default function AskAi({ context, heading = '🤖 Ask AI about this tutorial', showHeading = true }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const recognitionRef = useRef(null);
  const savedListRef = useRef([]);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const speechSupported = Boolean(SpeechRecognition);
  const ttsSupported = 'speechSynthesis' in window;

  const toggleListening = useCallback(() => {
    if (!SpeechRecognition) return;
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setQuestion((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [SpeechRecognition, listening]);

  const speakAnswer = useCallback(() => {
    if (!ttsSupported || !answer) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(answer));
  }, [answer, ttsSupported]);

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

  const saveAsPdf = useCallback(() => {
    if (!question || !answer) return;
    savedListRef.current = [...savedListRef.current, { question, answer, savedAt: new Date().toISOString() }];
    const doc = buildSavedAnswersPdf(savedListRef.current);
    doc.save('ask-ai-saved.pdf');
    setSavedCount(savedListRef.current.length);
    const n = savedListRef.current.length;
    message.success(`Saved as PDF (${n} ${n === 1 ? 'answer' : 'answers'}).`);
  }, [question, answer]);

  return (
    <div className="ask-ai">
      {showHeading ? <div className="ask-ai-heading">{heading}</div> : null}
      <div style={{ display: 'flex', gap: 8 }}>
        {speechSupported ? (
          <Button
            icon={<AudioOutlined />}
            danger={listening}
            onClick={toggleListening}
            aria-label={listening ? 'Stop listening' : 'Ask by voice'}
            title={listening ? 'Stop listening' : 'Ask by voice'}
          />
        ) : null}
        <Input.Search
          style={{ flex: 1 }}
          placeholder="e.g. When would I use useMemo instead of useCallback?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onSearch={ask}
          enterButton={<Button icon={<SendOutlined />} loading={loading}>Ask</Button>}
          disabled={loading}
        />
      </div>
      {loading ? (
        <div className="ask-ai-loading">
          <Spin size="small" /> Thinking…
        </div>
      ) : null}
      {error ? <Alert type="error" showIcon title={error} style={{ marginTop: 12 }} /> : null}
      {answer ? (
        <div className="ask-ai-answer">
          <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{answer}</Paragraph>
          <Space style={{ marginTop: 8 }} wrap>
            {ttsSupported ? (
              <Button size="small" icon={<SoundOutlined />} onClick={speakAnswer}>
                Listen
              </Button>
            ) : null}
            <Button size="small" icon={<FilePdfOutlined />} onClick={saveAsPdf}>
              Save as PDF
            </Button>
          </Space>
        </div>
      ) : null}
      {savedCount > 0 ? (
        <Text type="secondary" className="ask-ai-saved">
          {savedCount} {savedCount === 1 ? 'answer' : 'answers'} in ask-ai-saved.pdf
        </Text>
      ) : null}
    </div>
  );
}
