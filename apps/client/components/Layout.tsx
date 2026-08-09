import React from "react";
import Head from "next/head";
import Sidebar from "./Sidebar";

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

function Layout({ title, children }: LayoutProps) {
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <main className="min-h-screen w-full">
        <div className="flex min-h-screen flex-col bg-[#0F0F0F] lg:flex-row lg:gap-x-6">
          <div className="shrink-0 border-b border-[#222222] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:border-[#222222]">
            <Sidebar />
          </div>
          <div className="min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-6xl p-4 md:p-6 lg:p-8">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Layout;
