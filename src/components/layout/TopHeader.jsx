// Top Header Component (Compliant with Top Bar Contract)
import React from 'react';
import {
  Search,
  Bell,
  Cloud,
  CloudOff,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export function TopHeader({
  title,
  subtitle,
  onOpenSearch,
  onOpenNotifications,
  notificationCount = 0,
  offlineQueueCount = 0,
  onQuickSync,
  onNavigateCreateOrder,
  connectionStatus = 'unconfigured',
  onPullData = null,
  pullingData = false,
  hasSheetsUrl = false,
}) {
  return (
    <header className="h-16 backdrop-blur-xl bg-white/75 border-b border-white/60 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
      {/* Zone 1: Page Title / Breadcrumb */}
      <div className="flex flex-col justify-center min-w-0">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-400 font-medium truncate hidden sm:block">
            {subtitle}
          </p>
        )}
      </div>

      {/* Zone 2 & 3: Actions & Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Pull / Refresh Latest from Sheets */}
        {hasSheetsUrl && (
          <button
            type="button"
            onClick={onPullData}
            disabled={pullingData}
            className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200/60 px-3 py-1.5 rounded-xl transition-all cursor-pointer min-h-[36px] shadow-xs active:scale-95"
            title="Tarik data terbaru dari Google Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${pullingData ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline font-semibold">Tarik Data</span>
          </button>
        )}

        {/* Search Bar / Trigger */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2 text-xs text-slate-500 bg-white/70 hover:bg-white border border-white/80 hover:border-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer min-h-[36px] shadow-xs"
          title="Cari cepat (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline font-medium">Cari data...</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-mono rounded-md border border-slate-200/80">
            ⌘K
          </kbd>
        </button>

        {/* Offline Queue Sync Indicator */}
        {offlineQueueCount > 0 && (
          <button
            type="button"
            onClick={onQuickSync}
            className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50/90 hover:bg-amber-100 border border-amber-200/80 px-2.5 py-1.5 rounded-xl transition-all min-h-[36px] shadow-xs active:scale-95"
            title={`${offlineQueueCount} perubahan tersimpan offline. Klik untuk sinkronkan.`}
          >
            <CloudOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span className="font-mono tabular-nums font-bold">
              {offlineQueueCount}
            </span>
          </button>
        )}

        {/* Notification Bell */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-600 hover:text-slate-900 bg-white/60 hover:bg-white border border-white/80 rounded-xl transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center shadow-xs"
          title="Pemberitahuan"
          aria-label="Pemberitahuan"
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </button>

        {/* Create Order Quick CTA (Desktop) */}
        <div className="hidden sm:block">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={onNavigateCreateOrder}
            className="shadow-sm shadow-slate-900/10"
          >
            Buat Pesanan
          </Button>
        </div>
      </div>
    </header>
  );
}
