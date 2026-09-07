import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('html', markup);

const customStyle = {
  borderRadius: 8,
  padding: '16px 20px',
  fontSize: 14,
  margin: '16px 0',
};

export default function CodeBlock({ code, language = 'javascript' }) {
  const trimmed = code.trim();

  if (language === 'text') {
    return (
      <pre
        style={{
          ...customStyle,
          background: '#1e1e1e',
          color: '#d4d4d4',
          overflowX: 'auto',
          fontFamily: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
        }}
      >
        {trimmed}
      </pre>
    );
  }

  return (
    <SyntaxHighlighter language={language} style={vscDarkPlus} customStyle={customStyle}>
      {trimmed}
    </SyntaxHighlighter>
  );
}
