// How hard a password would be to guess, from Weak to Strong, worked out as the person types. The rules
// (lib/validation/password.ts) are what the API requires; this goes further, because "Password1!" meets
// every rule and is among the first passwords an attacker tries. It is a quick estimate in bits, small
// enough to ship to the browser: common words, the person's own name, sequences (abc, 123, qwerty),
// repeats and years count as one cheap guess each, and only the rest counts as random characters.

export type Strength = { score: 0 | 1 | 2 | 3 | 4; label: string; hint: string | null };

const commonWords = [
  "password", "passw", "pass", "qwerty", "letmein", "welcome", "admin", "login", "iloveyou", "love", "monkey", "dragon",
  "football", "baseball", "soccer", "sunshine", "princess", "master", "shadow", "superman", "batman", "trustno", "hello",
  "freedom", "whatever", "secret", "summer", "winter", "spring", "autumn", "demo", "test", "user", "guest", "default",
  "changeme", "abc", "god", "money", "shop", "store",
];

// Keyboard rows and the alphabet, forwards; backwards is checked too
const sequences = ["abcdefghijklmnopqrstuvwxyz", "01234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm"];

// Letters people swap in for look-alike digits and symbols
const leet: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", $: "s", "!": "i" };

function poolSize(password: string) {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^A-Za-z0-9]/.test(password)) pool += 33;
  return pool;
}

function sequenceLength(text: string, at: number) {
  let best = 0;
  for (const run of sequences.flatMap((s) => [s, [...s].reverse().join("")])) {
    let length = 0;
    const start = run.indexOf(text[at]);
    if (start < 0) continue;
    while (at + length < text.length && run[start + length] === text[at + length]) length++;
    best = Math.max(best, length);
  }
  return best >= 3 ? best : 0;
}

function repeatLength(text: string, at: number) {
  let length = 1;
  while (text[at + length] === text[at]) length++;
  return length >= 3 ? length : 0;
}

export function passwordStrength(password: string, personal: string[] = []): Strength {
  if (!password) return { score: 0, label: "", hint: null };

  const lower = password.toLowerCase();
  const plain = [...lower].map((c) => leet[c] ?? c).join("");
  // Their name, email and the like: the first thing someone who knows them tries
  const own = personal.flatMap((p) => p.toLowerCase().split(/[^a-z0-9]+/)).filter((p) => p.length >= 3);
  const charBits = Math.log2(poolSize(password));

  let bits = 0;
  let hint: string | null = null;
  const note = (text: string) => (hint ??= text);

  for (let i = 0; i < plain.length; ) {
    const ownWord = own.find((w) => plain.startsWith(w, i) || lower.startsWith(w, i));
    if (ownWord) {
      bits += 2;
      i += ownWord.length;
      note("Leave out your name and email: they're the first things tried.");
      continue;
    }
    const word = commonWords.filter((w) => plain.startsWith(w, i)).sort((a, b) => b.length - a.length)[0];
    if (word) {
      bits += 10;
      i += word.length;
      note("Common words are guessed first. Try a few unrelated words instead.");
      continue;
    }
    const year = /^(19|20)\d\d/.exec(lower.slice(i));
    if (year) {
      bits += 7;
      i += 4;
      note("Years are easy to guess.");
      continue;
    }
    const run = Math.max(sequenceLength(lower, i), sequenceLength(plain, i));
    if (run) {
      bits += 4 + Math.log2(run);
      i += run;
      note("Sequences like 123, abc or qwerty are guessed first.");
      continue;
    }
    const repeat = repeatLength(lower, i);
    if (repeat) {
      bits += 3;
      i += repeat;
      note("Repeated characters add little.");
      continue;
    }
    bits += charBits;
    i++;
  }

  if (bits < 28) return { score: 1, label: "Weak", hint: hint ?? "Make it longer: a few unrelated words are easy to remember." };
  if (bits < 40) return { score: 2, label: "Fair", hint: hint ?? "Longer is stronger: add another word." };
  if (bits < 60) return { score: 3, label: "Good", hint };
  return { score: 4, label: "Strong", hint: null };
}
