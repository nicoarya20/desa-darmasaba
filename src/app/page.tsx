import Content1 from "@/com/main-page/content-1";
import Content2 from "@/com/main-page/content-2";
import Content3 from "@/com/main-page/layanan";
import Content4 from "@/com/main-page/content-4";
import Content5 from "@/com/main-page/content-5";
import Content6 from "@/com/main-page/content-6";
import colors from "@/con/colors";
// import ApiFetch from "@/lib/api-fetch";
import { Stack } from "@mantine/core";
import Content7 from "@/com/main-page/content-7";

export default function Page() {
  return (
    <Stack bg={colors.grey[1]} gap={"4rem"}>
      <Content1 />
      <Content2 />
      <Content3 />
      <Content4 />
      <Content5 />
      <Content6 />
      <Content7 />
    </Stack>
  );
}

// async function Content3Loader() {
//   const { data } = await fetch("/api/layanan").then((v) => v.json());
//   return <Content3 data={data} />;
// }

// async function Content4Loader() {
//   const { data } = await ApiFetch.api.potensi.get();
//   return <Content4 data={data?.data as any} />;
// }
