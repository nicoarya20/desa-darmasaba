import { proxy } from "valtio";
import beasiswaPendaftar from "./beasiswaDesa/beasiswa-pendaftar";
import keunggulanProgram from "./beasiswaDesa/keunggulan-program";

const beasiswaDesaState = proxy({ beasiswaPendaftar, keunggulanProgram });

export default beasiswaDesaState;
