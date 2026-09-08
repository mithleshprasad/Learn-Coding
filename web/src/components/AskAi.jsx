import { useCallback, useRef, useState } from 'react';
import { Alert, Button, Input, Space, Spin, Typography, message } from 'antd';
import { AudioOutlined, SaveOutlined, SendOutlined, SoundOutlined } from '@ant-design/icons';
import './AskAi.css';

const { Paragraph, Text } = Typography;

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Freeform "ask a question about this tutorial" box. Sends the question plus
 * this page's Q&A content to /api/search (a Vercel serverless function) so
 * the Groq API key never reaches the browser. Also supports asking by voice,
 * having the answer read aloud, and saving Q&As straight to a real JSON
 * file on disk via the File System Access API (Chrome/Edge) — the browser
 * keeps a handle to the file so every "Save" click appends to the SAME
 * file, no server and no localStorage involved. Firefox/Safari (no File
 * System Access API) fall back to re-downloading the full list each time.
 */
export default function AskAi({ context }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [savedFileName, setSavedFileName] = useState('');
  const recognitionRef = useRef(null);
  const fileHandleRef = useRef(null);
  const fallbackListRef = useRef([]);

  const canPickFile = typeof window.showSaveFilePicker === 'function';

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

  const saveAnswer = useCallback(async () => {
    if (!question || !answer) return;
    const entry = { question, answer, savedAt: new Date().toISOString() };

    if (!canPickFile) {
      fallbackListRef.current = [...fallbackListRef.current, entry];
      downloadJson('ask-ai-saved.json', fallbackListRef.current);
      setSavedCount(fallbackListRef.current.length);
      message.info('Your browser can’t append to a file, so a fresh ask-ai-saved.json (with everything saved so far) just downloaded.');
      return;
    }

    try {
      if (!fileHandleRef.current) {
        fileHandleRef.current = await window.showSaveFilePicker({
          suggestedName: 'ask-ai-saved.json',
          types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
        });
      }
      const existingFile = await fileHandleRef.current.getFile();
      const existingText = await existingFile.text();
      let list = [];
      try {
        const parsed = JSON.parse(existingText || '[]');
        if (Array.isArray(parsed)) list = parsed;
      } catch {
        // Existing file wasn't valid JSON (or was empty) — start fresh.
      }
      list.push(entry);

      const writable = await fileHandleRef.current.createWritable();
      await writable.write(JSON.stringify(list, null, 2));
      await writable.close();

      setSavedFileName(fileHandleRef.current.name);
      setSavedCount(list.length);
      message.success(`Saved to ${fileHandleRef.current.name} (${list.length} entries).`);
    } catch (err) {
      if (err?.name === 'AbortError') return;
      message.error('Could not save to the file: ' + err.message);
    }
  }, [question, answer, canPickFile]);

  return (
    <div className="ask-ai">
      <div className="ask-ai-heading">🤖 Ask AI about this tutorial</div>
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
            <Button size="small" icon={<SaveOutlined />} onClick={saveAnswer}>
              Save to JSON file
            </Button>
          </Space>
        </div>
      ) : null}
      {savedCount > 0 ? (
        <Text type="secondary" className="ask-ai-saved">
          {savedFileName ? `${savedCount} saved to ${savedFileName}` : `${savedCount} saved`}
        </Text>
      ) : null}
    </div>
  );
}
