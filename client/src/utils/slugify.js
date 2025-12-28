export const slugify = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD') // Decompose combined characters (e.g., 'é' -> 'e' + '´')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[đĐ]/g, 'd') // Handle Vietnamese 'đ'
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/[\s-]+/g, '-') // Replace spaces and dashes with single dash
    .replace(/^-+|-+$/g, ''); // Trim dashes
};
