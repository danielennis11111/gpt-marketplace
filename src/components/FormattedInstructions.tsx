import React from 'react';

interface FormattedInstructionsProps {
  content: string;
}

export const FormattedInstructions: React.FC<FormattedInstructionsProps> = ({ content }) => {
  const formatContent = (text: string) => {
    // Split content by double newlines to get paragraphs/sections
    const sections = text.split('\n\n');
    
    return sections.map((section, index) => {
      const lines = section.split('\n');
      
      // Check if this is a header (starts with ##, ###, etc.)
      if (lines[0].startsWith('##')) {
        const headerLevel = lines[0].match(/^#+/)?.[0].length || 2;
        const headerText = lines[0].replace(/^#+\s*/, '');
        const remainingContent = lines.slice(1).join('\n');
        
        const HeaderComponent = headerLevel === 2 ? 'h2' : headerLevel === 3 ? 'h3' : 'h4';
        const headerClasses = {
          h2: 'text-2xl font-bold text-gray-900 mb-4 mt-8 first:mt-0',
          h3: 'text-xl font-semibold text-gray-800 mb-3 mt-6',
          h4: 'text-lg font-medium text-gray-700 mb-2 mt-4'
        };
        
        return (
          <div key={index}>
            <HeaderComponent className={headerClasses[HeaderComponent as keyof typeof headerClasses]}>
              {headerText}
            </HeaderComponent>
            {remainingContent && (
              <div className="mb-4">
                {formatContent(remainingContent)}
              </div>
            )}
          </div>
        );
      }
      
      // Check if this is a code block
      if (section.includes('```')) {
        return (
          <div key={index} className="mb-6">
            {section.split('```').map((part, partIndex) => {
              if (partIndex % 2 === 1) {
                // This is inside code block
                const lines = part.split('\n');
                const language = lines[0].trim();
                const code = lines.slice(1).join('\n').trim();
                
                return (
                  <div key={partIndex} className="my-4">
                    {language && (
                      <div className="bg-gray-800 text-gray-300 px-4 py-2 text-sm font-mono rounded-t-lg">
                        {language}
                      </div>
                    )}
                    <pre className={`bg-gray-900 text-green-400 p-4 ${language ? 'rounded-b-lg' : 'rounded-lg'} overflow-x-auto`}>
                      <code className="text-sm font-mono">{code}</code>
                    </pre>
                  </div>
                );
              } else {
                // Regular content
                return part.trim() ? (
                  <div key={partIndex} className="prose max-w-none">
                    {formatTextContent(part)}
                  </div>
                ) : null;
              }
            })}
          </div>
        );
      }
      
      // Check if this is a list
      if (lines.some(line => line.match(/^[\d\-\*\+]\s/) || line.match(/^✅|❌|⚡|🔧|📝|💡|🎯|🚀|📊|🛡️|🎬|📋/))) {
        return (
          <div key={index} className="mb-6">
            {formatListContent(lines)}
          </div>
        );
      }
      
      // Check if this is a YouTube video section
      if (section.includes('youtube.com') || section.includes('youtu.be')) {
        return (
          <div key={index} className="mb-8">
            {formatVideoContent(section)}
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <div key={index} className="mb-4 text-gray-700 leading-relaxed">
          {formatTextContent(section)}
        </div>
      );
    });
  };

  const formatTextContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.trim() === '') return <br key={index} />;
      
      // Check if this line contains a YouTube link that should be embedded
      const youtubeMatch = line.match(/###?\s*🎯?\s*\[([^\]]+)\]\((https:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+|https:\/\/youtu\.be\/[\w-]+)\)/);
      
      if (youtubeMatch) {
        const [, title, url] = youtubeMatch;
        let videoId = '';
        
        if (url.includes('youtube.com')) {
          const urlParams = new URLSearchParams(new URL(url).search);
          videoId = urlParams.get('v') || '';
        } else if (url.includes('youtu.be')) {
          videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
        }
        
        return (
          <div key={index} className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              🎬 {title}
            </h4>
            {videoId && (
              <div className="mb-3 relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
            )}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              📺 Watch on YouTube
            </a>
          </div>
        );
      }
      
      // Format inline code
      let formattedLine = line.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">$1</code>');
      
      // Format bold text
      formattedLine = formattedLine.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
      
      // Format links (excluding YouTube links which are handled above)
      formattedLine = formattedLine.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          return match; // Don't format YouTube links as regular links
        }
        return `<a href="${url}" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
      });
      
      return (
        <span key={index} dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    });
  };

  const formatListContent = (lines: string[]) => {
    const listItems: JSX.Element[] = [];
    let currentItem = '';
    let isOrderedList = false;
    
    lines.forEach((line, index) => {
      if (line.match(/^\d+\.\s/)) {
        isOrderedList = true;
        if (currentItem) {
          listItems.push(
            <li key={listItems.length} className="mb-2 text-gray-700 leading-relaxed">
              {formatTextContent(currentItem.replace(/^[\d\-\*\+]\s/, '').trim())}
            </li>
          );
        }
        currentItem = line;
      } else if (line.match(/^[\-\*\+]\s/) || line.match(/^✅|❌|⚡|🔧|📝|💡|🎯|🚀|📊|🛡️|🎬|📋/)) {
        if (currentItem) {
          listItems.push(
            <li key={listItems.length} className="mb-2 text-gray-700 leading-relaxed flex items-start">
              {line.match(/^✅|❌|⚡|🔧|📝|💡|🎯|🚀|📊|🛡️|🎬|📋/) && (
                <span className="mr-2 mt-0.5 text-lg">{line.match(/^✅|❌|⚡|🔧|📝|💡|🎯|🚀|📊|🛡️|🎬|📋/)?.[0]}</span>
              )}
              <span>{formatTextContent(currentItem.replace(/^[\-\*\+]\s|^✅|❌|⚡|🔧|📝|💡|🎯|🚀|📊|🛡️|🎬|📋\s*/, '').trim())}</span>
            </li>
          );
        }
        currentItem = line;
      } else if (line.trim() && currentItem) {
        currentItem += '\n' + line;
      }
    });
    
    // Add the last item
    if (currentItem) {
      const emojiMatch = currentItem.match(/^✅|❌|⚡|🔧|📝|💡|🎯|🚀|📊|🛡️|🎬|📋/);
      listItems.push(
        <li key={listItems.length} className="mb-2 text-gray-700 leading-relaxed flex items-start">
          {emojiMatch && (
            <span className="mr-2 mt-0.5 text-lg">{emojiMatch[0]}</span>
          )}
          <span>{formatTextContent(currentItem.replace(/^[\d\-\*\+]\s|^✅|❌|⚡|🔧|📝|💡|🎯|🚀|📊|🛡️|🎬|📋\s*/, '').trim())}</span>
        </li>
      );
    }
    
    const ListComponent = isOrderedList ? 'ol' : 'ul';
    const listClasses = isOrderedList ? 'list-decimal list-inside' : 'list-none';
    
    return (
      <ListComponent className={listClasses}>
        {listItems}
      </ListComponent>
    );
  };

  const formatVideoContent = (content: string) => {
    const lines = content.split('\n');
    const videoElements: JSX.Element[] = [];
    
    lines.forEach((line, index) => {
      // Check for YouTube links with titles - more flexible pattern
      const youtubeMatch = line.match(/###?\s*🎯?\s*\[([^\]]+)\]\((https:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+|https:\/\/youtu\.be\/[\w-]+)\)/);
      
      if (youtubeMatch) {
        const [, title, url] = youtubeMatch;
        let videoId = '';
        
        if (url.includes('youtube.com')) {
          const urlParams = new URLSearchParams(new URL(url).search);
          videoId = urlParams.get('v') || '';
        } else if (url.includes('youtu.be')) {
          videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
        }
        
        videoElements.push(
          <div key={index} className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              🎬 {title}
            </h4>
            {videoId && (
              <div className="mb-3 relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
            )}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              📺 Watch on YouTube
            </a>
          </div>
        );
      } else if (line.match(/^\*[^*]/) && !line.includes('youtube.com') && !line.includes('youtu.be')) {
        // Description line after video (but not containing YouTube links)
        videoElements.push(
          <p key={index} className="text-gray-600 italic text-sm mb-4">
            {line.replace(/^\*\s*/, '')}
          </p>
        );
      } else if (line.trim() && !youtubeMatch) {
        // Regular text content that should be formatted normally
        videoElements.push(
          <div key={index} className="mb-4 text-gray-700 leading-relaxed">
            {formatTextContent(line)}
          </div>
        );
      }
    });
    
    return videoElements.length > 0 ? videoElements : <div className="text-gray-700">{formatTextContent(content)}</div>;
  };

  return (
    <div className="formatted-instructions">
      {formatContent(content)}
    </div>
  );
}; 