export const convertToISODate = (dateString: string): string => {
  if (!dateString) return '';

  // Jika format dd/mm/yyyy
  const parts = dateString.split('/');
  if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }

  // Jika sudah format YYYY-MM-DD, biarkan
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // Jika format lain, coba parse dengan Date
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  console.warn(`Format tanggal tidak dikenali: ${dateString}`);
  return '';
};