import { useState } from 'react';
import { Copy, Check, MessageCircle } from 'lucide-react';
import type { MessageTemplate, Contact } from '../data/schema';
import { waLink } from '../lib/links';

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

export function MessageBox({ tpl, contacts = [] }: { tpl: MessageTemplate; contacts?: Contact[] }) {
  const [copied, setCopied] = useState(false);
  const wa = contacts.find((c) => c.kind === 'whatsapp');
  const href = wa ? waLink(wa.value, tpl.text) : `https://wa.me/?text=${encodeURIComponent(tpl.text)}`;
  return (
    <div className="card p-4">
      <div className="mb-2 flex items-center justify-between gap-2 text-sm text-soft">
        <span>Кому: <b className="text-[var(--fg)]">{tpl.to}</b></span>
        <span className="chip">{tpl.lang === 'en' ? 'English' : 'Русский'}</span>
      </div>
      <p className="whitespace-pre-wrap rounded-xl bg-surface-2 p-3 text-[0.95rem] leading-relaxed">{tpl.text}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="btn" onClick={async () => { if (await copyText(tpl.text)) { setCopied(true); setTimeout(() => setCopied(false), 1800); } }}>
          {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'Скопировано' : 'Копировать'}
        </button>
        <a className="btn btn-primary" href={href} target="_blank" rel="noreferrer">
          <MessageCircle size={18} /> {wa ? 'В WhatsApp' : 'Выбрать чат'}
        </a>
      </div>
    </div>
  );
}
