"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-6 mt-8 first:mt-0 text-3xl font-extrabold tracking-tight bg-linear-to-r from-[#0066ff] via-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-4 mt-8 text-2xl font-bold tracking-tight text-slate-800 dark:text-white/90 border-b border-slate-200/60 dark:border-white/[0.06] pb-2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-3 mt-6 text-lg font-semibold text-slate-700 dark:text-white/80">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-white/60">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 ml-4 list-disc space-y-1.5 text-sm text-slate-600 dark:text-white/60">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 ml-4 list-decimal space-y-1.5 text-sm text-slate-600 dark:text-white/60">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-4 border-[#00d4ff]/40 bg-[#00d4ff]/5 dark:bg-[#00d4ff]/10 pl-4 py-3 rounded-r-lg text-sm italic text-slate-600 dark:text-white/60">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className="block overflow-x-auto rounded-lg border border-slate-200/60 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] p-4 text-xs leading-relaxed font-mono text-slate-700 dark:text-white/70">
          {children}
        </code>
      );
    }
    return (
      <code className="rounded-md bg-slate-100 dark:bg-white/[0.06] px-1.5 py-0.5 text-xs font-mono text-[#0066ff] dark:text-[#00d4ff]">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-4">{children}</pre>
  ),
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto rounded-lg border border-slate-200/60 dark:border-white/[0.06]">
      <table className="w-full text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-slate-50 dark:bg-white/[0.02] text-xs font-semibold text-slate-500 dark:text-white/50">
      {children}
    </thead>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-t border-slate-200/60 dark:border-white/[0.04] px-4 py-2.5 text-slate-600 dark:text-white/60">
      {children}
    </td>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-800 dark:text-white/90">
      {children}
    </strong>
  ),
  hr: () => (
    <hr className="my-6 border-slate-200/60 dark:border-white/[0.06]" />
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#0066ff] dark:text-[#00d4ff] underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  ),
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose-custom">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
