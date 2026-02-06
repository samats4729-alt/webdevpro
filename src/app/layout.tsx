import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";
import Providers from "@/components/Providers";
import InteractiveBot from "@/components/layout/InteractiveBot";



const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
    title: "WebDevPro AI - Платформа автоматизации мессенджеров",
    description: "Создайте AI-ассистента для WhatsApp, Telegram и Instagram за несколько кликов",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    {children}

                </Providers>
            </body>
        </html>
    );
}

