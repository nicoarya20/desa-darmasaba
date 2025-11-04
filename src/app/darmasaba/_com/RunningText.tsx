"use client";

import { Box } from "@mantine/core";
import { IconBell } from "@tabler/icons-react";
import { useMemo, useState, useEffect } from "react";

interface RunningTextProps {
  news?: string[];
  speed?: number; // dalam detik (jika mau manual)
  autoSpeed?: boolean; // otomatis sesuaikan speed dengan panjang text
  bgColor?: string;
  textColor?: string;
  maxLength?: number; // max karakter per item
}

// Utility function untuk strip HTML (works on both server and client)
function stripHtmlTags(html: string): string {
  const text = html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/&#8217;/gi, "'")
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/\s+/g, ' ')
    .trim();
  
  return text;
}

export default function RunningText({
  news = [
    "Selamat datang di Portal Desa Darmasaba",
    "Jam operasional kantor: Senin - Jumat 08:00 - 17:00",
  ],
  speed = 20,
  autoSpeed = true,
  bgColor = "#1e5a7e",
  textColor = "white",
  maxLength = 200 // default max 200 karakter per item
}: RunningTextProps) {
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Process news data
  const processedNews = useMemo(() => {
    return news
      .filter(item => item && item.trim() !== "")
      .map(item => {
        let text = stripHtmlTags(item);
        // Limit panjang per item
        if (text.length > maxLength) {
          text = text.substring(0, maxLength) + "...";
        }
        return text;
      })
      .filter(item => item.length > 0);
  }, [news, maxLength]);

  const allNews = processedNews.length > 0 
    ? processedNews.join(" • ") 
    : "Tidak ada pengumuman";

  // Hitung speed berdasarkan mode
  const calculatedSpeed = useMemo(() => {
    if (!autoSpeed) {
      return speed; // Gunakan speed manual
    }

    // Auto speed: berdasarkan panjang text
    const textLength = allNews.length;
    
    // Formula yang lebih natural:
    // - Text pendek (< 100 char): 15 detik
    // - Text sedang (100-300 char): 20-30 detik  
    // - Text panjang (> 300 char): 30-45 detik
    let calculatedTime;
    
    if (textLength < 100) {
      calculatedTime = 15;
    } else if (textLength < 300) {
      calculatedTime = 15 + ((textLength - 100) / 200) * 15; // 15-30 detik
    } else {
      calculatedTime = 30 + Math.min(((textLength - 300) / 500) * 15, 15); // 30-45 detik max
    }
    
    return Math.round(calculatedTime);
  }, [allNews, speed, autoSpeed]);

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <Box
        style={{
          backgroundColor: bgColor,
          overflow: "hidden",
          position: "relative",
          width: "100%",
          padding: "12px 0",
          borderBottom: "2px solid rgba(255, 255, 255, 0.1)"
        }}
      >
        <div style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "8px",
          whiteSpace: "nowrap"
        }}>
          <IconBell size={20} color={textColor} style={{ flexShrink: 0 }} />
          <span style={{ 
            color: textColor, 
            fontSize: "15px", 
            fontWeight: 500,
            whiteSpace: "nowrap"
          }}>
            Memuat pengumuman...
          </span>
        </div>
      </Box>
    );
  }

  return (
    <Box
      style={{
        backgroundColor: bgColor,
        overflow: "hidden",
        position: "relative",
        width: "100%",
        padding: "12px 0",
        borderBottom: "2px solid rgba(255, 255, 255, 0.1)"
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes scrollText {
            0% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
          
          .running-text-wrapper {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
            animation: scrollText ${calculatedSpeed}s linear infinite;
          }

          .running-text-wrapper:hover {
            animation-play-state: paused;
            cursor: pointer;
          }

          .running-text-content {
            color: ${textColor};
            font-size: 18px;
            font-weight: 500;
            white-space: nowrap;
          }
        `
      }} />
      
      <div className="running-text-wrapper">
        <IconBell size={20} color={textColor} style={{ flexShrink: 0 }} />
        <span className="running-text-content">
          {allNews}
        </span>
      </div>
    </Box>
  );
}