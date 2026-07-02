import { motion } from 'framer-motion';
import { CalendarDays, LayoutGrid, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function BottomNav({
  view,
  onViewChange,
}: {
  view: 'month' | 'list';
  onViewChange: (v: 'month' | 'list') => void;
}) {
  const signOut = useAuthStore((s) => s.signOut);

  const items = [
    { key: 'month' as const, label: 'Home', icon: LayoutGrid, onClick: () => onViewChange('month') },
    { key: 'list' as const, label: 'All Weeks', icon: CalendarDays, onClick: () => onViewChange('list') },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden">
      <div className="mx-auto flex max-w-3xl items-stretch">
        {items.map(({ key, label, icon: Icon, onClick }) => {
          const active = view === key;
          return (
            <button
              key={key}
              onClick={onClick}
              className="relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold tracking-wide uppercase"
            >
              {active && (
                <motion.span
                  layoutId="bottom-nav-active"
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  className="absolute top-0 h-0.5 w-8 rounded-full bg-cyan"
                />
              )}
              <Icon size={18} className={active ? 'text-cyan' : 'text-text-faint'} />
              <span className={active ? 'text-cyan' : 'text-text-faint'}>{label}</span>
            </button>
          );
        })}
        <button
          onClick={signOut}
          className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold tracking-wide text-text-faint uppercase"
        >
          <LogOut size={18} />
          <span>Sign out</span>
        </button>
      </div>
    </nav>
  );
}
