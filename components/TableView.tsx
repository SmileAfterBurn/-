import React from 'react';
import { Organization } from '../types';
import { Folder, MapPin, Phone, Mail } from 'lucide-react';

interface TableViewProps {
  organizations: Organization[];
  selectedOrgId: string | null;
  onSelectOrg: (id: string) => void;
}

export const TableView: React.FC<TableViewProps> = ({ organizations, selectedOrgId, onSelectOrg }) => {
  return (
    <div className="h-full overflow-auto bg-white">
      <table className="w-full text-sm text-left whitespace-nowrap md:whitespace-normal">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="px-6 py-3 font-bold text-slate-700 w-1/4 min-w-[250px]">Актори</th>
            <th className="px-6 py-3 font-bold text-slate-700 w-1/3 min-w-[300px]">Послуги</th>
            <th className="px-6 py-3 font-bold text-slate-700 min-w-[150px]">Телефон</th>
            <th className="px-6 py-3 font-bold text-slate-700 min-w-[200px]">Пошта</th>
            <th className="px-6 py-3 font-bold text-slate-700 text-right min-w-[100px]">Зв'язок</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {organizations.map((org) => (
            <tr
              key={org.id}
              onClick={() => onSelectOrg(org.id)}
              className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                selectedOrgId === org.id ? 'bg-teal-50 hover:bg-teal-100' : ''
              }`}
            >
              <td className="px-6 py-4 align-top">
                <div className="font-bold text-slate-900 text-base mb-1 whitespace-normal">{org.name}</div>
                <div className="text-slate-500 text-xs flex items-center gap-1 mb-1 whitespace-normal">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {org.address}
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                   org.status === 'Active' ? 'bg-green-100 text-green-800' : 
                   org.status === 'Inactive' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {org.category}
                </span>
              </td>
              <td className="px-6 py-4 align-top text-slate-700">
                <div className="text-sm leading-relaxed bg-slate-50 p-2 rounded-md border border-slate-100 whitespace-normal">
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
              <td className="px-6 py-4 align-top text-right">
                <a
                  href={org.driveFolderUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 bg-white text-teal-600 hover:text-teal-700 hover:bg-teal-50 font-medium text-xs transition-all px-3 py-1.5 rounded-md border border-teal-200 shadow-sm"
                  title="Відкрити папку Google Drive"
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span>Drive</span>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};