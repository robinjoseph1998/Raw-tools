const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'porta', 'nibh',
  'venenatis', 'cras', 'fermentum', 'odio', 'eu', 'feugiat', 'pretium',
  'viverra', 'suspendisse', 'potenti', 'nullam', 'ac', 'tortor', 'vitae',
  'purus', 'faucibus', 'ornare', 'maecenas', 'accumsan', 'lacus', 'vel',
  'facilisis', 'volutpat', 'blandit', 'libero', 'integer', 'pellentesque',
  'habitant', 'morbi', 'tristique', 'senectus', 'netus', 'malesuada', 'fames',
  'turpis', 'egestas', 'pharetra', 'massa', 'ultricies', 'mi', 'quas',
];

function pick(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function generateWords(count: number): string {
  return Array.from({ length: count }, () => pick()).join(' ');
}

export function generateSentences(count: number): string {
  return Array.from({ length: count }, () => {
    const len = 8 + Math.floor(Math.random() * 12);
    const words = Array.from({ length: len }, () => pick());
    words[0] = capitalize(words[0]);
    return words.join(' ') + '.';
  }).join(' ');
}

export function generateParagraphs(count: number): string {
  return Array.from({ length: count }, () => generateSentences(3 + Math.floor(Math.random() * 4))).join('\n\n');
}
