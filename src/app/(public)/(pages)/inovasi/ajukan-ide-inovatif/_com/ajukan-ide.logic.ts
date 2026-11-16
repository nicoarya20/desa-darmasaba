/** Logika murni formulir Ajukan Ide Inovatif: validasi isian dan bentuk kiriman ke API. */

export type IdeField = "name" | "alamat" | "namaIde" | "deskripsi" | "masalah" | "benefit";
export type IdeForm = Record<IdeField, string>;
export type IdeErrors = Partial<Record<IdeField, string>>;

/** Urutan isian di formulir (juga urutan fokus ke galat pertama). */
export const IDE_FIELDS: readonly IdeField[] = ["name", "alamat", "namaIde", "deskripsi", "masalah", "benefit"];

/**
 * Batas panjang isian. `name` 50 = zod state admin; lainnya batas wajar UI (API & kolom DB `Text` tanpa batas,
 * lihat /tmp/inovasi/e7-backend.md).
 */
export const IDE_FIELD_MAX: Readonly<Record<IdeField, number>> = {
  name: 50,
  alamat: 200,
  namaIde: 120,
  deskripsi: 2000,
  masalah: 2000,
  benefit: 2000,
};

export const EMPTY_IDE_FORM: IdeForm = { name: "", alamat: "", namaIde: "", deskripsi: "", masalah: "", benefit: "" };

/** Pesan galat: isian kosong (per isian) dan melebihi batas panjang. */
export type IdeMessages = { required: Readonly<Record<IdeField, string>>; tooLong: (max: number) => string };

/** Galat per isian: wajib diisi (tanpa spasi saja) dan tidak melebihi batas panjang. Objek kosong = valid. */
export function validateIde(form: IdeForm, messages: IdeMessages): IdeErrors {
  const errors: IdeErrors = {};
  for (const field of IDE_FIELDS) {
    const value = form[field].trim();
    if (!value) errors[field] = messages.required[field];
    else if (value.length > IDE_FIELD_MAX[field]) errors[field] = messages.tooLong(IDE_FIELD_MAX[field]);
  }
  return errors;
}

/** Isian pertama (urut formulir) yang bergalat, untuk dipindahi fokus saat kirim ditolak. */
export function firstInvalidField(errors: IdeErrors): IdeField | undefined {
  return IDE_FIELDS.find((field) => errors[field]);
}

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Escape teks polos agar aman disisipkan ke HTML. */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

/**
 * Teks polos Textarea → HTML paragraf ter-escape (format editor admin): baris kosong memisah paragraf, baris
 * tunggal jadi `<br>`. Admin merender `deskripsi` sebagai HTML, jadi teks warga wajib di-escape.
 */
export function textToParagraphHtml(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => `<p>${para.split("\n").map((line) => escapeHtml(line.trim())).join("<br>")}</p>`)
    .join("");
}

/**
 * Bentuk body POST `/api/inovasi/ajukanideinovatif/create`. Admin merender `deskripsi` dan `alamat` sebagai HTML
 * (`dangerouslySetInnerHTML`) → keduanya di-escape; isian lain dirender admin sebagai teks → dikirim apa adanya (trim).
 */
export function toIdePayload(form: IdeForm): IdeForm {
  return {
    name: form.name.trim(),
    alamat: escapeHtml(form.alamat.trim()),
    namaIde: form.namaIde.trim(),
    deskripsi: textToParagraphHtml(form.deskripsi),
    masalah: form.masalah.trim(),
    benefit: form.benefit.trim(),
  };
}
