'use client';
import { Button } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';

const NewsReader = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Fungsi untuk membaca teks
  const speakText = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Browser tidak mendukung SpeechSynthesis.');
      return;
    }

    const contentElement = document.getElementById('news-content');
    const rawText = contentElement?.innerText || '';
    if (!rawText.trim()) return;

    // Hentikan semua suara sebelumnya
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(rawText);
    utterance.lang = 'id-ID';
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    utteranceRef.current = utterance;

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Autoplay gagal karena kebijakan browser:', err);
    }
  };

  // Auto play jika sudah pernah diizinkan
  useEffect(() => {
    const hasPermission = localStorage.getItem('ttsAllowed') === 'true';
    setIsAllowed(hasPermission);

    if (hasPermission) {
      const trySpeak = setInterval(() => {
        const contentElement = document.getElementById('news-content');
        if (contentElement && contentElement.innerText.trim()) {
          speakText();
          clearInterval(trySpeak);
        }
      }, 1000);
      return () => clearInterval(trySpeak);
    }
  }, []);

  // Hentikan suara saat user keluar halaman / komponen unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    };
  }, []);

  // Handle tombol manual
  const handleToggle = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      if (!isAllowed) {
        localStorage.setItem('ttsAllowed', 'true');
        setIsAllowed(true);
      }
      speakText();
    }
  };

  return (
    <Button
      onClick={handleToggle}
      color="#0B4F78"
      variant="filled"
      radius="xl"
      size="md"
      mt="md"
    >
      {isSpeaking ? '🔇 Hentikan Suara' : '🔊 Dengarkan Berita'}
    </Button>
  );
};

export default NewsReader;
