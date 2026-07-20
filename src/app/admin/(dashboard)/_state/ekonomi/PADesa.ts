import { proxy } from "valtio";
import ApbDesa from "./PADesa/apb-desa";
import belanja from "./PADesa/belanja";
import pembiayaan from "./PADesa/pembiayaan";
import pendapatan from "./PADesa/pendapatan";

const PendapatanAsliDesa = proxy({
  ApbDesa,
  belanja,
  pembiayaan,
  pendapatan,
});

export default PendapatanAsliDesa;
