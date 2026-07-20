import { proxy } from "valtio";
import ajukanPermohonan from "./layananDesa/ajukan-permohonan";
import pendudukNonPermanen from "./layananDesa/penduduk-non-permanen";
import perizinanBerusaha from "./layananDesa/perizinan-berusaha";
import suratKeterangan from "./layananDesa/surat-keterangan";
import telunjukSaktiDesa from "./layananDesa/telunjuk-sakti-desa";

const stateLayananDesa = proxy({
  suratKeterangan,
  pelayananPerizinanBerusaha: perizinanBerusaha,
  pelayananTelunjukSaktiDesa: telunjukSaktiDesa,
  pelayananPendudukNonPermanen: pendudukNonPermanen,
  ajukanPermohonan,
});

export default stateLayananDesa;
