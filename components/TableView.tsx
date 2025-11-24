import React, { useEffect, useRef } from 'react';
import { Organization } from '../types';
import { MapPin, Phone, Mail, Filter } from 'lucide-react';

interface TableViewProps {
  organizations: Organization[];
  selectedOrgId: string | null;
  onSelectOrg: (id: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (category: string) => void;
  availableCategories: string[];
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'Active': return 'Активний';
    case 'Inactive': return 'Неактивний';
    case 'Pending': return 'В очікуванні';
    default: return status;
  }
};

export const TableView: React.FC<TableViewProps> = ({ 
  organizations, 
  selectedOrgId, 
  onSelectOrg,
  filterStatus,
  onFilterStatusChange,
  filterCategory,
  onFilterCategoryChange,
  availableCategories
}) => {
  const selectedRowRef = useRef<HTMLTableRowElement>(null);

  // Auto-scroll to selected row
  useEffect(() => {
    if (selectedOrgId && selectedRowRef.current) {
      selectedRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedOrgId]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Filters Toolbar */}
      <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-3 items-center sticky top-0 z-20">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          <span>Фільтри:</span>
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value)}
          className="text-xs border border-slate-200 rounded px-2 py-1.5 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none cursor-pointer hover:border-slate-300 transition-colors"
        >
          <option value="All">Всі статуси</option>
          <option value="Active">Активні</option>
          <option value="Pending">В очікуванні</option>
          <option value="Inactive">Неактивні</option>
        </select>

        <select
          value={filterCategory}
          onChange={(e) => onFilterCategoryChange(e.target.value)}
          className="text-xs border border-slate-200 rounded px-2 py-1.5 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none cursor-pointer hover:border-slate-300 transition-colors max-w-[200px]"
        >
          <option value="All">Всі категорії</option>
          {availableCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        
        <div className="ml-auto text-xs text-slate-400">
          Знайдено: {organizations.length}
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left whitespace-nowrap md:whitespace-normal">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-3 font-bold text-slate-700 w-1/4 min-w-[250px]">Актори</th>
              <th className="px-6 py-3 font-bold text-slate-700 w-1/3 min-w-[300px]">Послуги</th>
              <th className="px-6 py-3 font-bold text-slate-700 min-w-[150px]">Телефон</th>
              <th className="px-6 py-3 font-bold text-slate-700 min-w-[200px]">Пошта</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {organizations.map((org) => {
              const isSelected = selectedOrgId === org.id;
              return (
                <tr
                  key={org.id}
                  ref={isSelected ? selectedRowRef : null}
                  onClick={() => onSelectOrg(org.id)}
                  className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                    isSelected ? 'bg-teal-50 hover:bg-teal-100' : ''
                  }`}
                >
                  <td className="px-6 py-4 align-top">
                    <div className={`font-bold text-base mb-1 whitespace-normal ${isSelected ? 'text-teal-900' : 'text-slate-900'}`}>
                      {org.name}
                    </div>
                    <div className="text-slate-500 text-xs flex items-center gap-1 mb-1 whitespace-normal">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {org.address}
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                       org.status === 'Active' ? 'bg-green-100 text-green-800' : 
                       org.status === 'Inactive' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getStatusLabel(org.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top text-slate-700">
                    <div className={`text-sm leading-relaxed p-2 rounded-md border whitespace-normal ${isSelected ? 'bg-white border-teal-100 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                      {org.services}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <a href={`tel:${org.phone}`} className="font-mono text-xs hover:underline hover:text-teal-700">
                        {org.phone}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <a href={`mailto:${org.email}`} className="text-xs hover:underline hover:text-teal-700 truncate block max-w-[180px]" title={org.email}>
                        {org.email}
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};