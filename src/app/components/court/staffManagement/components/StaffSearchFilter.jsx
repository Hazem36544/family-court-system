import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Plus, UserCircle, Filter, ChevronDown, CheckCircle } from 'lucide-react';
import { Button } from '../../../ui/button'; 
import { filterOptions } from './StaffHelpers';

export function StaffSearchFilter({ 
  staffCount, searchTerm, setSearchTerm, clearSearch, setShowAddModal, setFormErrors, setError,
  filterRole, setFilterRole 
}) {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filterHighlightedIndex, setFilterHighlightedIndex] = useState(-1);
  const filterDropdownRef = useRef(null);

  useEffect(() => {
      const handleClickOutside = (event) => {
          if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
              setIsFilterDropdownOpen(false); setFilterHighlightedIndex(-1);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterKeyDown = (e) => {
      if (!isFilterDropdownOpen) {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsFilterDropdownOpen(true); }
          return;
      }
      if (e.key === 'ArrowDown') { e.preventDefault(); setFilterHighlightedIndex(prev => (prev < filterOptions.length - 1 ? prev + 1 : prev)); } 
      else if (e.key === 'ArrowUp') { e.preventDefault(); setFilterHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev)); } 
      else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (filterHighlightedIndex >= 0 && filterHighlightedIndex < filterOptions.length) {
              setFilterRole(filterOptions[filterHighlightedIndex].value); setIsFilterDropdownOpen(false);
          }
      } else if (e.key === 'Escape') { setIsFilterDropdownOpen(false); setFilterHighlightedIndex(-1); }
  };

  return (
    <div className="flex flex-col gap-5 md:gap-6 bg-white p-4 md:p-6 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
      <div className="flex items-center justify-between pb-4 border-b border-gray-50">
         <div className="flex items-center gap-4">
           <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
             <UserCircle className="w-6 h-6 md:w-7 md:h-7" />
           </div>
           <div>
             <p className="text-gray-500 text-xs font-bold mb-0.5 uppercase tracking-widest">إجمالي الموظفين</p>
             <p className="text-2xl md:text-3xl font-black text-gray-800 font-mono">{staffCount}</p>
           </div>
         </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 pt-2">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="البحث بالاسم أو الإيميل أو الوظيفة..."
            className="w-full pr-12 pl-12 h-12 md:h-14 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-600 text-right font-bold text-sm md:text-base shadow-sm transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={clearSearch} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full transition-colors border-none outline-none cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          {/* فلتر النوع */}
          <div className="relative w-full sm:flex-1 xl:w-56" ref={filterDropdownRef}>
              <div tabIndex={0} onKeyDown={handleFilterKeyDown} onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className={`w-full h-12 md:h-14 px-4 pr-10 rounded-xl flex items-center justify-between outline-none transition-all font-bold text-sm border cursor-pointer shadow-sm ${isFilterDropdownOpen ? 'border-[#1e3a8a] ring-2 ring-[#1e3a8a]/20 bg-white' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}
              >
                  <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <span className="text-gray-800 truncate pl-2">{filterOptions.find(o => o.value === filterRole)?.label}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${isFilterDropdownOpen ? 'rotate-180 text-[#1e3a8a]' : ''}`} />
              </div>
              {isFilterDropdownOpen && (
                  <div className="absolute top-[calc(100%+8px)] right-0 w-full min-w-[200px] bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                      <ul className="py-2 m-0 list-none max-h-60 overflow-y-auto custom-scrollbar">
                          {filterOptions.map((option, index) => (
                              <li key={option.value} onClick={() => { setFilterRole(option.value); setIsFilterDropdownOpen(false); }} onMouseEnter={() => setFilterHighlightedIndex(index)}
                                  className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors flex justify-between items-center ${filterRole === option.value ? 'bg-blue-50 text-[#1e3a8a]' : ''} ${filterHighlightedIndex === index && filterRole !== option.value ? 'bg-gray-50 text-[#1e3a8a]' : 'text-gray-600'}`}
                              >
                                  {option.label}
                                  {filterRole === option.value && <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />}
                              </li>
                          ))}
                      </ul>
                  </div>
              )}
          </div>

          <Button onClick={() => { setShowAddModal(true); setFormErrors({}); setError(null); }} className="flex-1 md:flex-none bg-[#1e3a8a] text-white hover:bg-blue-900 shadow-sm h-12 md:h-14 px-4 md:px-8 rounded-xl gap-2 font-bold transition-all border-none outline-none">
            <Plus className="w-5 h-5 shrink-0" /> <span className="whitespace-nowrap">إضافة موظف</span>
          </Button>
        </div>
      </div>
    </div>
  );
}