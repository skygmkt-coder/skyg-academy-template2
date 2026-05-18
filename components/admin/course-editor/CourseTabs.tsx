"use client";

type CourseTabsProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

const tabs = ["Resumen", "Contenido", "Participantes", "Ajustes"];

export default function CourseTabs({ activeTab, onTabChange }: CourseTabsProps) {
  return (
    <div className="mt-6 border-b border-gray-200">
      <nav className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`rounded-t-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-black text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </nav>
    </div>
  );
}