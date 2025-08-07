import colors from '@/con/colors';
import { Box, Stack, Paper, Image, Text, ListItem, List } from '@mantine/core';
import React from 'react';

function VisimisiDesa() {
    return (
        <>
            <Box pb={30}>
                <Stack align='center' gap={0}>
                    <Box pb={30}>
                        <Image src={"/darmasaba-icon.png"} alt="" w={{ base: 200, md: 300 }} />
                    </Box>
                    <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
                        <Text c={colors['blue-button']} ta={"center"} fw={"lighter"} fz={"2.5rem"}>Visi Desa</Text>
                        <Text fz={"1.5rem"} ta={"center"} fw={"bold"}>
                            “Mewujudkan Desa Darmasaba yang sejahtera, unggul, religius, berbudaya, dan aman dengan berlandaskan Tri Hita Karana”
                        </Text>
                    </Paper>
                    <Paper my={20} p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
                        <Text c={colors['blue-button']} ta={"center"} fw={"lighter"} fz={"2.5rem"}>Misi Desa</Text>
                        <Box >
                            <List type='ordered'>
                                <ListItem fz={{ base: "md", md: "h3"}} ta={"justify"}>Memperkokoh kerukunan hidup masyarakat dalam jalinan adat, budaya, olahraga, dan agama.</ListItem>
                                <ListItem fz={{ base: "md", md: "h3"}} ta={"justify"}>Meningkatkan kualitas pelayanan publik dengan menerapkan teknologi informasi dan komunikasi terintegrasi.</ListItem>
                                <ListItem fz={{ base: "md", md: "h3"}} ta={"justify"}>Meningkatkan tata kelola pemerintah desa dengan menerapkan prinsip good governance dan good clean goverment.</ListItem>
                                <ListItem fz={{ base: "md", md: "h3"}} ta={"justify"}>Meningkatkan kualitas pendidikan, kesehatan, Keluarga Berencana serta pengelolaan kependudukan.</ListItem>
                                <ListItem fz={{ base: "md", md: "h3"}} ta={"justify"}>Memperkuat usaha mikro kecil dan menengah (UMKM) dan BUMDesa sebagai pilar ekonomi masyarakat.</ListItem>
                                <ListItem fz={{ base: "md", md: "h3"}} ta={"justify"}>Mewujudkan tatanan kehidupan bermasyarakat yang menjunjung tinggi penegakan hukum dan HAM. </ListItem>
                                <ListItem fz={{ base: "md", md: "h3"}} ta={"justify"}>Meningkatkan perlindungan dan pengelolaan terhadap sumber daya alam dan lingkungan hidup.</ListItem>
                                <ListItem fz={{ base: "md", md: "h3"}} ta={"justify"}>Memperkuat daya saing desa melalui peningkatan mutu sumber daya manusia dan infrastruktur desa berbasis potensi desa. </ListItem>
                                <ListItem fz={{ base: "md", md: "h3"}} ta={"justify"}>Meningkatkan sinergisitas potensi budaya, pertanian dalam arti luas dan pariwisata.</ListItem>
                            </List>
                        </Box>
                    </Paper>
                </Stack>
            </Box >
        </>
    );
}

export default VisimisiDesa;
