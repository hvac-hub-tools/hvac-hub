import { useState } from 'react';
import { Printer } from 'lucide-react';
import { useVentilationTheme as useTheme } from './VentilationGuide';

export default function PrintHeader({ elementDescription }: { elementDescription: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  const [info, setInfo] = useState({
    project: '',
    areaProject: '',
    elementDescription,
    pageNumber: '',
    revision: '',
    preparedBy: '',
    preparedDate: '',
    checkedBy: '',
    checkedDate: '',
  });

  const update = (field: keyof typeof info, value: string) =>
    setInfo((prev) => ({ ...prev, [field]: value }));

  const handlePrint = () => {
    if (isDark) {
      toggle();
      setTimeout(() => {
        window.print();
        toggle();
      }, 150);
    } else {
      window.print();
    }
  };

  const cellLabel = `border px-3 py-2 text-xs font-bold ${
    isDark ? 'border-slate-700 bg-slate-800/70 text-slate-300' : 'border-slate-300 bg-slate-100 text-slate-700'
  }`;
  const cellInput = `border px-1 py-1 ${isDark ? 'border-slate-700' : 'border-slate-300'}`;
  const inputCls = `w-full bg-transparent px-2 py-1 text-xs outline-none ${
    isDark
      ? 'text-slate-100 placeholder:text-slate-600'
      : 'text-slate-900 placeholder:text-slate-400'
  }`;

  return (
    <div
      className={`overflow-hidden rounded-2xl ring-1 print:rounded-none print:ring-0 ${
        isDark ? 'bg-slate-900/60 ring-slate-800' : 'bg-white ring-slate-200 shadow-sm'
      }`}
    >
      <div className={`flex items-center justify-between border-b p-4 print:hidden ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>Document Information</span>
          <p className={`mt-0.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Fill in project details — they will appear on the printout header
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:from-cyan-600 hover:to-blue-700"
        >
          <Printer className="h-4 w-4" /> Print / Save PDF
        </button>
      </div>

      {/* Excel-style header block */}
      <div className="p-4 print:p-0">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className={`${cellLabel} w-40`}>Project</td>
              <td className={cellInput} colSpan={3}>
                <input
                  value={info.project}
                  onChange={(e) => update('project', e.target.value)}
                  placeholder="Enter project name"
                  className={inputCls}
                />
              </td>
              <td className={`${cellLabel} w-32`}>Page Number</td>
              <td className={`${cellInput} w-52`}>
                <input
                  value={info.pageNumber}
                  onChange={(e) => update('pageNumber', e.target.value)}
                  placeholder="e.g. HVAC-CAL-001"
                  className={inputCls}
                />
              </td>
            </tr>
            <tr>
              <td className={cellLabel}>Area Project</td>
              <td className={cellInput} colSpan={3}>
                <input
                  value={info.areaProject}
                  onChange={(e) => update('areaProject', e.target.value)}
                  placeholder="e.g. Residential Tower / Commercial Block"
                  className={inputCls}
                />
              </td>
              <td className={cellLabel}>Revision</td>
              <td className={cellInput}>
                <input
                  value={info.revision}
                  onChange={(e) => update('revision', e.target.value)}
                  placeholder="e.g. R0"
                  className={inputCls}
                />
              </td>
            </tr>
            <tr>
              <td className={cellLabel} rowSpan={2}>Element Description</td>
              <td className={cellInput} colSpan={3} rowSpan={2}>
                <input
                  value={info.elementDescription}
                  onChange={(e) => update('elementDescription', e.target.value)}
                  placeholder="e.g. Ventilation Calculation"
                  className={inputCls}
                />
              </td>
              <td className={cellLabel}>Prepared by</td>
              <td className={cellInput}>
                <input
                  value={info.preparedBy}
                  onChange={(e) => update('preparedBy', e.target.value)}
                  placeholder="Enter name / initials"
                  className={inputCls}
                />
              </td>
            </tr>
            <tr>
              <td className={cellLabel}>Date</td>
              <td className={cellInput}>
                <input
                  type="date"
                  value={info.preparedDate}
                  onChange={(e) => update('preparedDate', e.target.value)}
                  className={inputCls}
                />
              </td>
            </tr>
            <tr>
              <td className={cellLabel} colSpan={2}></td>
              <td className={cellInput} colSpan={2}></td>
              <td className={cellLabel}>Checked by</td>
              <td className={cellInput}>
                <input
                  value={info.checkedBy}
                  onChange={(e) => update('checkedBy', e.target.value)}
                  placeholder="Enter name / initials"
                  className={inputCls}
                />
              </td>
            </tr>
            <tr>
              <td className={cellLabel} colSpan={2}></td>
              <td className={cellInput} colSpan={2}></td>
              <td className={cellLabel}>Date</td>
              <td className={cellInput}>
                <input
                  type="date"
                  value={info.checkedDate}
                  onChange={(e) => update('checkedDate', e.target.value)}
                  className={inputCls}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
