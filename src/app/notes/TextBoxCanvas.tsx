'use client';

import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Bold, CheckSquare, Highlighter, Italic, List, Trash2, Underline as UnderlineIcon } from 'lucide-react';
import styles from './TextBoxCanvas.module.css';

export interface TextBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  html: string;
}

export interface TextBoxCanvasHandle {
  addBox: () => void;
}

const MIN_WIDTH = 220;
const MIN_HEIGHT = 140;
const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 190;
const EMPTY_HTML = '<p></p>';

const boxExtensions = [
  StarterKit.configure({ heading: false }),
  Highlight.configure({ multicolor: false }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Placeholder.configure({ placeholder: 'Start writing…' }),
];

function countWordsInHtml(html: string) {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function countTotalWords(json: string) {
  return parseBoxes(json).reduce((sum, box) => sum + countWordsInHtml(box.html), 0);
}

function parseBoxes(json: string): TextBox[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((b) => b && typeof b.id === 'string')
      .map((b) => ({
        id: b.id,
        x: Number(b.x) || 0,
        y: Number(b.y) || 0,
        width: Number(b.width) || DEFAULT_WIDTH,
        height: Number(b.height) || DEFAULT_HEIGHT,
        html:
          typeof b.html === 'string'
            ? b.html
            : typeof b.text === 'string' && b.text
              ? `<p>${b.text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`
              : EMPTY_HTML,
      }));
  } catch {
    return [];
  }
}

function makeId() {
  return `box_${Math.random().toString(36).slice(2, 10)}`;
}

interface TextBoxItemProps {
  box: TextBox;
  zIndex: number;
  autoFocus: boolean;
  onDragStart: (event: React.PointerEvent, id: string, mode: 'move' | 'resize') => void;
  onBringToFront: (id: string) => void;
  onHtmlChange: (id: string, html: string) => void;
  onDelete: (id: string) => void;
}

function TextBoxItem({ box, zIndex, autoFocus, onDragStart, onBringToFront, onHtmlChange, onDelete }: TextBoxItemProps) {
  const [wordCount, setWordCount] = useState(() => countWordsInHtml(box.html));

  const editor = useEditor({
    extensions: boxExtensions,
    content: box.html || EMPTY_HTML,
    immediatelyRender: true,
    autofocus: autoFocus ? 'end' : false,
    editorProps: { attributes: { class: styles.boxEditorContent } },
    onUpdate: ({ editor: instance }) => {
      const html = instance.getHTML();
      onHtmlChange(box.id, html);
      setWordCount(countWordsInHtml(html));
    },
  });

  return (
    <div
      className={styles.box}
      style={{ left: box.x, top: box.y, width: box.width, height: box.height, zIndex }}
      onPointerDown={() => onBringToFront(box.id)}
    >
      <div className={styles.boxHandle} onPointerDown={(e) => onDragStart(e, box.id, 'move')}>
        <span className={styles.boxWordCount}>{wordCount} words</span>
        <button
          type="button"
          className={styles.deleteButton}
          aria-label="Delete text box"
          title="Delete text box"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onDelete(box.id)}
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className={styles.boxToolbar}>
        <button type="button" className={styles.boxToolButton} onClick={() => editor?.chain().focus().toggleBold().run()} aria-label="Bold" title="Bold">
          <Bold size={12} />
        </button>
        <button type="button" className={styles.boxToolButton} onClick={() => editor?.chain().focus().toggleItalic().run()} aria-label="Italic" title="Italic">
          <Italic size={12} />
        </button>
        <button type="button" className={styles.boxToolButton} onClick={() => editor?.chain().focus().toggleUnderline().run()} aria-label="Underline" title="Underline">
          <UnderlineIcon size={12} />
        </button>
        <button type="button" className={styles.boxToolButton} onClick={() => editor?.chain().focus().toggleHighlight().run()} aria-label="Highlight" title="Highlight">
          <Highlighter size={12} />
        </button>
        <button type="button" className={styles.boxToolButton} onClick={() => editor?.chain().focus().toggleBulletList().run()} aria-label="Bullet list" title="Bullet list">
          <List size={12} />
        </button>
        <button type="button" className={styles.boxToolButton} onClick={() => editor?.chain().focus().toggleTaskList().run()} aria-label="Checklist" title="Checklist">
          <CheckSquare size={12} />
        </button>
      </div>

      <div className={styles.boxEditorScroll} onPointerDown={() => onBringToFront(box.id)}>
        <EditorContent editor={editor} />
      </div>

      <div className={styles.resizeHandle} onPointerDown={(e) => onDragStart(e, box.id, 'resize')} />
    </div>
  );
}

interface TextBoxCanvasProps {
  initialData: string;
  onChange: (json: string) => void;
}

const TextBoxCanvas = forwardRef<TextBoxCanvasHandle, TextBoxCanvasProps>(function TextBoxCanvas(
  { initialData, onChange },
  ref,
) {
  const [boxes, setBoxes] = useState<TextBox[]>(() => parseBoxes(initialData));
  const [zOrder, setZOrder] = useState<Record<string, number>>({});
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);
  const topZRef = useRef(1);
  const dragState = useRef<{
    id: string;
    mode: 'move' | 'resize';
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origWidth: number;
    origHeight: number;
  } | null>(null);

  const commit = useCallback(
    (next: TextBox[]) => {
      setBoxes(next);
      onChange(JSON.stringify(next));
    },
    [onChange],
  );

  const bringToFront = useCallback((id: string) => {
    topZRef.current += 1;
    setZOrder((prev) => ({ ...prev, [id]: topZRef.current }));
  }, []);

  const addBox = useCallback(() => {
    const id = makeId();
    const cascade = (boxes.length % 6) * 22;
    const box: TextBox = {
      id,
      x: 32 + cascade,
      y: 32 + cascade,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      html: EMPTY_HTML,
    };
    commit([...boxes, box]);
    bringToFront(id);
    setLastCreatedId(id);
  }, [boxes, commit, bringToFront]);

  useImperativeHandle(ref, () => ({ addBox }), [addBox]);

  const deleteBox = useCallback(
    (id: string) => {
      commit(boxes.filter((b) => b.id !== id));
    },
    [boxes, commit],
  );

  const updateHtml = useCallback(
    (id: string, html: string) => {
      commit(boxes.map((b) => (b.id === id ? { ...b, html } : b)));
    },
    [boxes, commit],
  );

  const startDrag = useCallback(
    (event: React.PointerEvent, id: string, mode: 'move' | 'resize') => {
      const box = boxes.find((b) => b.id === id);
      if (!box) return;
      event.preventDefault();
      bringToFront(id);
      dragState.current = {
        id,
        mode,
        startX: event.clientX,
        startY: event.clientY,
        origX: box.x,
        origY: box.y,
        origWidth: box.width,
        origHeight: box.height,
      };

      let latest: TextBox[] = boxes;

      const onMove = (e: PointerEvent) => {
        const drag = dragState.current;
        if (!drag) return;
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        latest = latest.map((b) => {
          if (b.id !== drag.id) return b;
          if (drag.mode === 'move') {
            return { ...b, x: Math.max(0, drag.origX + dx), y: Math.max(0, drag.origY + dy) };
          }
          return {
            ...b,
            width: Math.max(MIN_WIDTH, drag.origWidth + dx),
            height: Math.max(MIN_HEIGHT, drag.origHeight + dy),
          };
        });
        setBoxes(latest);
      };

      const onUp = () => {
        dragState.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        onChange(JSON.stringify(latest));
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [boxes, bringToFront, onChange],
  );

  return (
    <div className={styles.layer}>
      {boxes.map((box) => (
        <TextBoxItem
          key={box.id}
          box={box}
          zIndex={zOrder[box.id] ?? 1}
          autoFocus={box.id === lastCreatedId}
          onDragStart={startDrag}
          onBringToFront={bringToFront}
          onHtmlChange={updateHtml}
          onDelete={deleteBox}
        />
      ))}
    </div>
  );
});

export default TextBoxCanvas;
