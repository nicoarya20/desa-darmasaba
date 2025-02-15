import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Image } from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";


const FlipOnScroll = () => {
  // Menggunakan hook useScroll untuk mendeteksi posisi scroll
  const { scrollYProgress } = useScroll();

  // Menggunakan useTransform untuk mengubah nilai scroll menjadi rotasi
  const rotate = useTransform(scrollYProgress, [0, 1], [10, 360 * 1]); // Rotasi dari 0 hingga 360 derajat

  useShallowEffect(() => {
    rotate.on("change", (latest) => {
      console.log(latest)
    })
  }, [])
  return (
    <div style={{ backgroundColor: "gray", padding: "50px" }}>
      <h1>Scroll ke bawah untuk melihat animasi flip</h1>

      <motion.div
        style={{
          width: "500px",
          height: "500px",
          backgroundColor: "blue",
          borderRadius: "10px",

        }}
      >
        <Image src={"https://awsimages.detik.net.id/community/media/visual/2023/04/14/gambar-pemandangan-6_169.jpeg?w=1200"} alt="a" />
      </motion.div>

    </div>
  );
};

export default FlipOnScroll;