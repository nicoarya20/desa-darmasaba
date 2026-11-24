import Image from '@tiptap/extension-image';

/** Ambil berkas gambar dari admin → `src` untuk disisipkan (mis. URL preview lokal), atau null bila ditolak. */
export type PickEditorImage = (file: File) => string | null | Promise<string | null>;

/**
 * Ekstensi gambar sisipan editor admin: gambar berdiri sendiri sebagai blok (bukan di dalam paragraf), sehingga
 * tampil di tengah antarparagraf; base64 ditolak supaya HTML tersimpan tidak membengkak.
 */
export const editorImageExtension = Image.configure({ inline: false, allowBase64: false });
