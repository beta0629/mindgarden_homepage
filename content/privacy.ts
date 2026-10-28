import "server-only";

import fs from "node:fs";
import path from "node:path";

export type InlinePart = {
  text: string;
  strong: boolean;
};

export type PrivacyBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; parts: InlinePart[] }
  | { type: "quote"; parts: InlinePart[] }
  | { type: "list"; ordered: boolean; items: InlinePart[][] }
  | { type: "table"; headers: string[]; rows: string[][] };

export type PrivacyDocument = {
  title: string;
  status: string;
  draft: boolean;
  reviewNote: string;
  effectiveDate: string;
  blocks: PrivacyBlock[];
};

function inline(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ text: text.slice(last, index), strong: false });
    parts.push({ text: match[1] ?? "", strong: true });
    last = index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), strong: false });
  if (parts.length === 0) parts.push({ text, strong: false });
  return parts;
}

function cells(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isDivider(line: string) {
  return /^\|\s*:?-{3,}/.test(line.trim());
}

function parseBlocks(body: string): PrivacyBlock[] {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const blocks: PrivacyBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    const trimmed = line.trim();
    if (!trimmed) {
      index += 1;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      blocks.push({ type: "heading", level: 3, text: trimmed.slice(4) });
      index += 1;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push({ type: "heading", level: 2, text: trimmed.slice(3) });
      index += 1;
      continue;
    }
    if (trimmed.startsWith("> ")) {
      const quote: string[] = [];
      while (index < lines.length && (lines[index] ?? "").trim().startsWith(">")) {
        quote.push((lines[index] ?? "").trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "quote", parts: inline(quote.join(" ")) });
      continue;
    }
    if (trimmed.startsWith("|")) {
      const tableLines: string[] = [];
      while (index < lines.length && (lines[index] ?? "").trim().startsWith("|")) {
        tableLines.push(lines[index] ?? "");
        index += 1;
      }
      const headers = cells(tableLines[0] ?? "");
      const rows = tableLines.filter((row) => !isDivider(row)).slice(1).map(cells);
      blocks.push({ type: "table", headers, rows });
      continue;
    }
    if (/^[-*] /.test(trimmed)) {
      const items: InlinePart[][] = [];
      while (index < lines.length && /^[-*] /.test((lines[index] ?? "").trim())) {
        items.push(inline((lines[index] ?? "").trim().replace(/^[-*] /, "")));
        index += 1;
      }
      blocks.push({ type: "list", ordered: false, items });
      continue;
    }
    if (/^\d+\. /.test(trimmed)) {
      const items: InlinePart[][] = [];
      while (index < lines.length && /^\d+\. /.test((lines[index] ?? "").trim())) {
        items.push(inline((lines[index] ?? "").trim().replace(/^\d+\. /, "")));
        index += 1;
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }
    const paragraph: string[] = [trimmed];
    index += 1;
    while (index < lines.length && (lines[index] ?? "").trim() && !/^(#{1,3} |> |\||[-*] |\d+\. )/.test((lines[index] ?? "").trim())) {
      paragraph.push((lines[index] ?? "").trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", parts: inline(paragraph.join(" ")) });
  }

  return blocks;
}

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {} as Record<string, string>, body: raw };
  const meta: Record<string, string> = {};
  for (const line of (match[1] ?? "").split("\n")) {
    const splitAt = line.indexOf(":");
    if (splitAt === -1) continue;
    const key = line.slice(0, splitAt).trim();
    let value = line.slice(splitAt + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    meta[key] = value;
  }
  return { meta, body: match[2] ?? "" };
}

const raw = fs.readFileSync(path.join(process.cwd(), "content/privacy.md"), "utf8");
const parsed = parseFrontmatter(raw);

export const privacy: PrivacyDocument = {
  title: parsed.meta.title ?? "",
  status: parsed.meta.status ?? "",
  draft: parsed.meta.status === "DRAFT",
  reviewNote: parsed.meta.reviewNote ?? "",
  effectiveDate: parsed.meta.effectiveDate ?? "",
  blocks: parseBlocks(parsed.body ?? ""),
};
