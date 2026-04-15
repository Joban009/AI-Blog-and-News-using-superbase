import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Link2, Quote, Heading2, Heading3, Undo, Redo, Code } from 'lucide-react';

const Btn = ({ onClick, active, title, children }) => (
  <button type="button" onClick={onClick} title={title}
    className={`p-1.5 rounded-lg transition-colors text-sm ${active ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-100'}`}>
    {children}
  </button>
);

export default function RichTextEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Start writing your post…' }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: 'prose-content min-h-[280px] px-4 py-3 focus:outline-none' } },
  });

  if (!editor) return null;

  return (
    <div className="border border-ink-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-400">
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-ink-100 bg-ink-50">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()}        active={editor.isActive('bold')}           title="Bold"><Bold size={14}/></Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()}      active={editor.isActive('italic')}         title="Italic"><Italic size={14}/></Btn>
        <Btn onClick={() => editor.chain().focus().toggleCode().run()}        active={editor.isActive('code')}           title="Code"><Code size={14}/></Btn>
        <div className="w-px h-4 bg-ink-200 mx-1"/>
        <Btn onClick={() => editor.chain().focus().toggleHeading({level:2}).run()} active={editor.isActive('heading',{level:2})} title="H2"><Heading2 size={14}/></Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({level:3}).run()} active={editor.isActive('heading',{level:3})} title="H3"><Heading3 size={14}/></Btn>
        <div className="w-px h-4 bg-ink-200 mx-1"/>
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()}  active={editor.isActive('bulletList')}     title="List"><List size={14}/></Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}    title="Ordered"><ListOrdered size={14}/></Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()}  active={editor.isActive('blockquote')}     title="Quote"><Quote size={14}/></Btn>
        <Btn onClick={() => { const url = prompt('URL:'); if(url) editor.chain().focus().setLink({href:url}).run(); }}
             active={editor.isActive('link')} title="Link"><Link2 size={14}/></Btn>
        <div className="w-px h-4 bg-ink-200 mx-1"/>
        <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo size={14}/></Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo size={14}/></Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
