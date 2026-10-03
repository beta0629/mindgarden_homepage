import type { InlinePart, PrivacyBlock } from "@/content/privacy";

function Rich({ parts }: { parts: InlinePart[] }) {
  return parts.map((part, index) =>
    part.strong ? <strong key={index}>{part.text}</strong> : <span key={index}>{part.text}</span>,
  );
}

export function PrivacyBody({ blocks }: { blocks: PrivacyBlock[] }) {
  return (
    <div className="policy">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Tag = block.level === 2 ? "h2" : "h3";
          return <Tag key={index}>{block.text}</Tag>;
        }
        if (block.type === "quote") {
          return (
            <blockquote key={index}>
              <Rich parts={block.parts} />
            </blockquote>
          );
        }
        if (block.type === "paragraph") {
          return (
            <p key={index}>
              <Rich parts={block.parts} />
            </p>
          );
        }
        if (block.type === "list") {
          const Tag = block.ordered ? "ol" : "ul";
          return (
            <Tag key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <Rich parts={item} />
                </li>
              ))}
            </Tag>
          );
        }
        return (
          <table key={index}>
            <thead>
              <tr>
                {block.headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      })}
    </div>
  );
}
