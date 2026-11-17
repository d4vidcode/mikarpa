'use client';

import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
} from 'lucide-react';

/**
 * Editor de descripciones (Tiptap). El HTML se sanea en el servidor antes de
 * guardarse (`lib/sanitize.ts`), así que aquí solo cuidamos la experiencia.
 */
export function RichTextEditor({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '<p></p>',
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'min-h-40 w-full rounded-b-md border border-t-0 border-input bg-background px-3 py-2 text-sm outline-none [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:font-semibold [&_p]:my-1 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground',
      },
    },
    onUpdate: ({ editor: instance }) => {
      const html = instance.getHTML();
      onChange(html === '<p></p>' ? '' : html);
    },
  });

  // Sincroniza cambios externos (por ejemplo al cargar otro producto).
  useEffect(() => {
    if (!editor) {
      return;
    }
    const current = editor.getHTML();
    const next = value || '<p></p>';
    if (current !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="min-h-44 w-full animate-pulse rounded-md border border-input bg-muted/40" />
    );
  }

  function buttonClass(active: boolean): string {
    return `inline-flex size-8 items-center justify-center rounded transition-colors ${
      active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
    }`;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t-md border border-input bg-muted/40 p-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={buttonClass(editor.isActive('bold'))}
          aria-label="Negrita"
        >
          <Bold className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={buttonClass(editor.isActive('italic'))}
          aria-label="Cursiva"
        >
          <Italic className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={buttonClass(editor.isActive('heading', { level: 2 }))}
          aria-label="Título"
        >
          <Heading2 className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={buttonClass(editor.isActive('heading', { level: 3 }))}
          aria-label="Subtítulo"
        >
          <Heading3 className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={buttonClass(editor.isActive('bulletList'))}
          aria-label="Lista con viñetas"
        >
          <List className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={buttonClass(editor.isActive('orderedList'))}
          aria-label="Lista numerada"
        >
          <ListOrdered className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={buttonClass(editor.isActive('blockquote'))}
          aria-label="Cita"
        >
          <Quote className="size-4" aria-hidden />
        </button>

        <span className="mx-1 h-5 w-px bg-border" aria-hidden />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className={buttonClass(false)}
          aria-label="Deshacer"
        >
          <Undo2 className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={buttonClass(false)}
          aria-label="Rehacer"
        >
          <Redo2 className="size-4" aria-hidden />
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
