import { Anchor, Code, List, Stack, Text } from "@mantine/core";
import Link from "next/link";
import type { ReactNode } from "react";
import { classifyHref, type JennaInline, parseJennaMarkdown } from "./jenna-markdown.logic";

/** Link aman: path internal lewat `next/link`, `https:` di tab baru; selain itu hanya label. Warna ink kaca room, garis bawah permanen. */
export function JennaLink({ href, children }: { href: string; children: ReactNode }) {
  const kind = classifyHref(href);
  if (kind === "internal") {
    return (
      <Anchor component={Link} href={href} c="var(--jenna-glass-ink)" td="underline" inherit>
        {children}
      </Anchor>
    );
  }
  if (kind === "external") {
    return (
      <Anchor href={href} target="_blank" rel="noopener noreferrer" c="var(--jenna-glass-ink)" td="underline" inherit>
        {children}
      </Anchor>
    );
  }
  return <>{children}</>;
}

function renderInline(nodes: JennaInline[]): ReactNode[] {
  return nodes.map((node, i) => {
    switch (node.type) {
      case "text":
        return node.value;
      case "code":
        return <Code key={i}>{node.value}</Code>;
      case "strong":
        return <strong key={i}>{renderInline(node.children)}</strong>;
      case "em":
        return <em key={i}>{renderInline(node.children)}</em>;
      case "link":
        return (
          <JennaLink key={i} href={node.href}>
            {renderInline(node.children)}
          </JennaLink>
        );
    }
  });
}

export function JennaMarkdown({ text }: { text: string }) {
  const blocks = parseJennaMarkdown(text);
  return (
    <Stack gap={6} style={{ overflowWrap: "anywhere" }}>
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <Text key={i} fz="sm" fw={700}>
              {renderInline(block.children)}
            </Text>
          );
        }
        if (block.type === "list") {
          return (
            <List
              key={i}
              type={block.ordered ? "ordered" : "unordered"}
              start={block.ordered ? block.start : undefined}
              fz="sm"
              spacing={2}
              withPadding
            >
              {block.items.map((item, j) => (
                <List.Item key={j}>{renderInline(item)}</List.Item>
              ))}
            </List>
          );
        }
        return (
          <Text key={i} fz="sm" lh={1.55}>
            {block.lines.map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {renderInline(line)}
              </span>
            ))}
          </Text>
        );
      })}
    </Stack>
  );
}
