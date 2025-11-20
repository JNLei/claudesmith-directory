import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClaudeSmith Directory | Claude Code Tools Repository",
  description: "Discover and explore hooks, skills, agents, and slash commands for Claude Code. A comprehensive directory of tools to enhance your AI-powered development workflow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
