/**
 * Document Processing Utility for RAG
 * 
 * This utility handles processing uploaded files for RAG context
 * It extracts text content, estimates token counts, and formats document metadata
 */

import { estimateTokenCount } from './tokenCounter';
import type { DocumentContext } from './tokenCounter';

/**
 * Process a file for RAG context
 * @param file The uploaded file
 * @param content The file content as string
 * @returns A DocumentContext object with metadata and token count
 */
export function processDocumentForRAG(file: File, content: string): DocumentContext {
  // Determine file type
  const fileType = getFileType(file.name);
  
  // Process the content based on file type
  let processedContent = content;
  
  try {
    switch (fileType) {
      case 'json':
        processedContent = formatJSONForRAG(content);
        break;
      case 'csv':
        processedContent = formatCSVForRAG(content);
        break;
      case 'md':
        processedContent = formatMarkdownForRAG(content);
        break;
      case 'xml':
      case 'html':
        processedContent = formatXMLForRAG(content, fileType);
        break;
      case 'code':
        processedContent = formatCodeForRAG(content, file.name);
        break;
      // PDF is already processed by the PDFProcessor
    }
  } catch (error) {
    console.warn(`Error processing ${fileType} file:`, error);
    // If processing fails, use original content
  }
  
  // Count tokens in the processed content
  const tokenCount = estimateTokenCount(processedContent);
  
  // Create document context object
  const document: DocumentContext = {
    type: fileType,
    name: file.name,
    content: processedContent,
    tokenCount,
    size: file.size,
    uploadedAt: new Date()
  };
  
  return document;
}

/**
 * Determine file type from filename
 */
function getFileType(filename: string): DocumentContext['type'] {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  // Map extensions to document types
  const extensionMap: Record<string, DocumentContext['type']> = {
    'pdf': 'pdf',
    'md': 'md',
    'markdown': 'md',
    'csv': 'csv',
    'json': 'json',
    'xml': 'xml',
    'html': 'html',
    'htm': 'html',
    'txt': 'txt',
    // Code file types
    'js': 'code',
    'ts': 'code',
    'jsx': 'code',
    'tsx': 'code',
    'py': 'code',
    'java': 'code',
    'c': 'code',
    'cpp': 'code',
    'cs': 'code',
    'go': 'code',
    'rb': 'code',
    // Binary formats (placeholder)
    'docx': 'binary',
    'doc': 'binary',
    'xlsx': 'binary',
    'xls': 'binary',
    'pptx': 'binary',
    'ppt': 'binary'
  };
  
  return extensionMap[extension] || 'txt';
}

/**
 * Format JSON data for better RAG processing
 */
function formatJSONForRAG(jsonContent: string): string {
  try {
    // Parse and pretty-print JSON
    const jsonObj = JSON.parse(jsonContent);
    
    // Generate a structure summary
    const summary = getJSONStructureSummary(jsonObj);
    
    // Pretty print the JSON with indentation
    const prettyJson = JSON.stringify(jsonObj, null, 2);
    
    // Combine summary with content
    return `# JSON Document Structure:\n${summary}\n\n# JSON Content:\n\`\`\`json\n${prettyJson}\n\`\`\``;
  } catch (error) {
    console.warn('Error processing JSON:', error);
    return jsonContent;
  }
}

/**
 * Generate a summary of JSON structure
 */
function getJSONStructureSummary(json: any, depth = 0): string {
  if (depth > 2) return "..."; // Limit recursion depth
  
  if (Array.isArray(json)) {
    if (json.length === 0) return "[]";
    
    const sampleItem = json[0];
    if (typeof sampleItem === 'object' && sampleItem !== null) {
      return `Array(${json.length}) of Objects: [\n  ${getJSONStructureSummary(sampleItem, depth + 1)}\n]`;
    } else {
      return `Array(${json.length}) of ${typeof sampleItem}`;
    }
  } else if (typeof json === 'object' && json !== null) {
    const keys = Object.keys(json);
    if (keys.length === 0) return "{}";
    
    return `Object with keys: {\n  ${keys.join(',\n  ')}\n}`;
  } else {
    return typeof json;
  }
}

/**
 * Format CSV data for better RAG processing
 */
function formatCSVForRAG(csvContent: string): string {
  // Split into lines
  const lines = csvContent.trim().split('\n');
  
  if (lines.length === 0) {
    return csvContent;
  }
  
  // Extract headers
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Build a more structured format
  let result = `# CSV Data: ${lines.length - 1} rows, ${headers.length} columns\n\n`;
  result += `## Headers\n${headers.join(', ')}\n\n`;
  
  // If the file is too large, just include a summary
  if (lines.length > 50) {
    // Add first 10 rows
    result += `## First 10 rows\n`;
    for (let i = 1; i <= Math.min(10, lines.length - 1); i++) {
      const row = lines[i].split(',').map(cell => cell.trim());
      result += formatCSVRow(headers, row) + '\n';
    }
    
    result += `\n## Summary\nTotal Rows: ${lines.length - 1}\n`;
    
    // Add last 5 rows
    result += `\n## Last 5 rows\n`;
    for (let i = Math.max(lines.length - 5, 1); i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.trim());
      result += formatCSVRow(headers, row) + '\n';
    }
  } else {
    // Include all rows for smaller files
    result += `## Data\n`;
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.trim());
      result += formatCSVRow(headers, row) + '\n';
    }
  }
  
  return result;
}

/**
 * Format a CSV row for better readability
 */
function formatCSVRow(headers: string[], row: string[]): string {
  let result = '';
  for (let i = 0; i < headers.length && i < row.length; i++) {
    result += `${headers[i]}: ${row[i]}; `;
  }
  return result.trim();
}

/**
 * Format Markdown for RAG
 */
function formatMarkdownForRAG(mdContent: string): string {
  // Extract headings to create a table of contents
  const headings = mdContent.match(/^#+\s+.+$/gm) || [];
  
  if (headings.length === 0) {
    return mdContent;
  }
  
  const toc = headings.map(heading => {
    const level = heading.match(/^#+/)?.[0].length || 1;
    const text = heading.replace(/^#+\s+/, '');
    return `${' '.repeat((level - 1) * 2)}- ${text}`;
  }).join('\n');
  
  return `# Document Structure\n\n${toc}\n\n# Content\n\n${mdContent}`;
}

/**
 * Format XML/HTML for RAG
 */
function formatXMLForRAG(xmlContent: string, type: 'xml' | 'html'): string {
  // For HTML, try to extract the text content
  if (type === 'html') {
    // Simple HTML text extraction (not perfect but helps)
    const textContent = xmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // Remove styles
      .replace(/<[^>]+>/g, ' ')  // Remove tags
      .replace(/\s+/g, ' ')      // Normalize whitespace
      .trim();
    
    // Extract title
    const titleMatch = xmlContent.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : 'HTML Document';
    
    return `# ${title}\n\n${textContent}`;
  }
  
  // For XML, keep as is but add a structure comment
  return `# XML Document\n\n\`\`\`xml\n${xmlContent}\n\`\`\``;
}

/**
 * Format code files for RAG
 */
function formatCodeForRAG(codeContent: string, filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  // Detect language from extension
  let language = 'text';
  switch (extension) {
    case 'js':
    case 'jsx':
      language = 'javascript';
      break;
    case 'ts':
    case 'tsx':
      language = 'typescript';
      break;
    case 'py':
      language = 'python';
      break;
    case 'java':
      language = 'java';
      break;
    case 'c':
    case 'cpp':
      language = 'c++';
      break;
    case 'cs':
      language = 'csharp';
      break;
    case 'go':
      language = 'go';
      break;
    case 'rb':
      language = 'ruby';
      break;
  }
  
  // Format code file
  return `# Source Code: ${filename}\n\n\`\`\`${language}\n${codeContent}\n\`\`\``;
}

export default processDocumentForRAG; 