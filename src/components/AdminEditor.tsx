import React, { useRef, useState, useEffect } from 'react';

interface AdminEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function AdminEditor({ initialValue, onChange, placeholder = 'Start typing...' }: AdminEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && initialValue && editorRef.current.innerHTML !== initialValue) {
      editorRef.current.innerHTML = initialValue;
    }
  }, [initialValue]);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleChange();
  };

  const handleLink = () => {
    const url = prompt('Enter link URL:', 'https://');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const handleImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const handleVideo = () => {
    const url = prompt('Enter YouTube or Vimeo URL to embed:');
    if (url) {
      let embedHtml = '';
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
        embedHtml = `<div class="aspect-video w-full my-4 rounded-md overflow-hidden bg-[#23251d]"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div><p><br></p>`;
      } else if (url.includes('vimeo.com')) {
        const videoId = url.split('/').pop();
        embedHtml = `<div class="aspect-video w-full my-4 rounded-md overflow-hidden bg-[#23251d]"><iframe src="https://player.vimeo.com/video/${videoId}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe></div><p><br></p>`;
      } else {
        alert('Currently only YouTube and Vimeo URLs are supported for automatic embedding.');
        return;
      }
      execCommand('insertHTML', embedHtml);
    }
  };

  const handleChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className={`border rounded-md overflow-hidden transition-colors ${isFocused ? 'border-[#f7a501] ring-2 ring-[#f7a501]/30' : 'border-[#4d4f46]'}`}>
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#23251d] border-b border-[#4d4f46]">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="flex items-center justify-center w-8 h-8 rounded text-[#9b9c92] hover:bg-[#33342d] hover:text-[#eeefe9] transition-colors"
          title="Bold"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 12a4 4 0 0 0 0-8H6v8"/><path d="M15 20a4 4 0 0 0 0-8H6v8Z"/></svg>
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="flex items-center justify-center w-8 h-8 rounded text-[#9b9c92] hover:bg-[#33342d] hover:text-[#eeefe9] transition-colors"
          title="Italic"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="flex items-center justify-center w-8 h-8 rounded text-[#9b9c92] hover:bg-[#33342d] hover:text-[#eeefe9] transition-colors"
          title="Underline"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/></svg>
        </button>

        <div className="w-px h-5 bg-[#4d4f46] mx-1"></div>

        <select
          onChange={(e) => execCommand('formatBlock', e.target.value)}
          defaultValue=""
          className="h-8 pl-2 pr-6 bg-transparent text-[#9b9c92] hover:bg-[#33342d] hover:text-[#eeefe9] rounded appearance-none outline-none text-sm font-medium transition-colors cursor-pointer"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1L5 5L9 1\' stroke=\'%239b9c92\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")', backgroundPosition: 'right 6px center', backgroundRepeat: 'no-repeat' }}
        >
          <option value="" disabled className="bg-[#23251d] text-[#eeefe9]">Format</option>
          <option value="P" className="bg-[#23251d] text-[#eeefe9]">Paragraph</option>
          <option value="H2" className="bg-[#23251d] text-[#eeefe9]">Heading 2</option>
          <option value="H3" className="bg-[#23251d] text-[#eeefe9]">Heading 3</option>
          <option value="H4" className="bg-[#23251d] text-[#eeefe9]">Heading 4</option>
          <option value="BLOCKQUOTE" className="bg-[#23251d] text-[#eeefe9]">Quote</option>
          <option value="PRE" className="bg-[#23251d] text-[#eeefe9]">Code Block</option>
        </select>

        <div className="w-px h-5 bg-[#4d4f46] mx-1"></div>

        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="flex items-center justify-center w-8 h-8 rounded text-[#9b9c92] hover:bg-[#33342d] hover:text-[#eeefe9] transition-colors"
          title="Bullet List"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="flex items-center justify-center w-8 h-8 rounded text-[#9b9c92] hover:bg-[#33342d] hover:text-[#eeefe9] transition-colors"
          title="Numbered List"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
        </button>

        <div className="w-px h-5 bg-[#4d4f46] mx-1"></div>

        <button
          type="button"
          onClick={handleLink}
          className="flex items-center justify-center w-8 h-8 rounded text-[#9b9c92] hover:bg-[#33342d] hover:text-[#eeefe9] transition-colors"
          title="Link"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </button>
        <button
          type="button"
          onClick={handleImage}
          className="flex items-center justify-center w-8 h-8 rounded text-[#9b9c92] hover:bg-[#33342d] hover:text-[#eeefe9] transition-colors"
          title="Image"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
        </button>
        <button
          type="button"
          onClick={handleVideo}
          className="flex items-center justify-center w-8 h-8 rounded text-[#9b9c92] hover:bg-[#33342d] hover:text-[#eeefe9] transition-colors"
          title="Video Embed"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[240px] max-h-[500px] overflow-y-auto p-4 bg-[#1a1b16] text-[#eeefe9] prose prose-invert prose-p:my-2 prose-headings:my-4 prose-a:text-[#f7a501] prose-blockquote:border-l-[#f7a501] focus:outline-none"
        onInput={handleChange}
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
        data-placeholder={placeholder}
        style={{
          /* Custom styles for WYSIWYG content to match the theme */
        }}
      />
      <style>{`
        div[contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #6c6e63;
          pointer-events: none;
          display: block;
        }
        div[contenteditable] {
          font-family: "IBM Plex Sans", sans-serif;
          font-size: 15px;
          line-height: 1.7;
        }
        div[contenteditable] h2 { font-size: 21px; font-weight: 700; color: #eeefe9; margin-top: 1.2em; margin-bottom: 0.6em; }
        div[contenteditable] h3 { font-size: 18px; font-weight: 700; color: #eeefe9; margin-top: 1em; margin-bottom: 0.5em; }
        div[contenteditable] h4 { font-size: 16px; font-weight: 700; color: #eeefe9; margin-top: 1em; margin-bottom: 0.5em; }
        div[contenteditable] a { color: #f7a501; text-decoration: underline; text-underline-offset: 3px; }
        div[contenteditable] blockquote { border-left: 3px solid #f7a501; padding-left: 1rem; margin: 1em 0; color: #b6b7af; }
        div[contenteditable] img { max-width: 100%; border-radius: 6px; margin: 1em auto; display: block; }
        div[contenteditable] ul { list-style-type: disc; padding-left: 24px; margin: 0.6em 0; }
        div[contenteditable] ol { list-style-type: decimal; padding-left: 24px; margin: 0.6em 0; }
        div[contenteditable] pre { background: #23251d; padding: 12px 16px; border-radius: 4px; overflow-x: auto; font-family: "Source Code Pro", monospace; font-size: 14px; margin: 1em 0; }
      `}</style>
    </div>
  );
}
