"use client";
import { useEffect, useState, useRef } from "react";

export default function TableExpander() {
  const [open, setOpen] = useState(false);
  const [tableHtml, setTableHtml] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const blogContent = document.querySelector(".blog-content");
    if (!blogContent) return;
    const tables = blogContent.querySelectorAll("table");
    tables.forEach((table) => {
      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      const btn = document.createElement("button");
      btn.className = "table-expand-btn";
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg> Expand`;
      btn.onclick = () => {
        const clone = table.cloneNode(true) as HTMLElement;
        clone.style.display = "table";
        clone.style.width = "100%";
        clone.style.margin = "0";
        setTableHtml(clone.outerHTML);
        setOpen(true);
      };
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
      wrapper.appendChild(btn);
    });
  }, []);

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  return (
    <>
      <style>{`
        .table-expand-btn { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; font-weight: 500; color: var(--muted-foreground); background: var(--muted); border: 1px solid var(--border); border-radius: 0.375rem; padding: 0.35rem 0.625rem; cursor: pointer; margin-top: 0.5rem; margin-left: auto; width: fit-content; transition: color 0.15s, border-color 0.15s; }
        .table-expand-btn:hover { color: var(--foreground); border-color: var(--foreground); }
      `}</style>
      <dialog ref={dialogRef} className="fixed inset-0 w-[95vw] max-h-[80vh] overflow-auto rounded-lg border border-border bg-card p-6 backdrop:bg-black/50" onClick={(e) => { if (e.target === dialogRef.current) setOpen(false); }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Table View</h2>
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="blog-content overflow-auto" dangerouslySetInnerHTML={{ __html: tableHtml }} />
      </dialog>
    </>
  );
}
