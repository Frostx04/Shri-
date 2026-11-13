import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Calendar from './screens/Calendar';
import Today from './screens/Today';
import Day from './screens/Day';
import MapScreen from './screens/MapScreen';
import Places from './screens/Places';
import PlaceCard from './screens/PlaceCard';
import More from './screens/More';

export default function App() {
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
