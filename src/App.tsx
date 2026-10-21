import { HashRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import TradingApp from './pages/TradingApp';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<TradingApp />} />
      </Routes>
    </HashRouter>
  );
}
