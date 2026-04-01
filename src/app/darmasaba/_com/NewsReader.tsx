'use client';
import { Button } from '@mantine/core';
import { IconMusic, IconMusicOff } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

const NewsReader = () => {
  const [isPointerMode, setIsPointerMode] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speakText = (text: string) => {
    if (!window.speechSynthesis || !text.trim()) return;

    window.speechSynthesis.cancel(); // hentikan sebelumnya
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 1;
    utterance.pitch = 1;
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Tambahkan listener hover ke semua elemen teks
  useEffect(() => {
    const content = document.getElementById('news-title');
    if (!content) return;

    // Atur cursor saat mode aktif/nonaktif
    if (isPointerMode) {
      content.style.cursor = 'pointer';
    } else {
      content.style.cursor = 'auto';
    }

    if (!isPointerMode) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // opsional: hanya baca teks dari elemen tertentu
      if (target && target.innerText) {
        speakText(target.innerText);
        target.style.backgroundColor = '#eef6ff'; // highlight biar keliatan
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target) target.style.backgroundColor = ''; // hilangkan highlight
      window.speechSynthesis.cancel();
    };

    content.addEventListener('mouseover', handleMouseOver);
    content.addEventListener('mouseout', handleMouseOut);

    return () => {
      content.removeEventListener('mouseover', handleMouseOver);
      content.removeEventListener('mouseout', handleMouseOut);
      content.style.cursor = 'auto'; // reset cursor saat mode dimatikan
      window.speechSynthesis.cancel();
    };
  }, [isPointerMode]);

  useEffect(() => {
    const content = document.getElementById('news-content');
    if (!content) return;

    // Atur cursor saat mode aktif/nonaktif
    if (isPointerMode) {
      content.style.cursor = 'pointer';
    } else {
      content.style.cursor = 'auto';
    }

    if (!isPointerMode) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // opsional: hanya baca teks dari elemen tertentu
      if (target && target.innerText) {
        speakText(target.innerText);
        target.style.backgroundColor = '#eef6ff'; // highlight biar keliatan
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target) target.style.backgroundColor = ''; // hilangkan highlight
      window.speechSynthesis.cancel();
    };

    content.addEventListener('mouseover', handleMouseOver);
    content.addEventListener('mouseout', handleMouseOut);

    return () => {
      content.removeEventListener('mouseover', handleMouseOver);
      content.removeEventListener('mouseout', handleMouseOut);
      content.style.cursor = 'auto'; // reset cursor saat mode dimatikan
      window.speechSynthesis.cancel();
    };
  }, [isPointerMode]);

 

  const handleToggle = () => {
    setIsPointerMode((prev) => {
      if (prev) {
        window.speechSynthesis.cancel();
      }
      return !prev;
    });
  };

  return (
    <Button
      onClick={handleToggle}
      color="#0B4F78"
      variant="filled"
      size="md"
      mt="md"
      style={{
        zIndex: 500,
        position: 'fixed',
        bottom: '350px',
        left: '0px',
        borderBottomRightRadius: '20px',
        borderTopRightRadius: '20px',
        borderBottomLeftRadius: '0px',
        borderTopLeftRadius: '0px',
      }}
    >
      {isPointerMode ? <IconMusicOff /> : <IconMusic />}
    </Button>
  );
};

export default NewsReader;
