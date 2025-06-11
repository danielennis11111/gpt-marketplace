/**
 * Utility functions for downloading files from AI responses
 */

export interface DownloadOptions {
  filename: string;
  mimeType?: string;
  addTimestamp?: boolean;
}

/**
 * Download text content as a file
 */
export const downloadTextFile = (content: string, options: DownloadOptions) => {
  const { filename, mimeType = 'text/plain', addTimestamp = false } = options;
  
  // Add timestamp to filename if requested
  const finalFilename = addTimestamp 
    ? `${filename.replace(/\.[^/.]+$/, '')}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${filename.split('.').pop()}`
    : filename;
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
};

/**
 * Download JSON data as a file
 */
export const downloadJsonFile = (data: any, filename: string, addTimestamp = false) => {
  const content = JSON.stringify(data, null, 2);
  downloadTextFile(content, {
    filename: filename.endsWith('.json') ? filename : `${filename}.json`,
    mimeType: 'application/json',
    addTimestamp
  });
};

/**
 * Convert data to CSV format and download
 */
export const downloadCsvFile = (data: any[], filename: string, addTimestamp = false) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('CSV data must be a non-empty array');
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values with commas, quotes, or newlines
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  downloadTextFile(csvContent, {
    filename: filename.endsWith('.csv') ? filename : `${filename}.csv`,
    mimeType: 'text/csv',
    addTimestamp
  });
};

/**
 * Parse text content and attempt to convert to structured data
 */
export const parseContentForStructuredDownload = (content: string): { 
  data: any[], 
  type: 'table' | 'list' | 'text',
  preview: string 
} => {
  // Try to detect table data (markdown tables, tab-separated, etc.)
  const lines = content.split('\n').filter(line => line.trim());
  
  // Check for markdown table
  if (lines.some(line => line.includes('|'))) {
    const tableLines = lines.filter(line => line.includes('|') && !line.match(/^\|[\s\-:]+\|$/));
    if (tableLines.length > 1) {
      const headers = tableLines[0].split('|').map(h => h.trim()).filter(h => h);
      const rows = tableLines.slice(1).map(line => {
        const cells = line.split('|').map(c => c.trim()).filter(c => c);
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = cells[index] || '';
        });
        return row;
      });
      
      return {
        data: rows,
        type: 'table',
        preview: `Table with ${rows.length} rows and ${headers.length} columns:\n${headers.join(', ')}`
      };
    }
  }
  
  // Check for list data (numbered or bulleted)
  const listItems = lines.filter(line => 
    line.match(/^\s*[-*•]\s+/) || 
    line.match(/^\s*\d+\.\s+/) ||
    line.match(/^\s*\w+:\s*/)
  );
  
  if (listItems.length > 2) {
    const data = listItems.map((item, index) => ({
      id: index + 1,
      content: item.replace(/^\s*[-*•]\s*/, '').replace(/^\s*\d+\.\s*/, '').trim(),
      original: item.trim()
    }));
    
    return {
      data,
      type: 'list',
      preview: `List with ${data.length} items:\n${data.slice(0, 3).map(d => `• ${d.content}`).join('\n')}${data.length > 3 ? '\n...' : ''}`
    };
  }
  
  return {
    data: [{ content }],
    type: 'text',
    preview: content.length > 200 ? content.substring(0, 200) + '...' : content
  };
};

/**
 * Extract and prepare code blocks for download
 */
export const extractCodeBlocks = (content: string): Array<{ language: string; code: string; filename: string }> => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
  const blocks: Array<{ language: string; code: string; filename: string }> = [];
  let match;
  let blockIndex = 1;
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const language = match[1] || 'text';
    const code = match[2];
    
    // Determine file extension based on language
    const extension = getFileExtension(language);
    const filename = `code_block_${blockIndex}.${extension}`;
    
    blocks.push({
      language,
      code,
      filename
    });
    
    blockIndex++;
  }
  
  return blocks;
};

/**
 * Get appropriate file extension for a programming language
 */
const getFileExtension = (language: string): string => {
  const extensions: Record<string, string> = {
    javascript: 'js',
    js: 'js',
    typescript: 'ts',
    ts: 'ts',
    tsx: 'tsx',
    jsx: 'jsx',
    python: 'py',
    py: 'py',
    java: 'java',
    cpp: 'cpp',
    'c++': 'cpp',
    c: 'c',
    csharp: 'cs',
    'c#': 'cs',
    php: 'php',
    ruby: 'rb',
    rb: 'rb',
    go: 'go',
    rust: 'rs',
    rs: 'rs',
    kotlin: 'kt',
    kt: 'kt',
    swift: 'swift',
    html: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',
    sql: 'sql',
    bash: 'sh',
    shell: 'sh',
    sh: 'sh',
    zsh: 'zsh',
    fish: 'fish',
    powershell: 'ps1',
    ps1: 'ps1',
    yaml: 'yml',
    yml: 'yml',
    json: 'json',
    xml: 'xml',
    markdown: 'md',
    md: 'md',
    dockerfile: 'dockerfile',
    docker: 'dockerfile',
    vim: 'vim',
    lua: 'lua',
    perl: 'pl',
    pl: 'pl',
    r: 'r',
    matlab: 'm',
    tex: 'tex',
    latex: 'tex',
    vue: 'vue',
    svelte: 'svelte',
    dart: 'dart',
    scala: 'scala',
    haskell: 'hs',
    clojure: 'clj',
    elixir: 'ex',
    erlang: 'erl',
    fsharp: 'fs',
    'f#': 'fs',
    nim: 'nim',
    crystal: 'cr',
    zig: 'zig'
  };
  
  return extensions[language.toLowerCase()] || 'txt';
};

/**
 * Get appropriate MIME type for a file extension
 */
export const getMimeType = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    txt: 'text/plain',
    js: 'text/javascript',
    ts: 'text/typescript',
    py: 'text/x-python',
    java: 'text/x-java-source',
    cpp: 'text/x-c++src',
    c: 'text/x-csrc',
    cs: 'text/x-csharp',
    php: 'text/x-php',
    rb: 'text/x-ruby',
    go: 'text/x-go',
    rs: 'text/x-rust',
    kt: 'text/x-kotlin',
    swift: 'text/x-swift',
    html: 'text/html',
    css: 'text/css',
    scss: 'text/x-scss',
    sass: 'text/x-sass',
    sql: 'text/x-sql',
    sh: 'text/x-shellscript',
    ps1: 'text/x-powershell',
    yml: 'text/yaml',
    yaml: 'text/yaml',
    json: 'application/json',
    xml: 'text/xml',
    md: 'text/markdown',
    dockerfile: 'text/x-dockerfile'
  };
  
  return mimeTypes[extension.toLowerCase()] || 'text/plain';
};

/**
 * Download all code blocks from AI response as separate files
 */
export const downloadAllCodeBlocks = (content: string, baseName = 'ai_response') => {
  const codeBlocks = extractCodeBlocks(content);
  
  if (codeBlocks.length === 0) {
    console.warn('No code blocks found in the content');
    return;
  }
  
  codeBlocks.forEach((block, index) => {
    const mimeType = getMimeType(getFileExtension(block.language));
    downloadTextFile(block.code, {
      filename: `${baseName}_${index + 1}.${getFileExtension(block.language)}`,
      mimeType,
      addTimestamp: true
    });
  });
};

/**
 * Check if content contains downloadable code
 */
export const hasDownloadableContent = (content: string): boolean => {
  return extractCodeBlocks(content).length > 0;
};

/**
 * Automatically determine the best format for content
 */
export const detectBestFormat = (content: string): {
  format: string;
  extension: string;
  mimeType: string;
  reason: string;
} => {
  // Check for code blocks
  const codeBlocks = extractCodeBlocks(content);
  if (codeBlocks.length > 0) {
    const primaryLanguage = codeBlocks[0].language;
    const extension = getFileExtension(primaryLanguage);
    return {
      format: 'code',
      extension,
      mimeType: getMimeType(extension),
      reason: `Contains ${primaryLanguage} code`
    };
  }

  // Check for structured data
  const parsed = parseContentForStructuredDownload(content);
  if (parsed.type === 'table') {
    return {
      format: 'csv',
      extension: 'csv',
      mimeType: 'text/csv',
      reason: 'Contains table data'
    };
  }

  if (parsed.type === 'list') {
    return {
      format: 'json',
      extension: 'json',
      mimeType: 'application/json',
      reason: 'Contains structured list data'
    };
  }

  // Check for markdown formatting
  const hasMarkdown = content.includes('##') || 
                     content.includes('**') || 
                     content.includes('*') ||
                     content.includes('```') ||
                     content.includes('[](');
  
  if (hasMarkdown) {
    return {
      format: 'markdown',
      extension: 'md',
      mimeType: 'text/markdown',
      reason: 'Contains markdown formatting'
    };
  }

  // Default to text
  return {
    format: 'text',
    extension: 'txt',
    mimeType: 'text/plain',
    reason: 'Plain text content'
  };
};

/**
 * Smart download that uses the best format for the content
 */
export const smartDownload = (content: string, filename: string, title?: string) => {
  const detected = detectBestFormat(content);
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const finalFilename = `${filename}_${timestamp}.${detected.extension}`;

  console.log(`Smart download: ${detected.reason} -> ${detected.format} (${detected.extension})`);

  switch (detected.format) {
    case 'csv':
      const parsed = parseContentForStructuredDownload(content);
      downloadCsvFile(parsed.data, filename, true);
      break;
    case 'json':
      const parsedList = parseContentForStructuredDownload(content);
      downloadJsonFile(parsedList.data, filename, true);
      break;
    case 'code':
      const codeBlocks = extractCodeBlocks(content);
      if (codeBlocks.length === 1) {
        // Single code block, download as the specific language file
        downloadTextFile(codeBlocks[0].code, {
          filename: finalFilename,
          mimeType: detected.mimeType
        });
      } else {
        // Multiple code blocks, download all
        downloadAllCodeBlocks(content, filename);
      }
      break;
    default:
      downloadTextFile(content, {
        filename: finalFilename,
        mimeType: detected.mimeType
      });
  }
};

/**
 * Download system instructions as a text file
 */
export const downloadInstructions = (instructions: string, title: string) => {
  const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_instructions.txt`;
  downloadTextFile(instructions, {
    filename,
    mimeType: 'text/plain',
    addTimestamp: true
  });
}; 