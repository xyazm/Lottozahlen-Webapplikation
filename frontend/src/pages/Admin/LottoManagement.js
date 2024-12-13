import React, { useState, useEffect, useRef } from 'react';
import DownSvg from '../../assets/down.svg';
import UpSvg from '../../assets/up.svg';
import Button from '../../components/Button';

const LottoManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterColumns, setFilterColumns] = useState(['id', 'lottoschein', 'feedback', 'name']);
  const [tableData, setTableData] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Dropdown-Status
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const dropdownRef = useRef(null); // Referenz auf den Dropdown-Container

  // Beispiel-Daten
  useEffect(() => {
    const exampleData = [
      { id: 1, lottoschein: '123456', feedback: 'Positiv', name: 'Max Mustermann' },
      { id: 2, lottoschein: '654321', feedback: 'Negativ', name: 'Erika Musterfrau' },
      { id: 3, lottoschein: '789123', feedback: 'Positiv', name: 'John Doe' },
      { id: 4, lottoschein: '321987', feedback: 'Neutral', name: 'Jane Smith' },
    ];
    setTableData(exampleData);
  }, []);

  const columnOptions = [
    { key: 'id', label: 'ID', width: '10%', sortable: true }, // Sortierbar
    { key: 'lottoschein', label: 'Lottoschein', width: '30%', sortable: false }, // Nicht sortierbar
    { key: 'feedback', label: 'Feedback', width: '30%', sortable: false }, // Nicht sortierbar
    { key: 'name', label: 'Name', width: '30%', sortable: true }, // Sortierbar
  ];

    // Sortierfunktion
    const handleSort = (key) => {
      if (!key) return;
  
      let direction = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
      }
  
      const sortedData = [...tableData].sort((a, b) => {
        if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
        return 0;
      });
  
      setTableData(sortedData);
      setSortConfig({ key, direction });
    };

  const handleSearch = () => {
    const filteredData = tableData.filter((row) =>
      Object.values(row).some((value) =>
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setTableData(filteredData);
  };

  const handleFilterChange = (key) => {
    if (filterColumns.includes(key)) {
      setFilterColumns(filterColumns.filter((col) => col !== key)); // Entferne Spalte
    } else {
      setFilterColumns([...filterColumns, key]); // Füge Spalte hinzu
    }
  };

  // Öffnet oder schließt das Dropdown-Menü
  const toggleFilterDropdown = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Schließt das Dropdown, wenn der Benutzer außerhalb klickt
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsFilterOpen(false);
    }
  };

  // Füge einen Event-Listener hinzu, um auf "klicken außerhalb" zu hören
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        <Button buttonId='button-search-db' text='Suchen' onClick={handleSearch} className='h-10 px-4'/>
         {/* <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Suchen
        </button> */}

        {/* Dropdown-Filter */}
        <div className="relative" ref={dropdownRef}>
          <Button buttonId='button-filter-db' text='Filter' onClick={toggleFilterDropdown} className='h-10 px-4 !bg-gray-200 text-black'/>
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
      {/* Dynamische Tabellenzeilen */}
      {tableData.map((row) => (
        <tr key={row.id} className="hover:bg-gray-50">
          {columnOptions.map(
            (option) =>
              filterColumns.includes(option.key) && (
                <td key={option.key} className="p-4 border-b text-left">
                  {row[option.key]}
                </td>
              )
          )}
        </tr>
      ))}
    </tbody>
  </table>
</div>
    </div>
  );
};

export default LottoManagement;