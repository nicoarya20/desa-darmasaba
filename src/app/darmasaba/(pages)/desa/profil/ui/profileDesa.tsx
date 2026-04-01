import colors from '@/con/colors';
import { Box, Center, Paper } from '@mantine/core';

function ProfileDesa() {
  return (
    <Box>
      <Center>
          <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
            <Center>
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15780.3751228292!2d115.19559210934409!3d-8.586981700000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd23eb932812c81%3A0x5b5ac2759cc5fe4b!2sKantor%20Perbekel%20Darmasaba!5e0!3m2!1sid!2sid!4v1741922475983!5m2!1sid!2sid" width="600" height="450" style={{ border: 2, width: "100%" }} loading="lazy" />
            </Center>
          </Paper>
        </Center>
    </Box>
  );
}

export default ProfileDesa;
