/**
 * Menghitung persentase perubahan harga.
 * Jika previous 0 atau null maka mengembalikan null untuk menghindari div-by-zero.
 */
export function calculateChangePct(
  current: number,
  previous: number | null,
): number | null {
  if (!previous || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}