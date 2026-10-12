// src/components/layout/SidebarLayout.jsx
import { useState } from "react";
import Sidebar from "./Sidebar";

export default function SidebarLayout({ children }) {
  const [active, setActive] = useState("credentials");

  return (
    <div className="min-h-screen flex">
      <Sidebar active={active} onSelect={setActive} />
      <main className="ml-64 flex-1">{children}</main>
    </div>
  );
}
