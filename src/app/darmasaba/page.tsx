import DesaAntiKorupsi from "@/app/darmasaba/_com/main-page/desaantikorupsi";
import Kepuasan from "@/app/darmasaba/_com/main-page/kepuasan";
import LandingPage from "@/app/darmasaba/_com/main-page/landing-page";
import Layanan from "@/app/darmasaba/_com/main-page/layanan";
import Penghargaan from "@/app/darmasaba/_com/main-page/penghargaan";
import Potensi from "@/app/darmasaba/_com/main-page/potensi";
import colors from "@/con/colors";
import SDGS from "./_com/main-page/sdgs";
// import ApiFetch from "@/lib/api-fetch";

import { Stack } from "@mantine/core";
import Apbdes from "./_com/main-page/apbdes";
import Prestasi from "./_com/main-page/prestasi";


export default function Page() {
  return (
    <Stack bg={colors.grey[1]} gap={"4rem"}>
      <LandingPage />
      <Penghargaan />
      <Layanan />
      <Potensi />
      <DesaAntiKorupsi />
      <Kepuasan />
      <SDGS />
      <Apbdes />
      <Prestasi/>
    </Stack>
  );
}
