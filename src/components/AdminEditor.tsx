import { useEffect, useRef } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';

interface AdminEditorProps {
  initialValue: string;
  onChange: (html: string, json?: JSONContent) => void;
  placeholder?: string;
}

const toolbarButton = (active = false) =>
  `flex h-8 min-w-8 items-center justify-center rounded px-2 text-sm font-semibold transition-colors ${
    active ? 'bg-[#f7a501]/20 text-[#f7a501]' : 'text-[#9b9c92] hover:bg-[#33342d] hover:text-[#eeefe9]'
  }`;

export default function AdminEditor({ initialValue, onChange, placeholder = 'Start typing...' }: AdminEditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https' }),
      Image.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: initialValue || '',
    editorProps: {
      attributes: {
        class: 'min-h-[320px] max-h-[620px] overflow-y-auto p-5 text-[#eeefe9] focus:outline-none prose prose-invert max-w-none prose-p:my-2 prose-headings:my-4 prose-a:text-[#f7a501] prose-blockquote:border-l-[#f7a501]',
      },
    },
    onUpdate: ({ editor: currentEditor }) => onChangeRef.current(currentEditor.getHTML(), currentEditor.getJSON()),
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      bold: currentEditor?.isActive('bold') ?? false,
      italic: currentEditor?.isActive('italic') ?? false,
      underline: currentEditor?.isActive('underline') ?? false,
      bulletList: currentEditor?.isActive('bulletList') ?? false,
      orderedList: currentEditor?.isActive('orderedList') ?? false,
      blockquote: currentEditor?.isActive('blockquote') ?? false,
      codeBlock: currentEditor?.isActive('codeBlock') ?? false,
    }),
  });

  useEffect(() => {
    if (!editor || editor.getHTML() === initialValue) return;
    editor.commands.setContent(initialValue || '', { emitUpdate: false });
  }, [editor, initialValue]);

  if (!editor) return <div className="min-h-[320px] animate-pulse rounded-md border border-[#4d4f46] bg-[#1a1b16]" />;

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL tautan', previousUrl || 'https://');
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const addImage = () => {
    const url = window.prompt('URL gambar', 'https://');
    if (url?.trim()) editor.chain().focus().setImage({ src: url.trim() }).run();
  };

  return (
    <div className="overflow-hidden rounded-md border border-[#4d4f46] bg-[#1a1b16] focus-within:border-[#f7a501] focus-within:ring-2 focus-within:ring-[#f7a501]/30">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-[#4d4f46] bg-[#23251d] p-2">
        <button type="button" className={toolbarButton(state?.bold)} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><strong>B</strong></button>
        <button type="button" className={toolbarButton(state?.italic)} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><em>I</em></button>
        <button type="button" className={toolbarButton(state?.underline)} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><span className="underline">U</span></button>
        <span className="mx-1 h-5 w-px bg-[#4d4f46]" />
        <button type="button" className={toolbarButton(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button type="button" className={toolbarButton(editor.isActive('heading', { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
        <button type="button" className={toolbarButton(state?.bulletList)} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button type="button" className={toolbarButton(state?.orderedList)} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
        <button type="button" className={toolbarButton(state?.blockquote)} onClick={() => editor.chain().focus().toggleBlockquote().run()}>Quote</button>
        <button type="button" className={toolbarButton(state?.codeBlock)} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>Code</button>
        <span className="mx-1 h-5 w-px bg-[#4d4f46]" />
        <button type="button" className={toolbarButton(editor.isActive('link'))} onClick={addLink}>Link</button>
        <button type="button" className={toolbarButton()} onClick={addImage}>Image URL</button>
        <button type="button" className={toolbarButton()} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>Undo</button>
        <button type="button" className={toolbarButton()} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>Redo</button>
      </div>
      <EditorContent editor={editor} />
      <style>{`
        .tiptap p.is-editor-empty:first-child::before { color: #6c6e63; content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
        .tiptap { font-family: "IBM Plex Sans", sans-serif; font-size: 15px; line-height: 1.75; }
        .tiptap h2 { font-size: 1.55rem; font-weight: 800; }
        .tiptap h3 { font-size: 1.25rem; font-weight: 750; }
        .tiptap h4 { font-size: 1.05rem; font-weight: 700; }
        .tiptap ul { list-style: disc; padding-left: 1.5rem; }
        .tiptap ol { list-style: decimal; padding-left: 1.5rem; }
        .tiptap pre { background: #23251d; border-radius: .4rem; overflow-x: auto; padding: .9rem 1rem; }
        .tiptap img { border-radius: .5rem; height: auto; margin: 1rem auto; max-width: 100%; }
      `}</style>
    </div>
  );
}
