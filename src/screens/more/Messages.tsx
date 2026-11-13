import { PageHeader } from '../../components/ui';
import { MessageBox } from '../../components/MessageBox';
import { templates, places } from '../../lib/data';
import { Link } from 'react-router-dom';

export default function Messages() {
  return (
    <div>
      <PageHeader back="/more" title="Сообщения" subtitle="Готовые тексты: копировать или сразу открыть WhatsApp" />
      <ul className="space-y-4 px-4">
        {templates.map((t) => {
          const p = places.find((x) => x.messageTemplateId === t.id);
          return (
            <li key={t.id}>
              {p && <Link to={`/place/${p.id}`} className="mb-1.5 block font-bold text-accent">{p.emoji} {p.name}</Link>}
              <MessageBox tpl={t} contacts={p?.contacts} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
