"use client";

import { useState, useEffect } from "react";
import { Box, Paper, Text, Group, CloseButton, Badge, ActionIcon, Stack, Transition } from "@mantine/core";
import { IconBell, IconChevronRight } from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";

interface NewsItem {
  id: string | number;
  type: "berita" | "pengumuman";
  title: string;
  content: string;
  timestamp?: string | Date;
}

interface ModernNewsNotificationProps {
  news: NewsItem[];
  hasNewContent?: boolean; // ✅ TAMBAHAN
  newItemCount?: number; // ← tambahkan ini
  onSeen?: () => void;     // ✅ TAMBAHAN
  autoShowDelay?: number;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function ModernNewsNotification({
  news = [],
  hasNewContent = false,
  newItemCount = 0, // 👈 tambahkan ini
  onSeen,
  autoShowDelay = 2000,
}: ModernNewsNotificationProps) {
  const router = useRouter();
  const [toastVisible, setToastVisible] = useState(false);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(hasNewContent);
  const [hasShownToast, setHasShownToast] = useState(false);
  const [iconVisible, setIconVisible] = useState(true);
  const pathname = usePathname();

  // Sinkronisasi dari luar
  useEffect(() => {
    if (hasNewContent) {
      setHasNewNotifications(true);
      // Jangan otomatis tampilkan toast di sini — biarkan saat page load saja
    }
  }, [hasNewContent]);

  // Auto show toast hanya saat page pertama kali load
  useEffect(() => {
    if (news.length > 0 && !toastVisible && !hasShownToast) {
      const timer = setTimeout(() => {
        setToastVisible(true);
        setHasShownToast(true);
        // Jika ada new content, anggap sudah "dilihat" setelah toast muncul
        if (hasNewNotifications) {
          onSeen?.();
        }
      }, autoShowDelay);
      return () => clearTimeout(timer);
    }
  }, [news.length, autoShowDelay, toastVisible, hasShownToast, hasNewNotifications, onSeen]);

  // Auto hide toast
  useEffect(() => {
    if (toastVisible) {
      const timer = setTimeout(() => setToastVisible(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [toastVisible]);

  // Scroll handler
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const HIDE_THRESHOLD = 100;
    const SHOW_THRESHOLD = 50;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';

      if (scrollDirection === 'down' && currentScrollY > HIDE_THRESHOLD) {
        setIconVisible(false);
      } else if (scrollDirection === 'up' && currentScrollY < SHOW_THRESHOLD) {
        setIconVisible(true);
      }

      if (currentScrollY > 150 && toastVisible) {
        setToastVisible(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [toastVisible]);

  const currentNews = news[0];

  const handleNotificationClick = (item: NewsItem) => {
    setWidgetOpen(false);
    onSeen?.(); // ✅ tandai sebagai dilihat
    if (item.type === "berita") {
      router.push("/darmasaba/desa/berita/semua");
    } else if (item.type === "pengumuman") {
      router.push("/darmasaba/desa/pengumuman");
    }
  };

  const handleLihatSemua = () => {
    setToastVisible(false);
    setWidgetOpen(true);
    setHasNewNotifications(false);
    onSeen?.(); // ✅
  };

  const handleDismissToast = (e: React.MouseEvent) => {
    e.stopPropagation();
    setToastVisible(false);
    onSeen?.(); // ✅
  };

  // Only show on landing page
  if (pathname !== '/darmasaba') {
    return null;
  }

  return (
    <>
      {/* Floating Bell Icon */}
      <Transition mounted={iconVisible} transition="slide-down" duration={200}>
        {(transitionStyles) => (
          <Box style={{ ...transitionStyles, position: "fixed", bottom: "24px", right: "24px" }}>
            <ActionIcon
              size="xl"
              radius="xl"
              variant="filled"
              color="#1e5a7e"
              onClick={() => {
                setWidgetOpen(!widgetOpen);
                setHasNewNotifications(false);
                onSeen?.(); // ✅
              }}
              style={{
                width: "60px",
                height: "60px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                position: "relative",
              }}
            >
              <IconBell size={28} />
              {hasNewNotifications && news.length > 0 && (
                <Badge
                  size="sm"
                  variant="filled"
                  color="red"
                  style={{
                    position: "absolute",
                    top: "6px",
                    right: "6px",
                    minWidth: "22px",
                    height: "22px",
                    padding: "0 6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {newItemCount || news.length}
                </Badge>
              )}
            </ActionIcon>
          </Box>
        )}
      </Transition>

      {/* Widget Panel */}
      <Transition mounted={widgetOpen} transition="slide-up" duration={300}>
        {(styles) => (
          <Paper
            style={{
              ...styles,
              position: "fixed",
              bottom: "100px",
              right: "24px",
              width: "380px",
              maxHeight: "500px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <Box
              style={{
                background: "linear-gradient(135deg, #1e5a7e 0%, #2c7da0 100%)",
                padding: "16px 20px",
                color: "white",
              }}
            >
              <Group justify="space-between">
                <Group gap="xs">
                  <IconBell size={20} />
                  <Text c="white" fw={600} size="md">Berita & Pengumuman</Text>
                </Group>
                <CloseButton
                  onClick={() => {
                    setWidgetOpen(false);
                    onSeen?.(); // ✅
                  }}
                  variant="transparent"
                  c="white"
                />
              </Group>
            </Box>

            <Box style={{ maxHeight: "400px", overflowY: "auto", padding: "12px" }}>
              {news.length === 0 ? (
                <Box p="xl" style={{ textAlign: "center" }}>
                  <Text c="dimmed" size="sm">Tidak ada berita terbaru</Text>
                </Box>
              ) : (
                <Stack gap="xs">
                  {news.map((item, index) => (
                    <Paper
                      key={item.id || index}
                      p="md"
                      radius="md"
                      style={{
                        border: "1px solid #e9ecef",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#1e5a7e";
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e9ecef";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                      onClick={() => handleNotificationClick(item)}
                    >
                      <Group justify="space-between" mb="xs">
                        <Badge
                          size="sm"
                          color={item.type === "berita" ? "blue" : "orange"}
                          variant="light"
                        >
                          {item.type === "berita" ? "📰 Berita" : "📢 Pengumuman"}
                        </Badge>
                        <IconChevronRight size={16} color="#adb5bd" />
                      </Group>
                      <Text fw={600} size="sm" mb={4} lineClamp={2}>
                        {item.title || "Tanpa Judul"}
                      </Text>
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {stripHtml(item.content).substring(0, 100)}...
                      </Text>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>
          </Paper>
        )}
      </Transition>

      {/* Toast Notification */}
      <Transition mounted={toastVisible && !!currentNews} transition="slide-left" duration={300}>
        {(styles) => (
          <Paper
            style={{
              ...styles,
              position: "fixed",
              bottom: "100px",
              right: "24px",
              width: "380px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #e9ecef",
            }}
            onClick={handleLihatSemua}
          >
            <Box
              style={{
                height: "3px",
                background: "#1e5a7e",
                animation: "shrink 8s linear forwards",
              }}
            />
            <style>{`
              @keyframes shrink {
                from { width: 100%; }
                to { width: 0%; }
              }
            `}</style>

            <Box p="md">
              <Group justify="space-between" mb="xs">
                <Badge
                  size="md"
                  color={currentNews?.type === "berita" ? "blue" : "orange"}
                  variant="light"
                  leftSection={currentNews?.type === "berita" ? "📰" : "📢"}
                >
                  {currentNews?.type === "berita" ? "Berita Terbaru" : "Pengumuman"}
                </Badge>
                <CloseButton onClick={handleDismissToast} size="sm" />
              </Group>

              <Text fw={600} size="sm" mb={6}>
                {currentNews?.title || "Informasi Terbaru"}
              </Text>

              <Text size="xs" c="dimmed" lineClamp={3}>
                {stripHtml(currentNews?.content || "")}
              </Text>

              <Group justify="space-between" mt="md">
                <Text size="xs" c="dimmed">
                  {news.length > 1 ? `${news.length} berita tersedia` : '1 berita'}
                </Text>
                <Text
                  size="xs"
                  fw={500}
                  c="#1e5a7e"
                  style={{ cursor: "pointer" }}
                  onClick={handleLihatSemua}
                >
                  Lihat Semua →
                </Text>
              </Group>
            </Box>
          </Paper>
        )}
      </Transition>
    </>
  );
}