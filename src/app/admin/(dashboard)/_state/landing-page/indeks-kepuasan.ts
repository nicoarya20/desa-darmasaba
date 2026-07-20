import { proxy } from "valtio";
import jenisKelaminResponden from "./indeksKepuasan/jenis-kelamin-responden";
import kelompokUmurResponden from "./indeksKepuasan/kelompok-umur-responden";
import pilihanRatingResponden from "./indeksKepuasan/pilihan-rating-responden";
import responden from "./indeksKepuasan/responden";

const indeksKepuasanState = proxy({
  responden,
  kelompokUmurResponden,
  jenisKelaminResponden,
  pilihanRatingResponden,
});

export default indeksKepuasanState;
