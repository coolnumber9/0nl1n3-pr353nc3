// kda-shell versioning: v{major}.{minor}.{patch} = age.month.day, computed at boot.
// The scheme is never explained in the UI — `kda --version` reveals the build date
// and lets the curious do the math.
const BIRTH = { y: 1982, m: 7, d: 27 };

export const BUILD_DATE = '1982-07-27';

export function kdaVersion(now = new Date()) {
  let major = now.getFullYear() - BIRTH.y;
  const beforeBirthday =
    now.getMonth() + 1 < BIRTH.m ||
    (now.getMonth() + 1 === BIRTH.m && now.getDate() < BIRTH.d);
  if (beforeBirthday) major -= 1;
  return `v${major}.${now.getMonth() + 1}.${now.getDate()}`;
}

// "KDA" in Morse — K: -·-  D: -··  A: ·-
// Also the site's mark (see public/favicon.svg — same geometry on a 9×8 grid).
export const MORSE_KDA = [
  '▄▄▄ ▄ ▄▄▄',
  '▄▄▄ ▄ ▄',
  '▄ ▄▄▄',
];
