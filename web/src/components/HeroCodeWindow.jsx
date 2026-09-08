import { useEffect, useState } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './HeroCodeWindow.css';

SyntaxHighlighter.registerLanguage('javascript', javascript);

const SNIPPET = `// Welcome to Learn Coding
const skills = [
  'HTML', 'CSS', 'JS',
  'React', 'Node.js',
];

function masterCoding() {
  return skills.map(
    (skill) => \`\${skill}: Mastered\`
  );
}

console.log(masterCoding());`;

const TYPE_SPEED_MS = 28;
const PAUSE_MS = 1800;

/**
 * Mock VS Code-style window that types SNIPPET out character by character,
 * pauses, then resets — a self-contained "hero illustration" that matches
 * the site's own theme instead of a hotlinked stock photo.
 */
export default function HeroCodeWindow() {
  const [visibleChars, setVisibleChars] = useState(0);

  useEffect(() => {
    const delay = visibleChars < SNIPPET.length ? TYPE_SPEED_MS : PAUSE_MS;
    const timeoutId = setTimeout(() => {
      setVisibleChars((n) => (n < SNIPPET.length ? n + 1 : 0));
    }, delay);
    return () => clearTimeout(timeoutId);
  }, [visibleChars]);

  const typing = visibleChars < SNIPPET.length;
  const displayed = SNIPPET.slice(0, visibleChars) + (typing ? '▌' : '');

  return (
    <div className="hero-code-window">
      <div className="hero-code-window-titlebar">
        <span className="hero-code-window-dot hero-code-window-dot-red" />
        <span className="hero-code-window-dot hero-code-window-dot-yellow" />
        <span className="hero-code-window-dot hero-code-window-dot-green" />
        <span className="hero-code-window-filename">app.js</span>
      </div>
      <div className="hero-code-window-body">
        <SyntaxHighlighter
          language="javascript"
          style={vscDarkPlus}
          customStyle={{
            background: 'transparent',
            padding: 0,
            margin: 0,
            fontSize: 14,
            overflowX: 'hidden',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {displayed}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
