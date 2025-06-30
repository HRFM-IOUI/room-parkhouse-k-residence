"use client";
import React, { useState } from "react";

const tabOptions = [
  { label: "記事", value: "article", icon: "📝" },
  { label: "メディア", value: "media", icon: "📸" },
  { label: "アナリティクス", value: "analytics", icon: "📊" }
];

export default function DashboardDropdownTabs({
  onTabChange
}: { onTabChange?: (tab: string) => void }) {
  const [selected, setSelected] = useState(tabOptions[0].value);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelected(e.target.value);
    onTabChange?.(e.target.value);
  };

  return (
    <div style={{
      width: "100vw",
      background: "#e0f1fc",
      padding: "11px 0",
      borderBottom: "1.7px solid #aee6ff",
      position: "sticky",
      top: 0,
      zIndex: 999
    }}>
      <select
        value={selected}
        onChange={handleChange}
        style={{
          fontSize: 19,
          fontWeight: 900,
          padding: "8px 22px",
          borderRadius: 13,
          border: "1.2px solid #aee6ff",
          background: "#fff",
          color: "#268bc6"
        }}
      >
        {tabOptions.map(tab =>
          <option key={tab.value} value={tab.value}>
            {tab.icon} {tab.label}
          </option>
        )}
      </select>
    </div>
  );
}
