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
  if (fileType === 'json') {
    try {
      // Format JSON for better readability
      const jsonObj = JSON.parse(content);
      processedContent = JSON.stringify(jsonObj, null, 2);
    } catch (error) {
      console.warn('Error processing JSON file:', error);
    }
  } else if (fileType === 'csv') {
    // Convert CSV to a more structured format for LLM
    processedContent = formatCSVForRAG(content);
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
function getFileType(filename: string): 'txt' | 'pdf' | 'md' | 'csv' | 'json' {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'pdf';
    case 'md':
      return 'md';
    case 'csv':
      return 'csv';
    case 'json':
      return 'json';
    default:
      return 'txt';
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

export default processDocumentForRAG; 