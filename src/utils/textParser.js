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

    // Parse manifest to get all content files (handle any attribute order)
    const manifest = {};
    const itemRegex = /<item\s+([^>]*)\/?>|<item\s+([^>]*)>[^<]*<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(opfContent)) !== null) {
      const attrs = match[1] || match[2];
      const id = attrs.match(/id=["']([^"']+)["']/i)?.[1];
      const href = attrs.match(/href=["']([^"']+)["']/i)?.[1];
      const mediaType = attrs.match(/media-type=["']([^"']+)["']/i)?.[1];

      if (id && href) {
        manifest[id] = { href: decodeURIComponent(href), mediaType: mediaType || '' };
      }
    }

    // Parse spine to get reading order
    const spineRegex = /<itemref[^>]*idref=["']([^"']+)["'][^>]*\/?>/gi;
    const spineOrder = [];
    while ((match = spineRegex.exec(opfContent)) !== null) {
      spineOrder.push(match[1]);
    }

    // If no spine found, try to use manifest order for HTML files
    if (spineOrder.length === 0) {
      for (const [id, item] of Object.entries(manifest)) {
        if (item.mediaType.includes('html') || item.mediaType.includes('xhtml')) {
          spineOrder.push(id);
        }
      }
    }

    // Extract text from each content file in spine order
    let fullText = '';

    for (const itemId of spineOrder) {
      const item = manifest[itemId];
      if (!item) continue;

      // Only process HTML/XHTML files
      if (item.mediaType && !item.mediaType.includes('html') && !item.mediaType.includes('xml')) {
        continue;
      }

      // Handle both relative and absolute paths
      let filePath = item.href;
      if (!filePath.startsWith('/') && opfDir) {
        filePath = opfDir + item.href;
      }

      // Try to find the file (case-insensitive)
      let content = await zip.file(filePath)?.async('text');

      // If not found, try without the directory prefix
      if (!content && opfDir) {
        content = await zip.file(item.href)?.async('text');
      }

      if (content) {
        const textContent = extractTextFromHTML(content);
        fullText += textContent + ' ';
      }
    }

    if (!fullText.trim()) {
      throw new Error('No readable content found in EPUB');
    }

    return fullText;
  } catch (error) {
    console.error('EPUB parsing error:', error);
    throw new Error('Failed to parse EPUB: ' + error.message);
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
