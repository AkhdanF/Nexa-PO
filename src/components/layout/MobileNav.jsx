// Mobile Bottom Navigation & Floating Quick Order Button
import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Plus,
  Package,
  Wallet,
  Settings,
} from 'lucide-react';

export function MobileNav({
  activePage,
  onNavigate,
  onNavigateCreateOrder,
  ordersCount = 0,
}) {
  const navItems = [
    { key: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { key: 'orders', label: 'Pesanan', icon: ShoppingBag, badge: ordersCount > 0 ? ordersCount : null },
    // Center floating slot
    { key: 'products', label: 'Produk', icon: Package },
    { key: 'finance', label: 'Keuangan', icon: Wallet },
  ];

  return (
    <div className="md:hidden">
      {/* Floating "Buat Pesanan" Action Button */}
      {activePage !== 'create-order' && (
        <div className="fixed bottom-20 right-4 z-40">
          <button
            type="button"
            onClick={onNavigateCreateOrder}
            className="flex items-center gap-2 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white pl-4 pr-5 py-3 rounded-full shadow-xl shadow-slate-900/25 hover:shadow-2xl active:scale-95 transition-all cursor-pointer font-bold text-xs tracking-wide min-h-[48px] border border-white/25"
            aria-label="Buat Pesanan Baru"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Plus className="w-4 h-4 text-cyan-200" />
            </div>
            <span>Buat PO</span>
          </button>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar (Glassmorphic) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-xl border-t border-white/70 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] h-16 px-2 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activePage === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-all relative ${
                isActive ? 'text-slate-950 font-bold scale-105' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-indigo-600' : 'stroke-[1.75]'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] px-1 bg-slate-900 text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* Settings button in bottom bar */}
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-all ${
            activePage === 'settings' ? 'text-slate-950 font-bold scale-105' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Settings className={`w-5 h-5 ${activePage === 'settings' ? 'stroke-[2.5] text-indigo-600' : 'stroke-[1.75]'}`} />
          <span className="text-[10px] mt-1 tracking-tight">Setelan</span>
        </button>
      </nav>
    </div>
  );
}
