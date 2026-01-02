export const DEFAULT_AVATARS = [
  '/avatars/defaults/default1.jpg',
  '/avatars/defaults/default2.jpg',
  '/avatars/defaults/default3.jpg',
  '/avatars/defaults/default4.jpg',
  '/avatars/defaults/default5.jpg',
];

export function thumbFor(url: string) {
  return url.replace(/(\.[a-zA-Z]+)$/, '_thumb$1');
}

export function randomDefault() {
  const idx = Math.floor(Math.random() * DEFAULT_AVATARS.length);
  const base = DEFAULT_AVATARS[idx];
  return { full: base, thumb: thumbFor(base) };
}
