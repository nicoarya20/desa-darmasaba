import stateNav from "@/state/state-nav";
import { Container, Stack, Tooltip } from "@mantine/core";
import GlobalSearch from "./globalSearch";

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
          <GlobalSearch />
        </Tooltip>
      </Stack>
    </Container>
  );
}
