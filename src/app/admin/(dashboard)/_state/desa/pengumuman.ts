import { proxy } from "valtio";
import category from "./pengumuman/category-pengumuman";
import pengumuman from "./pengumuman/pengumuman";

const stateDesaPengumuman = proxy({ category, pengumuman });

export default stateDesaPengumuman;
