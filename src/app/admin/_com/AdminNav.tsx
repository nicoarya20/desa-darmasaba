"use client";
import { Button, Stack } from "@mantine/core";
import { Link } from "next-view-transitions";

export default function AdminNav() {
  return (
    <Stack>
      <Button.Group p={"md"}>
        <Button component={Link} href="/admin/images">
          Images
        </Button>
        <Button component={Link} href="/admin/csv">
          CSV
        </Button>
      </Button.Group>
    </Stack>
  );
}
