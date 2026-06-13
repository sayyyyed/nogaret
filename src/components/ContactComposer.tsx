import { useState, useRef, useCallback, useEffect } from 'react';

const EMAIL = 'aamirhassansayyed@gmail.com';

type FormatAction = 'bold' | 'italic' | 'underline' | 'insertUnorderedList' | 'createLink';

interface ToolbarButton {
  action: FormatAction;
  label: string;
  icon: React.ReactNode;
}

const toolbarButtons: ToolbarButton[] = [
  {
    action: 'bold',
    label: 'Bold',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
        <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      </svg>
    ),
  },
  {
    action: 'italic',
    label: 'Italic',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="4" x2="10" y2="4" />
        <line x1="14" y1="20" x2="5" y2="20" />
        <line x1="15" y1="4" x2="9" y2="20" />
      </svg>
    ),
  },
  {
    action: 'underline',
    label: 'Underline',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
        <line x1="4" y1="21" x2="20" y2="21" />
      </svg>
    ),
  },
  {
    action: 'insertUnorderedList',
    label: 'Bullet List',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="9" y1="6" x2="20" y2="6" />
        <line x1="9" y1="12" x2="20" y2="12" />
        <line x1="9" y1="18" x2="20" y2="18" />
        <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    action: 'createLink',
    label: 'Insert Link',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
];

export default function ContactComposer() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [subject, setSubject] = useState('');
  const [hasContent, setHasContent] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const execCommand = useCallback((action: FormatAction) => {
    if (action === 'createLink') {
      const url = prompt('Enter URL:');
      if (url) {
        document.execCommand('createLink', false, url);
      }
      return;
    }
    document.execCommand(action, false);
    editorRef.current?.focus();
  }, []);

  const handleInput = useCallback(() => {
    const text = editorRef.current?.textContent?.trim() ?? '';
    setHasContent(text.length > 0);
  }, []);

  const handleSend = useCallback(() => {
    if (!hasContent || !subject.trim()) return;
    setSending(true);
    // Simulate send with delay
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1800);
  }, [hasContent, subject]);

  const handleReset = useCallback(() => {
    setSent(false);
    setSubject('');
    setHasContent(false);
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  }, []);

  // Keyboard shortcut for formatting
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            document.execCommand('bold');
            break;
          case 'i':
            e.preventDefault();
            document.execCommand('italic');
            break;
          case 'u':
            e.preventDefault();
            document.execCommand('underline');
            break;
        }
      }
    };

    editor.addEventListener('keydown', handleKeyDown);
    return () => editor.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (sent) {
    return (
      <div className="composer-shell" data-contact-composer>
        <div className="composer-success">
          <div className="composer-success-icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 className="composer-success-title">Message sent</h3>
          <p className="composer-success-text">
            Thanks for reaching out. I'll get back to you shortly.
          </p>
          <button
            type="button"
            className="composer-reset-btn"
            onClick={handleReset}
          >
            Send another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="composer-shell" data-contact-composer>
      <div className="composer-window">
        {/* Window chrome dots */}
        <div className="composer-chrome">
          <span className="composer-dot composer-dot-red" />
          <span className="composer-dot composer-dot-yellow" />
          <span className="composer-dot composer-dot-green" />
          <span className="composer-chrome-title">New Message</span>
        </div>

        {/* Header fields */}
        <div className="composer-fields">
          <div className="composer-field">
            <label className="composer-field-label" htmlFor="composer-to">To</label>
            <input
              id="composer-to"
              className="composer-field-input"
              type="email"
              value={EMAIL}
              readOnly
              tabIndex={-1}
            />
          </div>
          <div className="composer-field">
            <label className="composer-field-label" htmlFor="composer-subject">Subject</label>
            <input
              id="composer-subject"
              className="composer-field-input"
              type="text"
              placeholder="What's this about?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
        </div>

        {/* Toolbar */}
        <div className="composer-toolbar" role="toolbar" aria-label="Text formatting">
          {toolbarButtons.map((btn) => (
            <button
              key={btn.action}
              type="button"
              className="composer-toolbar-btn"
              title={btn.label}
              aria-label={btn.label}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent focus loss from editor
                execCommand(btn.action);
              }}
            >
              {btn.icon}
            </button>
          ))}
        </div>

        {/* Editor body */}
        <div
          ref={editorRef}
          className="composer-body"
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label="Message body"
          data-placeholder="Write your message here..."
          onInput={handleInput}
          suppressContentEditableWarning
        />

        {/* Footer */}
        <div className="composer-footer">
          <button
            type="button"
            className="composer-send-btn"
            disabled={!hasContent || !subject.trim() || sending}
            onClick={handleSend}
            aria-label={sending ? 'Sending message...' : 'Send message'}
          >
            {sending ? (
              <>
                <span className="composer-spinner" aria-hidden="true" />
                Sending...
              </>
            ) : (
              <>
                Send
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </>
            )}
          </button>
          <span className="composer-hint">
            ⌘B bold · ⌘I italic · ⌘U underline
          </span>
        </div>
      </div>
    </div>
  );
}
