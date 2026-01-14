/**
 * Calculate the Optimal Recognition Point (ORP) index for a word.
 * The ORP is the letter where the eye naturally focuses for fastest recognition.
 * Based on research similar to Spritz reading technology.
 */
export function getORPIndex(word) {
  const len = word.length;

  if (len <= 1) return 0;
  if (len === 2) return 0;
  if (len === 3) return 1;
  if (len === 4) return 1;
  if (len <= 6) return 2;
  if (len <= 9) return 3;
  if (len <= 13) return 4;
  return 5;
}

/**
 * Split a word into three parts: before ORP, the ORP letter, and after ORP
 */
export function splitWordByORP(word) {
  if (!word) return { before: '', anchor: '', after: '' };

  const orpIndex = getORPIndex(word);

  return {
    before: word.slice(0, orpIndex),
    anchor: word[orpIndex] || '',
    after: word.slice(orpIndex + 1)
  };
}
