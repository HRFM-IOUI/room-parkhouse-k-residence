// components/TabMobile.tsx
import React, { useState } from 'react';

const TabMobile = () => {
  const [activeTab, setActiveTab] = useState<string>("weather");

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="tab-mobile">
      <div className="tabs">
        <div
          className={`tab-item ${activeTab === "weather" ? "active" : ""}`}
          onClick={() => handleTabClick("weather")}
        >
          天気予報
        </div>
        <div
          className={`tab-item ${activeTab === "train" ? "active" : ""}`}
          onClick={() => handleTabClick("train")}
        >
          電車運行情報
        </div>
        <div
          className={`tab-item ${activeTab === "traffic" ? "active" : ""}`}
          onClick={() => handleTabClick("traffic")}
        >
          渋滞情報
        </div>
        <div
          className={`tab-item ${activeTab === "society" ? "active" : ""}`}
          onClick={() => handleTabClick("society")}
        >
          社会ニュース
        </div>
        <div
          className={`tab-item ${activeTab === "economy" ? "active" : ""}`}
          onClick={() => handleTabClick("economy")}
        >
          経済ニュース
        </div>
      </div>

      {/* タブの内容 */}
      {activeTab === "weather" && <div>天気予報の内容</div>}
      {activeTab === "train" && <div>電車運行情報の内容</div>}
      {activeTab === "traffic" && <div>渋滞情報の内容</div>}
      {activeTab === "society" && <div>社会ニュースの内容</div>}
      {activeTab === "economy" && <div>経済ニュースの内容</div>}
    </div>
  );
};

export default TabMobile;
