import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-slate-200 dark:bg-[#0B1F3A] border border-slate-300 dark:border-white/10 transition-all"
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-slate-700" />
      ) : (
        <Sun className="w-5 h-5 text-[#2DD4BF]" />
      )}
    </button>
  );
}