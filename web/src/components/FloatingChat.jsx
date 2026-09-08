import { useState } from 'react';
import { Button } from 'antd';
import { CloseOutlined, MessageOutlined } from '@ant-design/icons';
import AskAi from './AskAi.jsx';
import './FloatingChat.css';

/**
 * Fixed bottom-right chat bubble that opens a panel with the same AskAi
 * widget used inline on tutorial pages — for pages (like Home) that aren't
 * about one specific tutorial, so there's no natural place to embed it inline.
 */
export default function FloatingChat({ context, heading = '🤖 Ask AI' }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="floating-chat">
      {open ? (
        <div className="floating-chat-panel">
          <div className="floating-chat-panel-header">
            <span>{heading}</span>
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            />
          </div>
          <div className="floating-chat-panel-body">
            <AskAi context={context} heading={heading} showHeading={false} />
          </div>
        </div>
      ) : null}
      <Button
        className="floating-chat-toggle"
        shape="circle"
        size="large"
        type="primary"
        icon={open ? <CloseOutlined /> : <MessageOutlined />}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat' : 'Open AI chat'}
      />
    </div>
  );
}
