import { Stack } from "@mantine/core";
import ListImage from "../_com/ListImage";
import UploadImage from "../_com/UploadImage";

export default function Page() {
  return (
    <Stack>
      <UploadImage />
      <ListImage />
    </Stack>
  );
}
