import { useRef, useState, useEffect } from 'react';
import stateNav from "@/state/state-nav";
import { Container, Stack, ActionIcon, Box } from "@mantine/core";
import { IconX } from '@tabler/icons-react';
import GlobalSearch from "./globalSearch";

export function NavbarSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      // Only close if clicking outside both the search input and results
      if (
        containerRef.current && 
        !containerRef.current.contains(target) &&
        !target.closest('.search-result-item') // Add a class to your search result items
      ) {
        setIsOpen(false);
        stateNav.clear();
      }
    }
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      style={{ position: 'relative' }}
    >
      <Container
        w={{ base: "100%", md: "80%" }}
        fluid
        py="xl"
      >
        <Stack pt="xl">
          <Box style={{ position: 'relative' }}>
            <GlobalSearch />
            {isOpen && (
              <ActionIcon
                onClick={() => {
                  setIsOpen(false);
                  stateNav.clear();
                }}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1000
                }}
              >
                <IconX size={16} />
              </ActionIcon>
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}