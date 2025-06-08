import React from 'react';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, className = '' }) => {
  const formatText = (text: string): JSX.Element[] => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    
    lines.forEach((line, index) => {
      if (line.trim() === '') {
        elements.push(<br key={`br-${index}`} />);
        return;
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-sm font-semibold text-gray-900 mt-3 mb-1">
            {formatInlineText(line.substring(4))}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-base font-bold text-gray-900 mt-4 mb-2">
            {formatInlineText(line.substring(3))}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-lg font-bold text-gray-900 mt-4 mb-2">
            {formatInlineText(line.substring(2))}
          </h1>
        );
      }
      // List items
      else if (line.startsWith('• ') || line.startsWith('- ')) {
        elements.push(
          <div key={index} className="flex items-start ml-2 mb-1">
            <span className="text-red-700 mr-2 text-xs mt-1">•</span>
            <span className="text-sm">{formatInlineText(line.substring(2))}</span>
          </div>
        );
      }
      // Numbered lists
      else if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+)\.\s(.*)$/);
        if (match) {
          elements.push(
            <div key={index} className="flex items-start ml-2 mb-1">
              <span className="text-red-700 mr-2 text-xs mt-1 font-medium">{match[1]}.</span>
              <span className="text-sm">{formatInlineText(match[2])}</span>
            </div>
          );
        }
      }
      // Regular paragraphs
      else {
        elements.push(
          <p key={index} className="text-sm mb-2">
            {formatInlineText(line)}
          </p>
        );
      }
    });

    return elements;
  };

  const formatInlineText = (text: string): React.ReactNode => {
    // Handle links first [text](url)
    let processed = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
      return `<link>${linkText}|${url}</link>`;
    });

    // Split by bold and italic markers
    const parts = processed.split(/(\*\*[^*]+\*\*|\*[^*]+\*|<link>[^<]+<\/link>)/);
    
    return parts.map((part, index) => {
      // Bold text
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Italic text
      else if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={index} className="italic text-gray-700">
            {part.slice(1, -1)}
          </em>
        );
      }
      // Links
      else if (part.startsWith('<link>') && part.endsWith('</link>')) {
        const linkContent = part.slice(6, -7);
        const [linkText, url] = linkContent.split('|');
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-700 hover:text-red-900 underline"
          >
            {linkText}
          </a>
        );
      }
      // Regular text
      else {
        return <span key={index}>{part}</span>;
      }
    });
  };

  return (
    <div className={className}>
      {formatText(content)}
    </div>
  );
}; 