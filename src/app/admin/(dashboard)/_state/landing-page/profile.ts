import { proxy } from "valtio";
import programInovasi from "./profile/program-inovasi";
import pejabatDesa from "./profile/pejabat-desa";
import mediaSosial from "./profile/media-sosial";

const profileLandingPageState = proxy({
  programInovasi,
  pejabatDesa,
  mediaSosial,
});

export default profileLandingPageState;
