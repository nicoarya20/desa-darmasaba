import colors from "@/con/colors";
// import ApiFetch from "@/lib/api-fetch";
import { Stack } from "@mantine/core";
import SpashScreen from "./_com/SpashScreen";

export default function Page() {
  return (
    <Stack bg={colors.grey[1]} gap={"4rem"}>
      <SpashScreen />
    </Stack>
  );
}
