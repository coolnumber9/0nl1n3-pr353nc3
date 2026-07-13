// kda-shell versioning: v{major}.{minor}.{patch} = exact age as years.months.days,
// computed at boot. True uptime semver: minor bumps on each month-mark (the 27th),
// patch resets with it, and the birthday ships a major release (v44.0.0 on
// 2026-07-27). Decoupled from the calendar date so the scheme isn't guessable;
// `kda --version` reveals the build date and lets the curious do the math.
const BIRTH = { y: 1982, m: 7, d: 27 };

export const BUILD_DATE = '1982-07-27';

export function kdaVersion(now = new Date()) {
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();

  let major = y - BIRTH.y;
  if (m < BIRTH.m || (m === BIRTH.m && d < BIRTH.d)) major -= 1;

  let minor = (m - BIRTH.m + 12) % 12;
  if (d < BIRTH.d) minor = (minor + 11) % 12;

  // days since the last month-mark; anchored to real dates, so leap
  // Februaries and 30/31-day months come out right with no special cases
  const patch = d >= BIRTH.d
    ? d - BIRTH.d
    : new Date(y, m - 1, 0).getDate() - BIRTH.d + d; // days in previous month

  return `v${major}.${minor}.${patch}`;
}

// "KDA" in Morse — K: -·-  D: -··  A: ·-
// Also the site's mark (see public/favicon.svg — same geometry on a 9×8 grid).
export const MORSE_KDA = [
  '▄▄▄ ▄ ▄▄▄',
  '▄▄▄ ▄ ▄',
  '▄ ▄▄▄',
];
