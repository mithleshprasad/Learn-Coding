import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('html', markup);

// A small, non-interactive syntax-highlighted snippet used as a tutorial
// card's thumbnail — ties the homepage back to the same "real code" look as
// the hero's editor window, instead of an icon or a hotlinked photo.
export default function TutorialThumb({ code, language = 'javascript', accent }) {
  return (
    <div className="tutorial-thumb" style={{ background: accent }}>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          background: 'transparent',
          padding: 0,
          margin: 0,
          fontSize: 12,
          lineHeight: 1.6,
          overflow: 'hidden',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
