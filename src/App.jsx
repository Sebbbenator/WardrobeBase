import { Outlet } from 'react-router-dom';
import BottomNav from './components/BottomNav.jsx';

export default function App() {
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-md bg-cream">
      <main className="px-4 pb-nav">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
