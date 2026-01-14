import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

// Set worker path for pdf.js - must match installed version (4.10.38)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;

/**
 * Extract text from a PDF file
 */
export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');
      fullText += pageText + ' ';
    }

    return fullText;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF. Please try a different file.');
  }
}

/**
 * Extract text from an EPUB file
 */
export async function extractTextFromEPUB(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Find the container.xml to get the OPF file path
    const containerXml = await zip.file('META-INF/container.xml')?.async('text');
    if (!containerXml) {
      throw new Error('Invalid EPUB: missing container.xml');
    }

    // Parse container.xml to find OPF path
    const opfPathMatch = containerXml.match(/full-path="([^"]+)"/);
    if (!opfPathMatch) {
      throw new Error('Invalid EPUB: cannot find OPF path');
    }

    const opfPath = opfPathMatch[1];
    const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);

    // Read the OPF file
    const opfContent = await zip.file(opfPath)?.async('text');
    if (!opfContent) {
      throw new Error('Invalid EPUB: missing OPF file');
    }

    // Parse manifest to get all content files
    const manifest = {};
    const manifestRegex = /<item[^>]*id="([^"]*)"[^>]*href="([^"]*)"[^>]*media-type="([^"]*)"[^>]*\/?>/g;
    let match;
    while ((match = manifestRegex.exec(opfContent)) !== null) {
      manifest[match[1]] = {
        href: match[2],
        mediaType: match[3]
      };
    }

    // Parse spine to get reading order
    const spineRegex = /<itemref[^>]*idref="([^"]*)"[^>]*\/?>/g;
    const spineOrder = [];
    while ((match = spineRegex.exec(opfContent)) !== null) {
      spineOrder.push(match[1]);
    }

    // Extract text from each content file in spine order
    let fullText = '';

    for (const itemId of spineOrder) {
      const item = manifest[itemId];
      if (!item) continue;

      // Only process HTML/XHTML files
      if (!item.mediaType.includes('html') && !item.mediaType.includes('xml')) {
        continue;
      }

      const filePath = opfDir + item.href;
      const content = await zip.file(filePath)?.async('text');

      if (content) {
        // Extract text from HTML
        const textContent = extractTextFromHTML(content);
        fullText += textContent + ' ';
      }
    }

    return fullText;
  } catch (error) {
    console.error('EPUB parsing error:', error);
    throw new Error('Failed to parse EPUB. Please try a different file.');
  }
}

/**
 * Extract plain text from HTML content
 */
function extractTextFromHTML(html) {
  // Remove scripts, styles, and other non-content elements
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Add space before block elements to preserve word boundaries
  text = text.replace(/<(p|div|br|h[1-6]|li|tr|td|th)[^>]*>/gi, ' ');

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code))
    .replace(/&[a-z]+;/gi, ' ');

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Extract text from a plain text file
 */
export async function extractTextFromTxt(file) {
  return await file.text();
}

/**
 * Parse text into an array of words
 */
export function parseTextToWords(text) {
  if (!text) return [];

  return text
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .trim()
    .split(' ')
    .filter(word => word.length > 0);
}

/**
 * Extract text from a file based on its type
 */
export async function extractTextFromFile(file) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.pdf')) {
    return await extractTextFromPDF(file);
  } else if (fileName.endsWith('.epub')) {
    return await extractTextFromEPUB(file);
  } else if (fileName.endsWith('.txt')) {
    return await extractTextFromTxt(file);
  } else {
    // Try to read as text
    return await file.text();
  }
}

/**
 * Format time in mm:ss
 */
export function formatTime(seconds) {
  if (!seconds || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
