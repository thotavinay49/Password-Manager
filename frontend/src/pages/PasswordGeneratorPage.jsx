// src/pages/PasswordGeneratorPage.jsx
import PasswordGenerator from "../components/credential/PasswordGenerator";
import Sidebar           from "../components/layout/Sidebar";
import { useTheme }      from "../context/ThemeContext";

export default function PasswordGeneratorPage() {
  const { theme, choose } = useTheme();   // choose helper comes from ThemeContext

  return (
    <div className={`min-h-screen ${choose("bg-gray-50", "bg-gray-900")}`}>
      <Sidebar active="generator" />

      <main className="ml-64 p-8">
        <PasswordGenerator />
      </main>
    </div>
  );
}
