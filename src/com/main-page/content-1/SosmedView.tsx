import images from "@/con/images";
import { Flex, ActionIcon, Image } from "@mantine/core";

function SosmedView() {
  const listSosmed = Object.values(images.sosmed);
  return (
    <Flex gap={"md"}>
      {listSosmed.map((item, k) => {
        return (
          <ActionIcon
            variant="transparent"
            key={k}
            w={32}
            h={32}
            pos={"relative"}
          >
            <Image src={item} alt="icon" loading="lazy" fit="contain" />
          </ActionIcon>
        );
      })}
    </Flex>
  );
}

export default SosmedView;
