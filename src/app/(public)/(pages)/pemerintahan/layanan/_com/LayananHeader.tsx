import BackButton from "./BackButto";
import s from "./layanan.module.css";
import { LAYANAN_TEXT } from "./layanan.text";

/** Kepala halaman daftar Layanan: tombol kembali, judul `h1` brand, pengantar. */
export function LayananHeader() {
  return (
    <header className={s.header}>
      <BackButton />
      <div className={s.intro}>
        <h1 className={s.title}>{LAYANAN_TEXT.title}</h1>
        <p className={s.lead}>{LAYANAN_TEXT.lead}</p>
      </div>
    </header>
  );
}
