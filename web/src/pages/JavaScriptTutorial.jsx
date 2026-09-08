import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Modal, Space, Typography, message } from 'antd';
import { MoonOutlined } from '@ant-design/icons';
import PageLayout from '../components/PageLayout.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import DetailSidebar from '../components/DetailSidebar.jsx';
import AskAi from '../components/AskAi.jsx';
import topics from '../data/content/javascript-tutorial.json';

const { Paragraph, Title } = Typography;
const { TextArea } = Input;

// `topics` (imported above) holds [title, runnable code] pairs, ported
// verbatim from the legacy JavaScript_tutorial.html `topics` array.

// The legacy page loaded SweetAlert2 from a CDN for `Swal.fire(...)`. Rather
// than pull in that CDN script here, this shim gives the ported demo code a
// `Swal.fire` that renders through antd (message / Modal) instead — so every
// snippet above still runs unmodified.
function swalFire(arg) {
  if (typeof arg === 'string') {
    message.info(arg);
  } else if (arg && typeof arg === 'object') {
    if (arg.imageUrl) {
      Modal.info({
        title: 'Meme Magic',
        icon: null,
        okText: 'Nice',
        content: (
          <img
            src={arg.imageUrl}
            alt="Meme"
            style={{ maxWidth: '100%', width: arg.imageWidth || undefined }}
          />
        ),
      });
    } else {
      Modal.info({ title: arg.title || 'Notice', icon: null, content: arg.text || '' });
    }
  }
  return Promise.resolve({ isConfirmed: true, isDismissed: false });
}

const DARK_MODE_KEY = 'jsTutorial.darkMode';

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function JavaScriptTutorial() {
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(() => loadJson(DARK_MODE_KEY, false));
  const [codeValues, setCodeValues] = useState(() => topics.map(([, code]) => code));
  const [activeKey, setActiveKey] = useState('0');

  const sidebarItems = useMemo(
    () => topics.map(([title], index) => ({ key: String(index), label: `${index + 1}. ${title}` })),
    [],
  );

  const filteredSidebarItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sidebarItems;
    return sidebarItems.filter((item) => item.label.toLowerCase().includes(query));
  }, [sidebarItems, search]);

  const askAiContext = useMemo(
    () => topics.map(([title, code]) => ({ question: title, description: code })),
    [],
  );

  const toggleDarkMode = () => {
    setDarkMode((d) => {
      const next = !d;
      localStorage.setItem(DARK_MODE_KEY, JSON.stringify(next));
      message.info('🌙 Dark mode ' + (next ? 'enabled' : 'disabled'));
      return next;
    });
  };

  const runCode = (index) => {
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function('Swal', codeValues[index]);
      fn({ fire: swalFire });
    } catch (err) {
      message.error('❌ Error: ' + err.message);
    }
  };

  const copyCode = async (index) => {
    try {
      await navigator.clipboard.writeText(codeValues[index]);
      message.success('✅ Code copied!');
    } catch (err) {
      message.error('❌ Error: ' + err.message);
    }
  };

  const wrapperStyle = darkMode
    ? { background: '#222', color: '#fff', padding: 16, borderRadius: 10 }
    : undefined;

  const activeIndex = Number(activeKey);
  const [activeTitle] = topics[activeIndex] ?? topics[0];

  return (
    <PageLayout
      title="📌 JavaScript Tutorial"
      subtitle="40 bite-sized, runnable JavaScript snippets — variables to classes, promises and beyond."
      sidebar={
        <DetailSidebar items={filteredSidebarItems} activeKey={activeKey} onSelect={setActiveKey} />
      }
    >
      <Space orientation="vertical" size="middle" style={{ width: '100%', marginBottom: 24 }}>
        <Input
          size="large"
          placeholder="🔍 Search topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
        <Space style={{ justifyContent: 'center', width: '100%' }}>
          <Button icon={<MoonOutlined />} onClick={toggleDarkMode}>
            Toggle Dark Mode
          </Button>
        </Space>
      </Space>

      <div style={wrapperStyle}>
        <Title level={3} style={darkMode ? { color: '#fff' } : undefined}>
          {activeIndex + 1}. {activeTitle}
        </Title>
        <CodeBlock language="javascript" code={topics[activeIndex][1]} />
        <Paragraph style={darkMode ? { color: '#fff' } : undefined}>
          Tweak it below, then hit Run to see it fire live:
        </Paragraph>
        <TextArea
          value={codeValues[activeIndex]}
          onChange={(e) => {
            const value = e.target.value;
            setCodeValues((prev) => prev.map((c, i) => (i === activeIndex ? value : c)));
          }}
          autoSize={{ minRows: 3, maxRows: 10 }}
          style={{ fontFamily: 'monospace', marginBottom: 12 }}
        />
        <Space>
          <Button
            type="primary"
            style={{ background: '#008CBA', borderColor: '#008CBA' }}
            onClick={() => runCode(activeIndex)}
          >
            Run
          </Button>
          <Button onClick={() => copyCode(activeIndex)}>Copy</Button>
        </Space>
      </div>

      <AskAi context={askAiContext} />

      <Paragraph style={{ textAlign: 'center', marginTop: 24 }}>
        <Space wrap style={{ justifyContent: 'center' }}>
          <Link to="/">
            <Button type="primary">⬅️ Back to Home</Button>
          </Link>
          <Link to="/tutorials/react">
            <Button>React.js Tutorial</Button>
          </Link>
          <Link to="/tutorials/node">
            <Button>Node.js Tutorial</Button>
          </Link>
          <Link to="/tutorials/html">
            <Button>HTML Tutorial</Button>
          </Link>
          <Link to="/tutorials/mongodb">
            <Button>MongoDB Tutorial</Button>
          </Link>
          <Link to="/hr-questions">
            <Button>HR Questions</Button>
          </Link>
        </Space>
      </Paragraph>
    </PageLayout>
  );
}
