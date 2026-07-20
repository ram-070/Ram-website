"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function PDFViewer({ url, name, onDelete }: { url: string; name?: string; onDelete?: () => void }) {
  const [scale, setScale] = useState(1.0);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ReactPDF, setReactPDF] = useState<typeof import('react-pdf') | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setScale(1.0);
    setNumPages(null);
    setLoading(true);
    setError(null);
    // Dynamically load react-pdf on client after worker has been configured
    let mounted = true;
    import('react-pdf')
      .then((mod) => {
        mod.pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        if (mounted) setReactPDF(mod);
      })
      .catch((err) => {
        console.error('Failed to load react-pdf', err);
        setError(String(err));
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [url]);

  function onDocumentLoadSuccess({ numPages: n }: { numPages: number }) {
    setNumPages(n);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(err: Error) {
    setError(String(err));
    setLoading(false);
  }

  const zoomIn = () => setScale((s) => Math.min(3, +(s + 0.25).toFixed(2)));
  const zoomOut = () => setScale((s) => Math.max(0.5, +(s - 0.25).toFixed(2)));

  const openNewTab = () => window.open(url, '_blank', 'noopener');

  const download = async () => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name || 'file.pdf';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    }
  };

  return (
    <motion.div ref={containerRef} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="h-full flex flex-col border-l bg-white">
      <div className="flex items-center gap-2 p-2 border-b bg-white/50">
        <div className="text-sm font-medium truncate">{name ?? 'PDF Preview'}</div>
        <div className="ml-auto flex items-center gap-2">
          <button className="px-2 py-1 text-sm" onClick={zoomOut} aria-label="Zoom out">-</button>
          <div className="text-sm">{Math.round(scale * 100)}%</div>
          <button className="px-2 py-1 text-sm" onClick={zoomIn} aria-label="Zoom in">+</button>
          {numPages ? <div className="text-sm text-gray-500">{numPages} page{numPages > 1 ? 's' : ''}</div> : null}
          <button className="px-2 py-1 text-sm" onClick={toggleFullscreen} aria-label="Toggle fullscreen">Fullscreen</button>
          <button className="px-2 py-1 text-sm" onClick={openNewTab} aria-label="Open in new tab">Open</button>
          <button className="px-2 py-1 text-sm" onClick={download} aria-label="Download">Download</button>
          {onDelete ? <button className="px-2 py-1 text-sm text-red-600" onClick={onDelete} aria-label="Delete">Delete</button> : null}
        </div>
      </div>

      <div className="flex-1 relative bg-gray-50 overflow-auto p-4">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse text-sm text-gray-500">Loading PDF…</div>
          </div>
        ) : null}

        {error ? (
          <div className="p-4 text-sm text-red-600">Failed to load PDF: {error}</div>
        ) : ReactPDF ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <ReactPDF.Document file={url} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onDocumentLoadError} loading={null}>
              {numPages
                ? Array.from({ length: numPages }, (_, i) => i + 1).map((pageNumber) => (
                    <ReactPDF.Page
                      key={pageNumber}
                      pageNumber={pageNumber}
                      scale={scale}
                      loading={null}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  ))
                : null}
            </ReactPDF.Document>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse text-sm text-gray-500">Loading viewer…</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
