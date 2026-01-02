type Entry = { count: number; firstAt: number };

const store = new Map<string, Entry>();

const MAX = Number(process.env.RATE_LIMIT_MAX || 5);
const WINDOW = Number(process.env.RATE_LIMIT_WINDOW || 3600); // seconds

export function isLimited(key: string) {
    const now = Date.now() / 1000;
    const e = store.get(key);

    if (!e) {
        store.set(key, { count: 1, firstAt: now });
        return { limited: false, remaining: MAX - 1, resetSeconds: WINDOW };
    }

    // reset window
    if (now - e.firstAt >= WINDOW) {
        store.set(key, { count: 1, firstAt: now });
        return { limited: false, remaining: MAX - 1, resetSeconds: WINDOW };
    }

    e.count += 1;
    const remaining = Math.max(0, MAX - e.count);
    store.set(key, e);
    if (e.count > MAX) {
        const resetSeconds = Math.max(1, Math.ceil(WINDOW - (now - e.firstAt)));
        return { limited: true, remaining: 0, resetSeconds };
    }

    const resetSeconds = Math.max(1, Math.ceil(WINDOW - (now - e.firstAt)));
    return { limited: false, remaining, resetSeconds };
}
