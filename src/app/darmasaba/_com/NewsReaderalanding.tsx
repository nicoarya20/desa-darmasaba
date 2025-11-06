'use client';
import { Button } from '@mantine/core';
import { IconMusic, IconMusicOff } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

const NewsReaderLanding = () => {
  const [isPointerMode, setIsPointerMode] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTextRef = useRef<string>('');

  const speakText = (text: string) => {
    if (!window.speechSynthesis || !text.trim()) return;

    // Jangan baca ulang kalau teksnya sama
    if (lastTextRef.current === text) return;
    lastTextRef.current = text;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 1;
    utterance.pitch = 1;

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const root = document.getElementById('page-root');
    if (!root) return;

    root.style.cursor = isPointerMode ? 'pointer' : 'auto';
    if (!isPointerMode) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target ||
        !target.innerText ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'SVG' ||
        target.closest('button')
      )
        return;

      // Hapus timeout sebelumnya biar gak spam
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // Delay dikit biar smooth (hindari brebet)
      timeoutRef.current = setTimeout(() => {
        speakText(target.innerText);
      }, 250); // 250ms delay kasih waktu pindah cursor
    };

    const handleMouseOut = () => {
      // Delay kecil sebelum cancel supaya gak motong kasar
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        window.speechSynthesis.cancel();
        lastTextRef.current = '';
      }, 150);
    };

    root.addEventListener('mouseover', handleMouseOver);
    root.addEventListener('mouseout', handleMouseOut);

    return () => {
      root.removeEventListener('mouseover', handleMouseOver);
      root.removeEventListener('mouseout', handleMouseOut);
      root.style.cursor = 'auto';
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.speechSynthesis.cancel();
      lastTextRef.current = '';
    };
  }, [isPointerMode]);

  const handleToggle = () => {
    setIsPointerMode((prev) => {
      if (prev) {
        window.speechSynthesis.cancel();
        lastTextRef.current = '';
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
        position: 'fixed',
        bottom: '350px',
        left: '0px',
        borderBottomRightRadius: '20px',
        borderTopRightRadius: '20px',
        transition: 'all 0.3s ease',
      }}
    >
      {isPointerMode ? <IconMusicOff /> : <IconMusic />}
    </Button>
  );
};

export default NewsReaderLanding;
