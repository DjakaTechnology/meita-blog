"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TableExpander() {
  const [open, setOpen] = useState(false);
  const [tableHtml, setTableHtml] = useState("");

  useEffect(() => {
    const blogContent = document.querySelector(".blog-content");
    if (!blogContent) return;

    // Clean up any previous wrappers (React strict mode)
    blogContent.querySelectorAll(".table-expand-btn").forEach((btn) => btn.remove());
    blogContent.querySelectorAll(".table-container").forEach((wrapper) => {
      const table = wrapper.querySelector("table");
      if (table) wrapper.parentNode?.insertBefore(table, wrapper);
      wrapper.remove();
    });

    const tables = blogContent.querySelectorAll("table");
    const wrappers: HTMLDivElement[] = [];

    tables.forEach((table) => {
      const wrapper = document.createElement("div");
      wrapper.className = "table-container";
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
      wrappers.push(wrapper);
    });

    return () => {
      wrappers.forEach((wrapper) => {
        const btn = wrapper.querySelector(".table-expand-btn");
        btn?.remove();
        const table = wrapper.querySelector("table");
        if (table) wrapper.parentNode?.insertBefore(table, wrapper);
        wrapper.remove();
      });
    };
  }, []);

  return (
    <>
      <style>{`
        .table-container { position: relative; }
        .table-expand-btn { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; font-weight: 500; color: var(--muted-foreground); background: var(--muted); border: 1px solid var(--border); border-radius: 0.375rem; padding: 0.35rem 0.625rem; cursor: pointer; margin-top: 0.5rem; margin-left: auto; width: fit-content; transition: color 0.15s, border-color 0.15s; }
        .table-expand-btn:hover { color: var(--foreground); border-color: var(--foreground); }
      `}</style>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Table View</DialogTitle>
          </DialogHeader>
          <div
            className="blog-content overflow-auto"
            dangerouslySetInnerHTML={{ __html: tableHtml }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
