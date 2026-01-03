type Listener = (msg: string) => void;

if (!globalThis.__BROADCASTERS__) {
  const make = () => {
    const listeners = new Set<Listener>();
    return {
      add(l: Listener) { listeners.add(l); },
      remove(l: Listener) { listeners.delete(l); },
      broadcast(msg: string) { for (const l of Array.from(listeners)) { try { l(msg); } catch (_) {} } },
      count() { return listeners.size; }
    };
  };
  globalThis.__BROADCASTERS__ = {
    announcements: make(),
    events: make(),
  };
}

export const AnnounceBroadcaster = globalThis.__BROADCASTERS__.announcements;
export const EventBroadcaster = globalThis.__BROADCASTERS__.events;
