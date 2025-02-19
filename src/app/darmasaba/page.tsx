import LandingPage from "@/app/darmasaba/_com/main-page/landing-page";
import Penghargaan from "@/app/darmasaba/_com/main-page/penghargaan";
import Content3 from "@/app/darmasaba/_com/main-page/layanan";
import Content4 from "@/app/darmasaba/_com/main-page/content-4";
import Content5 from "@/app/darmasaba/_com/main-page/content-5";
import Content6 from "@/app/darmasaba/_com/main-page/content-6";
import colors from "@/con/colors";
// import ApiFetch from "@/lib/api-fetch";
import { Stack } from "@mantine/core";
import Content7 from "@/app/darmasaba/_com/main-page/content-7";

export default function Page() {
  return (
    <Stack bg={colors.grey[1]} gap={"4rem"}>
      <LandingPage />
      <Penghargaan />
      <Content3 />
      <Content4 />
      <Content5 />
      <Content6 />
      <Content7 />
    </Stack>
  );
}
