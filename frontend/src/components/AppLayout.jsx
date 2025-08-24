import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      
      {/* Main Content - uses CSS custom property for responsive margin */}
      <div className="transition-all duration-300 ease-in-out" style={{ marginLeft: 'var(--sidebar-width, 4rem)' }}>
        <main className="p-6 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
