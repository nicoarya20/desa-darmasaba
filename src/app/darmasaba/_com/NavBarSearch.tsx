import stateNav from "@/state/state-nav";
import { Container, Stack, TextInput, Tooltip } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

export function NavbarSearch() {
  return (
    <Container
      w={{ base: "100%", md: "80%" }}
      fluid
      py="xl"
      onMouseLeave={stateNav.clear}
    >
      <Stack pt="xl">
        <Tooltip label="Type to search across the site" position="bottom-start" withArrow>
          <TextInput
            autoFocus
            size="lg"
            variant="filled"
            radius="xl"
            placeholder="Search anything..."
            leftSection={<IconSearch size={20} />}
          />
        </Tooltip>
      </Stack>
    </Container>
  );
}
