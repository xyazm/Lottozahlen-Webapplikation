import React, { useRef, useState } from 'react';
import { useLottoManagement } from '../../hooks/useLottoManagement';
import DownSvg from '../../assets/down.svg';
import UpSvg from '../../assets/up.svg';
import Button from '../../components/Button';
import { ReactComponent as HelpSvg } from '../../assets/help.svg';
import { ReactComponent as ControllerNextSvg } from '../../assets/controller-next.svg';
import { ReactComponent as ControllerPrevSvg } from '../../assets/controller-jump-to-start.svg';

const LottoManagement = () => {
  const {
    tableData,
    currentPage,
    totalPages,
    handleNextPage,
    handlePreviousPage,
    searchQuery,
    setSearchQuery,
    filterColumns,
    handleFilterChange,
    toggleFilterDropdown,
    isFilterOpen,
    handleSort,
    handleSearch,
    sortConfig,
    dropdownRef
  } = useLottoManagement();
  const [showTooltip, setShowTooltip] = useState(false);

  const toggleTooltip = () => {
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 5000);
  };

  const columnOptions = [
    { key: 'feedback_id', label: 'ID', width: '8%', sortable: true }, 
    { key: 'lottoschein_ids', label: 'L-IDs', width: '10%', sortable: true }, 
    { key: 'lottoscheine', label: 'Lottoscheine', width: '20%', sortable: false },
    { key: 'feedback_text', label: 'Feedback', width: '40%', sortable: false }, 
    { key: 'student_id', label: 'S-ID', width: '8%', sortable: true },
    { key: 'student_name', label: 'Name', width: '17%', sortable: true }, 
  ];

  return (
    <div className="p-6 min-h-screen">
      {/* Suchfeld und Filterleiste */}
      <div className="flex items-center gap-4 mb-6 py-2">
        <input
          type="text"
          placeholder="Suche nach ID, Name oder Lottoschein..."
          className="p-2 border border-gray-300 rounded-lg flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {/* Tooltip-Button */}
  <div className="relative">
      <div className="cursor-pointer" onClick={toggleTooltip}>
        <HelpSvg className="w-4 fill-rubBlue hover:fill-gray-300" />
      </div>

    {/* Tooltip-Inhalt */}
    {showTooltip && (
      <div className="absolute left-[20px] top-[-10px] z-50 p-3 bg-gray-900 text-white border border-gray-300 rounded shadow-lg w-80">
        <h4 className="text-sm font-semibold mb-2">Suchanleitung:</h4>
        <ul className="text-xs list-disc list-inside">
          <li><b>student_id</b>: Suche nach einem Studenten anhand der ID, z.B. <i>student_id:17</i></li>
          <li><b>student_name</b>: Suche nach einem Namen, z.B. <i>student_name:Mustermann</i></li>
          <li><b>feedback_id</b>: Suche nach einer ID, z.B. <i>feedback_id:17</i></li>
          <li><b>lottoschein_ids</b>: Suche nach Lotto-IDs, z.B. <i>lottoschein_ids:123</i></li>
          <li><b>lottoscheine</b>: Suche nach bestimmten Zahlen, z.B. <i>lottoscheine:34,35</i></li>
          Um die Suche rückgängig zu machen und alle Einträge zu sehen, müssen Sie die such Leiste leeren und dann auf 'suchen' klicken.
        </ul>
      </div>
    )}
  </div>
        <Button buttonId='button-search-db' text='Suchen' onClick={handleSearch} className='h-10 px-4'/>

        {/* Dropdown-Filter */}
        <div className="relative" ref={dropdownRef}>
          <Button buttonId='button-filter-db' text='Filter' onClick={toggleFilterDropdown} className='h-10 px-4 !bg-gray-200 !text-gray-400'/>
          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {columnOptions.map((option) => (
                <label key={option.key} className="flex items-center p-2 hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={filterColumns.includes(option.key)}
                    onChange={() => handleFilterChange(option.key)}
                    className="mr-2"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabelle */}
      <div className="bg-white rounded-lg shadow-md">
  <table className="table-fixed w-full">
    {/* Spaltenbreiten mit colgroup */}
    <colgroup>
      {columnOptions.map(
        (option) =>
          filterColumns.includes(option.key) && (
          <col key={option.key} style={{ width: option.width }} />
        )
    )}
    </colgroup>
    <thead>
      <tr className="bg-gray-100">
        {/* Dynamische Spaltenüberschriften */}
        {columnOptions.map(
          (option) =>
            filterColumns.includes(option.key) && (
              <th
                key={option.key}
                className={`p-4 border-b text-left ${
                  option.sortable ? 'cursor-pointer hover:bg-gray-200' : ''
                }`}
                onClick={() => option.sortable && handleSort(option.key)}
              >
                <div className="flex items-center">
                      {option.label}
                      {option.sortable && (
                        <img
                          src={
                            sortConfig.key === option.key
                              ? sortConfig.direction === 'asc'
                                ? UpSvg
                                : DownSvg
                              : DownSvg
                          }
                          alt="Sort Icon"
                          className={`ml-2 h-4 w-4 transition-opacity duration-200 ${
                            sortConfig.key !== option.key ? 'opacity-50' : 'opacity-100'
                          }`}
                        />
                      )}
                    </div>
              </th>
            )
        )}
      </tr>
    </thead>
    <tbody>
  {tableData.map((row) => (
    <tr key={row.feedback_id} className="hover:bg-gray-50">
      {columnOptions.map((option) => {
        if (filterColumns.includes(option.key)) {
          return (
            <td
              key={`${row.feedback_id}-${option.key}`}
              className="p-4 border-b text-left whitespace-pre-wrap"
            >
              {option.key === 'feedback_text' ? (
                <div className="h-[200px] overflow-y-auto resize-y">
                  {row[option.key]}
                </div>
              ) : (
                row[option.key]
              )}
            </td>
          );
        }
        return null;
      })}
    </tr>
  ))}
</tbody>
  </table>
</div>

    {/* Pagination-Buttons */}
    <div className="flex justify-center items-center mt-4">
    <div
      className={`cursor-pointer ${
        currentPage === 1 ? 'fill-gray-400 cursor-not-allowed' : 'fill-rubBlue hover:fill-gray-300'
      }`}
      onClick={currentPage === 1 ? null : handlePreviousPage}
      >
      <ControllerPrevSvg className=" m-2 w-4 " />
    </div>
      <span className="text-gray-600 font-medium text-sm font-sans">
        Seite {currentPage} von {totalPages}
      </span>
    <div
      className={`cursor-pointer ${
        currentPage === totalPages ? 'fill-gray-400 cursor-not-allowed' : 'fill-rubBlue hover:fill-gray-300'
      }`}
      onClick={currentPage === totalPages ? null : handleNextPage}
      >
      <ControllerNextSvg className="m-2 w-4" />
    </div>
  </div>
  </div>
  );
};

export default LottoManagement;