import React from 'react';

interface FormattedInstructionsProps {
  content: string;
}

export const FormattedInstructions: React.FC<FormattedInstructionsProps> = ({ content }) => {
  const formatContent = (text: string) => {
    // First, let's try a completely different approach
    // Split by lines and process each line individually
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    
    lines.forEach((line, index) => {
      // Check for YouTube links in any line - simple and direct
      const youtubeMatch = line.match(/\[([^\]]+)\]\((https:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+|https:\/\/youtu\.be\/[\w-]+)\)/);
      
      if (youtubeMatch) {
        const [, title, url] = youtubeMatch;
        let videoId = '';
        
        if (url.includes('youtube.com')) {
          const urlParams = new URLSearchParams(new URL(url).search);
          videoId = urlParams.get('v') || '';
        } else if (url.includes('youtu.be')) {
          videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
        }
        
        elements.push(
          <div key={index} className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              🎬 {title}
            </h4>
            {videoId ? (
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
            ) : (
              <p className="text-red-500">Could not extract video ID from: {url}</p>
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
      } else if (line.startsWith('##')) {
        // Handle headers
        const headerLevel = line.match(/^#+/)?.[0].length || 2;
        const headerText = line.replace(/^#+\s*/, '');
        const HeaderComponent = headerLevel === 2 ? 'h2' : headerLevel === 3 ? 'h3' : 'h4';
        const headerClasses = {
          h2: 'text-2xl font-bold text-gray-900 mb-4 mt-8 first:mt-0',
          h3: 'text-xl font-semibold text-gray-800 mb-3 mt-6',
          h4: 'text-lg font-medium text-gray-700 mb-2 mt-4'
        };
        
        elements.push(
          <HeaderComponent key={index} className={headerClasses[HeaderComponent as keyof typeof headerClasses]}>
            {headerText}
          </HeaderComponent>
        );
      } else if (line.trim() === '') {
        // Empty line
        elements.push(<br key={index} />);
      } else {
        // Regular line - format inline content
        elements.push(
          <p key={index} className="mb-2 text-gray-700 leading-relaxed">
            {formatInlineContent(line)}
          </p>
        );
      }
    });
    
    return elements;
  };
  
  const formatInlineContent = (text: string) => {
    // Format bold text
    let formatted = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
    
    // Format inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">$1</code>');
    
    // Format regular links (but not YouTube - those are handled separately)
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return `<a href="${url}" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }
      return `<a href="${url}" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
    });
    
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };



  return (
    <div className="formatted-instructions">
      {formatContent(content)}
    </div>
  );
}; 