'use client';

import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import styles from './TextBoxCanvas.module.css';

export interface TextBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
}

export interface TextBoxCanvasHandle {
  addBox: () => void;
}

const MIN_WIDTH = 160;
const MIN_HEIGHT = 100;
const DEFAULT_WIDTH = 260;
const DEFAULT_HEIGHT = 150;

function countWords(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function countTotalWords(json: string) {
  return parseBoxes(json).reduce((sum, box) => sum + countWords(box.text), 0);
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
        text: typeof b.text === 'string' ? b.text : '',
      }));
  } catch {
    return [];
  }
}

function makeId() {
  return `box_${Math.random().toString(36).slice(2, 10)}`;
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
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const pendingFocusId = useRef<string | null>(null);
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
      text: '',
    };
    commit([...boxes, box]);
    bringToFront(id);
    pendingFocusId.current = id;
  }, [boxes, commit, bringToFront]);

  useImperativeHandle(ref, () => ({ addBox }), [addBox]);

  const deleteBox = useCallback(
    (id: string) => {
      commit(boxes.filter((b) => b.id !== id));
    },
    [boxes, commit],
  );

  const updateText = useCallback(
    (id: string, text: string) => {
      commit(boxes.map((b) => (b.id === id ? { ...b, text } : b)));
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
        <div
          key={box.id}
          className={styles.box}
          style={{ left: box.x, top: box.y, width: box.width, height: box.height, zIndex: zOrder[box.id] ?? 1 }}
          onPointerDown={() => bringToFront(box.id)}
        >
          <div className={styles.boxHandle} onPointerDown={(e) => startDrag(e, box.id, 'move')}>
            <span className={styles.boxWordCount}>{countWords(box.text)} words</span>
            <button
              type="button"
              className={styles.deleteButton}
              aria-label="Delete text box"
              title="Delete text box"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => deleteBox(box.id)}
            >
              <Trash2 size={12} />
            </button>
          </div>
          <textarea
            ref={(el) => {
              textareaRefs.current[box.id] = el;
              if (el && pendingFocusId.current === box.id) {
                pendingFocusId.current = null;
                el.focus();
              }
            }}
            className={styles.boxTextarea}
            value={box.text}
            placeholder="Start writing…"
            onChange={(e) => updateText(box.id, e.target.value)}
            onPointerDown={() => bringToFront(box.id)}
          />
          <div className={styles.resizeHandle} onPointerDown={(e) => startDrag(e, box.id, 'resize')} />
        </div>
      ))}
    </div>
  );
});

export default TextBoxCanvas;
