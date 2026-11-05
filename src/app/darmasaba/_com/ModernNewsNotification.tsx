"use client";

import {
  ActionIcon,
  Badge,
  Box,
  CloseButton,
  Group,
  Paper,
  Stack,
  Text,
  Transition,
} from "@mantine/core";
import { IconBell, IconChevronRight } from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// === Tipe yang bisa diimpor di tempat lain ===
export interface KategoriBerita {
  id: string;
  name: string;
}

export interface KategoriPengumuman {
  id: string;
  name: string;
}

export interface NewsItem {
  id: string;
  type: "berita" | "pengumuman";
  title: string;
  content: string;
  timestamp?: string | Date;
  kategoriBerita?: KategoriBerita;
  kategoriPengumuman?: KategoriPengumuman;
}

export interface ModernNewsNotificationProps {
  news: NewsItem[];
  hasNewContent?: boolean;
  newItemCount?: number;
  onSeen?: () => void;
  autoShowDelay?: number;
}

// Panel & toast fixed harus di atas konten Beranda (section z-index 2, input Footer z-index 1)
// tapi di bawah Navbar (z-index 100). Tanpa nilai ini (auto) panel tertimpa elemen ber-posisi
// yang muncul belakangan di DOM, mis. kolom email "Berlangganan Info" di Footer.
const NEWS_PANEL_Z_INDEX = 50;

// === Helper ===
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

// === Komponen Utama ===
export default function ModernNewsNotification({
  news = [],
  hasNewContent = false,
  newItemCount = 0,
  onSeen,
  autoShowDelay = 2000,
}: ModernNewsNotificationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [toastVisible, setToastVisible] = useState(false);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(hasNewContent);
  const [hasShownToast, setHasShownToast] = useState(false);
  const [iconVisible, setIconVisible] = useState(true);

  // Sinkronisasi prop eksternal
  useEffect(() => {
    setHasNewNotifications(hasNewContent);
  }, [hasNewContent]);

  // Tampilkan toast pertama kali
  useEffect(() => {
    if (news.length > 0 && !toastVisible && !hasShownToast) {
      const timer = setTimeout(() => {
        setToastVisible(true);
        setHasShownToast(true);
        if (hasNewNotifications) onSeen?.();
      }, autoShowDelay);
      return () => clearTimeout(timer);
    }
  }, [news.length, autoShowDelay, toastVisible, hasShownToast, hasNewNotifications, onSeen]);

  // Sembunyikan toast otomatis
  useEffect(() => {
    if (toastVisible) {
      const timer = setTimeout(() => setToastVisible(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [toastVisible]);

  // Kontrol visibilitas ikon saat scroll
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const HIDE_THRESHOLD = 100;
    const SHOW_THRESHOLD = 50;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY ? "down" : "up";

      if (scrollDirection === "down" && currentScrollY > HIDE_THRESHOLD) {
        setIconVisible(false);
      } else if (scrollDirection === "up" && currentScrollY < SHOW_THRESHOLD) {
        setIconVisible(true);
      }

      if (currentScrollY > 150 && toastVisible) {
        setToastVisible(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [toastVisible]);

  const currentNews = news[0];

  // 🔗 Arahkan ke detail dengan kategori aman
  const handleNotificationClick = (item: NewsItem) => {
    setWidgetOpen(false);
    onSeen?.();

    if (item.type === "berita") {
      const kategori = item.kategoriBerita?.name || "umum";
      const safeKategori = encodeURIComponent(kategori);
      router.push(`/darmasaba/desa/berita/${safeKategori}/${item.id}`);
    } else if (item.type === "pengumuman") {
      const kategori = item.kategoriPengumuman?.name || "umum";
      const safeKategori = encodeURIComponent(kategori);
      router.push(`/darmasaba/desa/pengumuman/${safeKategori}/${item.id}`);
    }
  };

  const handleLihatSemua = () => {
    setToastVisible(false);
    setWidgetOpen(true);
    setHasNewNotifications(false);
    onSeen?.();
  };

  const handleDismissToast = (e: React.MouseEvent) => {
    e.stopPropagation();
    setToastVisible(false);
    onSeen?.();
  };

  // Hanya tampilkan di landing page
  if (pathname !== "/darmasaba") return null;

  return (
    <>
      {/* Floating Bell Icon */}
      <Transition mounted={iconVisible} transition="slide-down" duration={200}>
        {(transitionStyles) => (
          <Box
            style={{
              ...transitionStyles,
              position: "fixed",
              bottom: "24px",
              right: "24px",
              zIndex: 1
            }}
          >
            <ActionIcon
              size="xl"
              radius="xl"
              variant="filled"
              color="#1e5a7e"
              onClick={() => {
                setWidgetOpen((open) => !open);
                setHasNewNotifications(false);
                onSeen?.();
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
          <Box>
            <Box hiddenFrom="md">
              <Paper
                style={{
                  ...styles,
                  position: "fixed",
                  zIndex: NEWS_PANEL_Z_INDEX,
                  bottom: "100px",
                  left: "24px",
                  width: "90vw",
                  maxWidth: 380,
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
                      <Text c="white" fw={600} size="md">
                        Berita & Pengumuman
                      </Text>
                    </Group>
                    <CloseButton
                      onClick={() => {
                        setWidgetOpen(false);
                        onSeen?.();
                      }}
                      variant="transparent"
                      c="white"
                    />
                  </Group>
                </Box>

                <Box style={{ maxHeight: "400px", overflowY: "auto", padding: "12px" }}>
                  {news.length === 0 ? (
                    <Box p="xl" style={{ textAlign: "center" }}>
                      <Text c="dimmed" size="sm">
                        Tidak ada berita terbaru
                      </Text>
                    </Box>
                  ) : (
                    <Stack gap="xs">
                      {news.map((item) => (
                        <Paper
                          key={item.id}
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
                              {item.type === "berita" ? "Berita" : "Pengumuman"}
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
            </Box>
           <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
              <Paper
                style={{
                  ...styles,
                  position: "fixed",
                  zIndex: NEWS_PANEL_Z_INDEX,
                  bottom: "100px",
                  right: "24px",
                  width: "90vw",
                  maxWidth: 380,
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
                      <Text c="white" fw={600} size="md">
                        Berita & Pengumuman
                      </Text>
                    </Group>
                    <CloseButton
                      onClick={() => {
                        setWidgetOpen(false);
                        onSeen?.();
                      }}
                      variant="transparent"
                      c="white"
                    />
                  </Group>
                </Box>

                <Box style={{ maxHeight: "400px", overflowY: "auto", padding: "12px" }}>
                  {news.length === 0 ? (
                    <Box p="xl" style={{ textAlign: "center" }}>
                      <Text c="dimmed" size="sm">
                        Tidak ada berita terbaru
                      </Text>
                    </Box>
                  ) : (
                    <Stack gap="xs">
                      {news.map((item) => (
                        <Paper
                          key={item.id}
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
                              {item.type === "berita" ? "Berita" : "Pengumuman"}
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
            </Box>
          </Box>
        )}
      </Transition>

      {/* Toast Notification */}
      <Box>
        <Box hiddenFrom="md">
          <Transition
            mounted={toastVisible && !!currentNews}
            transition="slide-left"
            duration={300}
          >
            {(styles) => (
              <Paper
                style={{
                  ...styles,
                  position: "fixed",
                  zIndex: NEWS_PANEL_Z_INDEX,
                  bottom: "100px",
                  left: "24px",
                  width: "90vw",
                  maxWidth: 380,
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
                    >
                      {currentNews?.type === "berita"
                        ? "Berita Terbaru"
                        : "Pengumuman"}
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
                      {news.length > 1 ? `${news.length} berita tersedia` : "1 berita"}
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
        </Box>
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
        <Transition
        mounted={toastVisible && !!currentNews}
        transition="slide-right"
        duration={300}
      >
        {(styles) => (
          <Paper
            style={{
              ...styles,
              position: "fixed",
              zIndex: NEWS_PANEL_Z_INDEX,
              bottom: "100px",
              right: "24px",
              width: "90vw",
              maxWidth: 380,
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
                >
                  {currentNews?.type === "berita"
                    ? "Berita Terbaru"
                    : "Pengumuman"}
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
                  {news.length > 1 ? `${news.length} berita tersedia` : "1 berita"}
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
        </Box>
      </Box>
    </>
  );
}