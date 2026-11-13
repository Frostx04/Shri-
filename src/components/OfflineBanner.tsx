import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(navigator.onLine);
    addEventListener('online', on); addEventListener('offline', on);
    return () => { removeEventListener('online', on); removeEventListener('offline', on); };
  }, []);
  if (online) return null;
  return (
    <div className="safe-top sticky top-0 z-[1100] flex items-center justify-center gap-2 bg-[#5c4300] px-3 py-1.5 text-sm font-semibold text-white" role="status">
      <WifiOff size={16} /> Без сети — показываем сохранённое
    </div>
  );
}
