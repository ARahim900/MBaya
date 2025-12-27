"use client";

import "./globals.css";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ToastProvider } from "@/components/ui/toast-provider";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AuthProvider } from "@/components/auth/auth-provider";
import { useState, useEffect, createContext, useContext } from "react";
import { usePathname } from "next/navigation";

// Use system font stack instead of Google Fonts to avoid build issues
const inter = {
  className: 'font-sans'
};

// Create context for sidebar state
export const SidebarContext = createContext({
  isCollapsed: false,
  setIsCollapsed: (value: boolean) => { },
});

export const useSidebar = () => useContext(SidebarContext);

// Auth pages that don't need the main layout
const AUTH_PAGES = ["/login", "/signup", "/forgot-password", "/auth"];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  const isAuthPage = AUTH_PAGES.some(page => pathname?.startsWith(page));

  useEffect(() => {
    setIsMounted(true);
    // Auto-collapse on smaller screens
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auth pages have their own layout
  if (isAuthPage) {
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>Muscat Bay Operations</title>
          <meta name="description" content="Operations Dashboard for Muscat Bay" />
        </head>
        <body className={inter.className} suppressHydrationWarning>
          <ToastProvider>
            {children}
          </ToastProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Muscat Bay Operations</title>
        <meta name="description" content="Operations Dashboard for Muscat Bay" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ToastProvider>
          <AuthProvider>
            <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
              <div className="h-full relative overflow-x-hidden">
                {/* Sidebar - fixed position */}
                <div
                  className={`hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[80] transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}
                  style={{
                    backgroundColor: "var(--mb-primary)"
                  }}
                >
                  <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                </div>
                {/* Main content - dynamic padding */}
                <main
                  className={`pb-10 transition-all duration-300 w-full min-w-0 overflow-x-hidden pl-0 ${isMounted ? (isCollapsed ? 'md:pl-20' : 'md:pl-72') : 'md:pl-72'}`}
                >
                  <Topbar />
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                </main>
              </div>
            </SidebarContext.Provider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
