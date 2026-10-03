// Desktop Sidebar Component (Glassmorphism & NEXA Branding)
import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  Package,
  Wallet,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { APP_CONFIG } from '../../config/app.js';

export function Sidebar({
  activePage,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  settings,
  ordersCount = 0,
}) {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'orders', label: 'Pesanan', icon: ShoppingBag, badge: ordersCount > 0 ? ordersCount : null },
    { key: 'create-order', label: 'Buat Pesanan', icon: PlusCircle, isHighlight: true },
    { key: 'products', label: 'Katalog Produk', icon: Package },
    { key: 'finance', label: 'Arus Kas', icon: Wallet },
    { key: 'reports', label: 'Laporan', icon: BarChart3 },
    { key: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col backdrop-blur-2xl bg-white/70 border-r border-white/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-200 select-none z-20 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/60">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center shrink-0 font-extrabold text-sm shadow-md shadow-indigo-950/20 border border-white/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-transparent pointer-events-none" />
              <span className="tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-100 to-cyan-200 font-mono">
                N
              </span>
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  {APP_CONFIG.name}
                </h1>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-cyan-100/70 text-cyan-800 border border-cyan-200/50">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                {settings?.businessName || 'Operations Suite'}
              </p>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center font-extrabold text-sm mx-auto shadow-md shadow-indigo-950/20 border border-white/20 relative overflow-hidden">
            <span className="tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-100 to-cyan-200 font-mono">
              N
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors cursor-pointer ${
            isCollapsed ? 'hidden' : 'block'
          }`}
          title={isCollapsed ? 'Perluas Menu' : 'Ciutkan Menu'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activePage === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/15 border border-slate-800'
                  : item.isHighlight
                  ? 'text-indigo-950 bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-100/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 hover:shadow-xs border border-transparent'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive
                    ? 'text-cyan-300'
                    : item.isHighlight
                    ? 'text-indigo-600'
                    : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />

              {!isCollapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {!isCollapsed && item.badge && (
                <span
                  className={`text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-full font-bold shadow-xs ${
                    isActive
                      ? 'bg-white/20 text-cyan-200'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile / Business Tag */}
      <div className="p-3 border-t border-white/60">
        {isCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:bg-white/80 hover:text-slate-700 transition-colors"
            title="Perluas Menu"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2.5 p-2.5 bg-white/60 backdrop-blur-md rounded-xl border border-white/80 shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0 font-bold text-xs border border-indigo-200/50">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="truncate flex-1">
              <div className="text-[11px] font-bold text-slate-800 truncate">
                {settings?.businessName || APP_CONFIG.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                NEXA Core v{APP_CONFIG.version}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
