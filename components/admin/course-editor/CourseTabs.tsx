"use client";

type CourseTabsProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

const tabs = ["Resumen", "Contenido", "Participantes", "Ajustes"];

export default function CourseTabs({ activeTab, onTabChange }: CourseTabsProps) {
  return (
    <div className="mt-6 flex gap-3 border-b">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={activeTab === tab ? "border-b-2 font-bold" : ""}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}