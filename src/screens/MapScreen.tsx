import { lazy, Suspense } from 'react';
import { PageHeader } from '../components/ui';

const MapView = lazy(() => import('../components/map/MapView'));

export default function MapScreen() {
  return (
    <Suspense fallback={<PageHeader title="Карта" subtitle="Загружаем…" />}>
      <MapView />
    </Suspense>
  );
}
