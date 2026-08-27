export const sosmedMap = {
  facebook: { label: 'Facebook', src: '/assets/images/sosmed/facebook.png' },
  instagram: { label: 'Instagram', src: '/assets/images/sosmed/instagram.png' },
  tiktok: { label: 'Tiktok', src: '/assets/images/sosmed/tiktok.png' },
  youtube: { label: 'YouTube', src: '/assets/images/sosmed/youtube.png' },
  whatsapp: { label: 'WhatsApp', src: '/assets/images/sosmed/whatsapp.png' },
  gmail: { label: 'Gmail', src: '/assets/images/sosmed/gmail.png' },
  telegram: { label: 'Telegram', src: '/assets/images/sosmed/telegram.png' },
  x: { label: 'X (Twitter)', src: '/assets/images/sosmed/x-twitter.png' },
  telephone: { label: 'Telephone', src: '/assets/images/sosmed/telephone-call.png' },
  custom: { label: 'Custom Icon', src: null },
};

// Tipe icon yang nilainya berupa nomor telepon, bukan URL
const WA_ICON_TYPES = ['telephone', 'whatsapp'] as const;

/**
 * Bangun href yang benar untuk satu entry MediaSosial berdasarkan tipe icon-nya.
 * - telephone / whatsapp: nomor dinormalisasi (62xxx) lalu diarahkan ke wa.me
 *   → browser otomatis buka WhatsApp Web di desktop, app WhatsApp di mobile.
 * - tipe lain (facebook/instagram/dst): iconUrl dipakai apa adanya sebagai URL eksternal.
 * Return null kalau iconUrl kosong atau nomor tidak mengandung digit sama sekali.
 */
export function getSosmedHref(
  icon: string | null | undefined,
  iconUrl: string | null | undefined
): string | null {
  const value = iconUrl?.trim();
  if (!value) return null;

  if (WA_ICON_TYPES.includes(icon as (typeof WA_ICON_TYPES)[number])) {
    const digits = value.replace(/\D/g, '');
    if (!digits) return null;
    const normalized = digits.startsWith('62')
      ? digits
      : digits.startsWith('0')
        ? `62${digits.slice(1)}`
        : `62${digits}`;
    return `https://wa.me/${normalized}`;
  }

  return value;
}
