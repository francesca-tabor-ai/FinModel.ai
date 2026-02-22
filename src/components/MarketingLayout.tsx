/**
 * Marketing layout with header navigation
 */
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { BrainCircuit } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/case-studies', label: 'Case Studies' },
];

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              className="w-10 h-10 signature-gradient rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <BrainCircuit className="text-white" size={22} />
            </motion.div>
            <span className="text-2xl font-display font-bold tracking-tight">
              FinModel<span className="signature-text">.ai</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === to
                    ? 'bg-[#111827] text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#111827]'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/app"
              className="btn-secondary"
            >
              Log in
            </Link>
            <Link
              to="/app"
              className="btn-primary"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
