/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import stateLayananDesa from "@/app/admin/(dashboard)/_state/desa/layananDesa";
import colors from "@/con/colors";
import { Carousel } from "@mantine/carousel";
import {
  Box,
  Button,
  Container,
  Divider,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  useMantineTheme
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Autoplay from "embla-carousel-autoplay";
import _ from "lodash";
import { useTransitionRouter } from "next-view-transitions";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useProxy } from "valtio/utils";

const textHeading = {
 title: "Layanan",
 des: "Layanan adalah fitur yang membantu warga desa mengakses berbagai kebutuhan administrasi, informasi, dan bantuan secara cepat, mudah, dan transparan. Dengan fitur ini, semua layanan desa ada dalam genggaman Anda!",
};
function Layanan() {

 return (
   <Stack pos={"relative"} bg={colors.grey[1]} gap={"xl"} py={"md"}>
     <Container w={{ base: "100%", md: "80%" }} p={"md"} >
       <Stack align="center" gap={"0"}>
       <Text fw={"bold"} c={colors["blue-button"]} fz={{ base: "1.8rem", md: "3.4rem" }}>
           {textHeading.title}
         </Text>
         <Text ta={"center"} fz={{ base: "1rem", md: "1.3rem" }}>
           {textHeading.des}
         </Text>
         <Box p={"md"}>
           <Button component={Link} href={"/darmasaba/desa/layanan"} variant="filled" bg={colors["blue-button"]} radius={100}>
             Detail
           </Button>
         </Box>
       </Stack>
     </Container>
     <Slider />
     <Divider />
   </Stack>
 );
}

const height = 720;
function Slider() {
 const state = useProxy(stateLayananDesa)
 const [loading, setLoading] = useState(false);
 const theme = useMantineTheme();
 const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
 const autoplay = useRef(Autoplay({ delay: 2000 }));
 const router = useTransitionRouter()

 useEffect(()=> {
   const loadData = async () => {
     try {
       setLoading(true);
       await state.suratKeterangan.findMany.load()
     } catch (error) {
       console.error('Error loading data:', error);
     } finally {
       setLoading(false);
     }
   }
   loadData()
 }, [])

 const data = (state.suratKeterangan.findMany.data || []).slice(0, 8);

 const slides = data.map((item) => (
   <Carousel.Slide key={item.id} >
     <Paper h={height} pos={"relative"} style={{
       backgroundImage: `url(${item.image?.link})`,
       backgroundSize: "cover",
       backgroundPosition: "center",
       backgroundRepeat: "no-repeat",
     }}>
       <Box
         style={{
           borderRadius: 8,
           zIndex: 0,
         }}
         pos={"absolute"}
         w={"100%"}
         h={"100%"}
         bg={colors.trans.dark[2]}
       />
       <Stack justify="space-between" h={"100%"} gap={0} p={"lg"} pos={"relative"} >
         <Box p={"lg"}>
           <Text

             fw={"bold"}
             c={"white"}
             size={"3.5rem"}
             style={{
               textAlign: "center",
             }}
           >
             {_.startCase(item.name)}
           </Text>
         </Box>
         <Group justify="center">
           <Button onClick={()=> router.push(`/darmasaba/desa/layanan/${item.id}`)} px={46} radius={"100"} size="md" bg={colors["blue-button"]}>
             Detail
           </Button>
         </Group>
       </Stack>
     </Paper>
   </Carousel.Slide>
 ));

 return (
  <Box>
   {loading ? (
    <Skeleton height={height} />
   ) : (
    <Carousel
      plugins={[autoplay.current]}
      onMouseEnter={autoplay.current.stop}
      onMouseLeave={autoplay.current.reset}
      height={height}
      slideSize={{ base: "100%", sm: "50%", md: "33.333333%" }}
      slideGap={{ base: "xl", sm: "md" }}
      loop
      align="start"
      slidesToScroll={mobile ? 1 : 2}
    >
      {slides}
    </Carousel>
   )}
  </Box>
 );
}

export default Layanan;

