/**
 * Client-side validation helpers.
 */

/**
 * Validate an email address format.
 * @param {string} email
 * @returns {string|null} error message or null
 */
export const validateEmail = (email) => {
  if (!email) return 'Email wajib diisi'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Format email tidak valid'
  return null
}

/**
 * Validate a password meets minimum requirements.
 * @param {string} password
 * @returns {string|null} error message or null
 */
export const validatePassword = (password) => {
  if (!password) return 'Password wajib diisi'
  if (password.length < 6) return 'Password minimal 6 karakter'
  return null
}

/**
 * Validate password confirmation matches.
 * @param {string} password
 * @param {string} confirm
 * @returns {string|null}
 */
export const validateConfirmPassword = (password, confirm) => {
  if (!confirm) return 'Konfirmasi password wajib diisi'
  if (password !== confirm) return 'Password tidak cocok'
  return null
}

/**
 * Validate a nominal value is positive.
 * @param {string|number} nominal
 * @returns {string|null}
 */
export const validateNominal = (nominal) => {
  const num = parseFloat(nominal)
  if (!nominal) return 'Nominal wajib diisi'
  if (isNaN(num) || num <= 0) return 'Nominal harus lebih dari 0'
  return null
}

/**
 * Validate a required text field.
 * @param {string} value
 * @param {string} fieldName
 * @returns {string|null}
 */
export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || value.trim() === '') return `${fieldName} wajib diisi`
  return null
}
