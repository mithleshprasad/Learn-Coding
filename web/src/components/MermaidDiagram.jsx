import { useEffect, useId, useRef, useState } from 'react';
import mermaid from 'mermaid';
import './MermaidDiagram.css';

let initialized = false;
function ensureInit() {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: {
      background: '#161b22',
      primaryColor: '#1c2128',
      primaryTextColor: '#e6edf3',
      primaryBorderColor: '#2f8d46',
      lineColor: '#4ecb70',
      secondaryColor: '#21262d',
      tertiaryColor: '#0d1117',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    },
    securityLevel: 'strict',
  });
  initialized = true;
}

/** Renders a Mermaid diagram definition (flowchart syntax) to inline SVG. */
export default function MermaidDiagram({ definition }) {
  const id = useId().replace(/:/g, '-');
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    ensureInit();
    setError(null);

    mermaid
      .render(`mermaid-${id}`, definition)
      .then(({ svg }) => {
        if (!cancelled && containerRef.current) containerRef.current.innerHTML = svg;
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to render diagram.');
      });

    return () => {
      cancelled = true;
    };
  }, [definition, id]);

  if (error) {
    return (
      <div className="mermaid-diagram mermaid-diagram-error">
        Could not render diagram: {error}
      </div>
    );
  }

  return <div className="mermaid-diagram" ref={containerRef} />;
}
