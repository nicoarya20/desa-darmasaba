import { Stack } from "@mantine/core";
import AdminNav from "./_com/AdminNav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Stack gap={0}>
      <AdminNav />
      {children}
    </Stack>
  );
}
