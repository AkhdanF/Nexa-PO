// Date Formatting and Filtering Utilities

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const MONTHS_SHORT_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
];

const DAYS_ID = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

/**
 * Get today's date formatted as YYYY-MM-DD for input[type="date"]
 */
export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date string (YYYY-MM-DD or ISO) into readable Indonesian date
 * @param {string|Date} dateInput
 * @param {boolean} short
 * @returns {string} e.g. "2 Okt 2026" or "2 Oktober 2026"
 */
export function formatDate(dateInput, short = true) {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const day = d.getDate();
  const monthName = short ? MONTHS_SHORT_ID[d.getMonth()] : MONTHS_ID[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${monthName} ${year}`;
}

/**
 * Format full date with day name e.g. "Jumat, 2 Oktober 2026"
 */
export function formatFullDate(dateInput) {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const dayName = DAYS_ID[d.getDay()];
  const day = d.getDate();
  const monthName = MONTHS_ID[d.getMonth()];
  const year = d.getFullYear();

  return `${dayName}, ${day} ${monthName} ${year}`;
}

/**
 * Format date and time e.g. "2 Okt 2026, 14:30"
 */
export function formatDateTime(dateTimeInput) {
  if (!dateTimeInput) return '-';
  const d = new Date(dateTimeInput);
  if (isNaN(d.getTime())) return String(dateTimeInput);

  const dateStr = formatDate(d, true);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${dateStr}, ${hours}:${minutes}`;
}

/**
 * Get greeting based on current local time
 */
export function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return 'Selamat Pagi';
  if (hour >= 11 && hour < 15) return 'Selamat Siang';
  if (hour >= 15 && hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

/**
 * Check if a date string falls inside a specified date range filter
 * @param {string} dateString - YYYY-MM-DD or ISO
 * @param {string} filterType - 'today' | '7d' | '30d' | 'month' | 'custom' | 'all'
 * @param {string} customStart - YYYY-MM-DD
 * @param {string} customEnd - YYYY-MM-DD
 * @returns {boolean}
 */
export function isDateInRange(dateString, filterType, customStart = null, customEnd = null) {
  if (!dateString) return false;
  if (filterType === 'all') return true;

  const itemDate = new Date(dateString);
  if (isNaN(itemDate.getTime())) return true; // fallback

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (filterType === 'today') {
    return itemDate >= todayStart && itemDate <= todayEnd;
  }

  if (filterType === '7d') {
    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    return itemDate >= sevenDaysAgo && itemDate <= todayEnd;
  }

  if (filterType === '30d') {
    const thirtyDaysAgo = new Date(todayStart);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    return itemDate >= thirtyDaysAgo && itemDate <= todayEnd;
  }

  if (filterType === 'month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return itemDate >= startOfMonth && itemDate <= endOfMonth;
  }

  if (filterType === 'custom' && customStart && customEnd) {
    const cStart = new Date(customStart);
    cStart.setHours(0, 0, 0, 0);
    const cEnd = new Date(customEnd);
    cEnd.setHours(23, 59, 59, 999);
    return itemDate >= cStart && itemDate <= cEnd;
  }

  return true;
}
