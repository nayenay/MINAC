import React from 'react'
import Head from 'next/head'
import Sidebar from './Sidebar'

interface LayoutProps {
    title: string
    children: React.ReactNode
}

function Layout({title, children}: LayoutProps) {
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <main className="h-screen w-full">
        <div className="flex h-full bg-[#0F0F0F] gap-x-7">
          <Sidebar />
          <div className="w-full overflow-y-auto">
            <div className="container p-4">{children}</div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Layout
