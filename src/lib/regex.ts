export interface RegexMatch {
  text: string;
  index: number;
  groups: string[];
}

export function testRegex(
  pattern: string,
  flags: string,
  input: string,
): { success: true; matches: RegexMatch[] } | { success: false; error: string } {
  try {
    const re = new RegExp(pattern, flags);
    const matches: RegexMatch[] = [];

    if (flags.includes('g')) {
      let m: RegExpExecArray | null;
      while ((m = re.exec(input)) !== null) {
        matches.push({
          text: m[0],
          index: m.index,
          groups: m.slice(1),
        });
        if (!m[0]) re.lastIndex++; // prevent infinite loop on empty match
      }
    } else {
      const m = re.exec(input);
      if (m) {
        matches.push({
          text: m[0],
          index: m.index,
          groups: m.slice(1),
        });
      }
    }

    return { success: true, matches };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
