import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Calendar from './screens/Calendar';
import Today from './screens/Today';
import Day from './screens/Day';
import MapScreen from './screens/MapScreen';
import Places from './screens/Places';
import PlaceCard from './screens/PlaceCard';
import More from './screens/More';
import Itinerary from './screens/Itinerary';
import ImportScreen from './screens/ImportScreen';
import Animals from './screens/Animals';
import { useEffect } from 'react';
import { useSettings } from './lib/settings';
import { startSync } from './lib/sync';

export default function App() {
  const { settings } = useSettings();
  useEffect(() => { if (settings.syncCode) startSync(settings.syncCode); }, [settings.syncCode]);
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Calendar />} />
        <Route path="today" element={<Today />} />
        <Route path="day/:date" element={<Day />} />
        <Route path="map" element={<MapScreen />} />
        <Route path="places" element={<Places />} />
        <Route path="place/:id" element={<PlaceCard />} />
        <Route path="more/*" element={<More />} />
        <Route path="country" element={<Navigate to="/places?view=country" replace />} />
        <Route path="food" element={<Navigate to="/places?view=food" replace />} />
        <Route path="itinerary/:id" element={<Itinerary />} />
        <Route path="import" element={<ImportScreen />} />
        <Route path="animals" element={<Animals />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
