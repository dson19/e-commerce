import React from 'react';
import { CATEGORIES } from '../../../data/mockData';
function SideBar() {
  return (
    <aside className="w-[220px] bg-white rounded-lg shadow-sm h-fit hidden lg:block overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 font-bold text-gray-700 text-sm uppercase">Danh mục</div>
      <ul>
        {CATEGORIES.map(cat => (
          <li key={cat.id} className="hover:bg-gray-50 border-b border-gray-50 last:border-0">
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-primary hover:font-medium transition-all">
              {cat.icon} {cat.name}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
export default SideBar;