import { proxy } from "valtio";
import persentasekelahiran from "./persentaseKelahiran/persentase-kelahiran-kematian";
import kelahiran from "./persentaseKelahiran/kelahiran";
import kematian from "./persentaseKelahiran/kematian";

const persentaseKelahiranKematian = proxy({
  persentasekelahiran,
  kelahiran,
  kematian,
});

export default persentaseKelahiranKematian;
