import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import  type { ReactNode } from "react";
import { useState } from 'react'

const AppLayout = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  return (
    <div className="flex flex-1">
    {/* Sidebar shifts content instead of overlaying */}
    {isSidebarOpen && (
      <Sidebar onClose={() => setIsSidebarOpen(false)} />
    )}
      <div className="flex flex-col flex-1">
      <Topbar onBrandClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
