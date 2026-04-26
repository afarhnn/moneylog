/**
 * Shared utility functions — format & i18n helpers.
 */

/**
 * Format a number as Indonesian Rupiah.
 * @param {number} num
 * @returns {string} e.g. "Rp 1.500.000"
 */
export const formatRupiah = (num) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num ?? 0)

/**
 * Format a date string to short Indonesian locale.
 * @param {string|Date} date
 * @returns {string} e.g. "26 Apr 2026"
 */
export const formatTanggal = (date) =>
  new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

/**
 * Format a date string to short day + month.
 * @param {string|Date} date
 * @returns {string} e.g. "26 Apr"
 */
export const formatTanggalPendek = (date) =>
  new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  })

/**
 * Get month name from month number.
 * @param {number} bulan 1-12
 * @returns {string}
 */
export const namaBulan = (bulan) =>
  new Date(2000, bulan - 1, 1).toLocaleDateString('id-ID', { month: 'long' })
