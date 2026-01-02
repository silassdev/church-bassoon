import { useEffect, useState } from 'react';

export default function useNotifications(pollInterval = 15000) {
  const [items, setItems] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  async function load() {
    const res = await fetch('/api/notifications?limit=20');
    if (!res.ok) return;
    const data = await res.json();
    setItems(data);
    setUnreadCount(data.filter((d:any) => !d.read).length);
  }

  useEffect(() => {
    load();
    const id = setInterval(load, pollInterval);
    return () => clearInterval(id);
  }, [pollInterval]);

  return { items, unreadCount, reload: load };
}
