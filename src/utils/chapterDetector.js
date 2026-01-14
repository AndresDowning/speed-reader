/**
 * Detect chapters/sections in text and return their positions
 */
export function detectChapters(words) {
  const chapters = [];

  // Patterns that typically indicate chapter starts
  const chapterPatterns = [
    /^chapter$/i,
    /^part$/i,
    /^section$/i,
    /^prologue$/i,
    /^epilogue$/i,
    /^introduction$/i,
    /^conclusion$/i,
    /^preface$/i,
  ];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const nextWord = words[i + 1] || '';
    const nextNextWord = words[i + 2] || '';

    // Check for "Chapter X" or "Chapter X:" patterns
    for (const pattern of chapterPatterns) {
      if (pattern.test(word)) {
        // Build chapter title from surrounding words
        let title = word;

        // If next word is a number or roman numeral, include it
        if (/^[0-9]+$/.test(nextWord) || /^[IVXLCDM]+$/i.test(nextWord)) {
          title += ' ' + nextWord;

          // Check for chapter name after number (e.g., "Chapter 1: The Beginning")
          if (nextNextWord === ':' || nextNextWord === '-') {
            // Grab a few more words for the title
            const titleWords = words.slice(i + 3, i + 8).join(' ');
            if (titleWords) {
              title += ' - ' + titleWords;
            }
          }
        }

        chapters.push({
          title: title.charAt(0).toUpperCase() + title.slice(1),
          wordIndex: i,
          percent: Math.round((i / words.length) * 100)
        });
        break;
      }
    }
  }

  // If no chapters found, create artificial sections every ~1000 words
  if (chapters.length === 0 && words.length > 500) {
    const sectionSize = Math.min(1000, Math.floor(words.length / 10));
    for (let i = 0; i < words.length; i += sectionSize) {
      chapters.push({
        title: `Section ${Math.floor(i / sectionSize) + 1}`,
        wordIndex: i,
        percent: Math.round((i / words.length) * 100)
      });
    }
  }

  // Always add "Beginning" if not already there
  if (chapters.length === 0 || chapters[0].wordIndex !== 0) {
    chapters.unshift({
      title: 'Beginning',
      wordIndex: 0,
      percent: 0
    });
  }

  return chapters;
}

/**
 * Get a preview snippet around a word index
 */
export function getPreviewSnippet(words, index, length = 10) {
  const start = Math.max(0, index);
  const end = Math.min(words.length, start + length);
  return words.slice(start, end).join(' ') + '...';
}
