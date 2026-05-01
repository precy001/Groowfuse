/**
 * Rich text editor based on TipTap.
 * --------------------------------------------------------
 * Provides bold/italic/headings/links/lists/blockquote toolbar plus
 * image insertion (upload from device or URL).
 *
 * Both link and image use proper themed modals — no window.prompt.
 *
 * Props:
 *   value     Initial HTML string.
 *   onChange  Called with the latest HTML on every change.
 *   placeholder
 */

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import LinkPromptModal from './LinkPromptModal';
import ImagePickerModal from './ImagePickerModal';

export default function RichTextEditor({ value = '', onChange, placeholder = 'Start writing…' }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [imgOpen, setImgOpen] = useState(false);
  const [initialLink, setInitialLink] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) return null;

  const openLinkModal = () => {
    setInitialLink(editor.getAttributes('link').href || '');
    setLinkOpen(true);
  };

  const handleLinkSubmit = (url) => {
    if (!url) {
      // Empty → remove the link
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleImagePick = (src, alt) => {
    editor.chain().focus().setImage({ src, alt: alt || '' }).run();
  };

  return (
    <>
      <div className="adm-rte">
        <Toolbar
          editor={editor}
          onLink={openLinkModal}
          onImage={() => setImgOpen(true)}
        />
        <EditorContent editor={editor} className="adm-rte-content" />
      </div>

      <LinkPromptModal
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        onSubmit={handleLinkSubmit}
        initialUrl={initialLink}
      />
      <ImagePickerModal
        open={imgOpen}
        onClose={() => setImgOpen(false)}
        onPick={handleImagePick}
        title="Insert image"
      />
    </>
  );
}

/* ─── Toolbar ─── */
function Toolbar({ editor, onLink, onImage }) {
  const Btn = ({ active, onClick, children, label }) => (
    <button
      type="button"
      onClick={onClick}
      className={`adm-rte-btn ${active ? 'is-active' : ''}`}
      aria-label={label}
      aria-pressed={!!active}
      title={label}
    >
      {children}
    </button>
  );

  return (
    <div className="adm-rte-toolbar" role="toolbar" aria-label="Formatting">
      <Btn label="Bold" active={editor.isActive('bold')}
           onClick={() => editor.chain().focus().toggleBold().run()}>
        <strong>B</strong>
      </Btn>
      <Btn label="Italic" active={editor.isActive('italic')}
           onClick={() => editor.chain().focus().toggleItalic().run()}>
        <em>I</em>
      </Btn>
      <Btn label="Strikethrough" active={editor.isActive('strike')}
           onClick={() => editor.chain().focus().toggleStrike().run()}>
        <s>S</s>
      </Btn>

      <span className="adm-rte-divider" aria-hidden />

      <Btn label="Heading 2" active={editor.isActive('heading', { level: 2 })}
           onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </Btn>
      <Btn label="Heading 3" active={editor.isActive('heading', { level: 3 })}
           onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </Btn>
      <Btn label="Paragraph" active={editor.isActive('paragraph')}
           onClick={() => editor.chain().focus().setParagraph().run()}>
        P
      </Btn>

      <span className="adm-rte-divider" aria-hidden />

      <Btn label="Bulleted list" active={editor.isActive('bulletList')}
           onClick={() => editor.chain().focus().toggleBulletList().run()}>
        ⋮≡
      </Btn>
      <Btn label="Numbered list" active={editor.isActive('orderedList')}
           onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1.
      </Btn>
      <Btn label="Quote" active={editor.isActive('blockquote')}
           onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        ❝
      </Btn>

      <span className="adm-rte-divider" aria-hidden />

      <Btn label="Link" active={editor.isActive('link')} onClick={onLink}>🔗</Btn>
      <Btn label="Image" active={false} onClick={onImage}>▦</Btn>

      <span className="adm-rte-divider" aria-hidden />

      <Btn label="Undo" active={false}
           onClick={() => editor.chain().focus().undo().run()}>↶</Btn>
      <Btn label="Redo" active={false}
           onClick={() => editor.chain().focus().redo().run()}>↷</Btn>
    </div>
  );
}