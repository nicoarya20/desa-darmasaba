import { proxy } from "valtio";
import desaAntikorupsi from "./desaAntiKorupsi/desa-antikorupsi";
import kategoriDesaAntiKorupsi from "./desaAntiKorupsi/kategori-dak";

const korupsiState = proxy({ desaAntikorupsi, kategoriDesaAntiKorupsi });

export default korupsiState;
