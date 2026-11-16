/** Batas muat sekali (API find-many); langkah & lokasi dipakai utuh tanpa paginasi. */
export const BANK_SAMPAH_FETCH_LIMIT = 100;

/** Langkah lebih dari ini tidak muat sebaris di desktop → alur selalu vertikal. */
export const STEPS_RAIL_MAX = 6;

/** Zoom saat satu lokasi (atau batas banyak lokasi) dan saat baris dipilih. */
export const MAP_FIT_MAX_ZOOM = 16;
export const MAP_FOCUS_ZOOM = 17;

/** Rute Google Maps dari koordinat (cadangan bila `linkPetunjukArah` kosong/tidak valid). */
export const DIRECTIONS_BASE_URL = "https://www.google.com/maps/dir/?api=1&destination=";
