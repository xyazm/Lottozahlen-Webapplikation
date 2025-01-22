import { useState, useEffect, useRef } from 'react';

export function useLottoManagement() {
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterColumns, setFilterColumns] = useState([
    'student_id',
    'student_name', 
    'feedback_id',
    'lottoschein_ids',
    'lottoscheine',
    'feedback_text'
    ]);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Aktuelle Seite
  const entriesPerPage = 50;
  const dropdownRef = useRef(null);
  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_API_URL;


        // Berechne die Einträge, die auf der aktuellen Seite angezeigt werden sollen
    const paginatedData = tableData.slice(
        (currentPage - 1) * entriesPerPage,
        currentPage * entriesPerPage
    );
        
    const totalPages = Math.ceil(tableData.length / entriesPerPage); // Gesamtanzahl der Seiten
        
    const handleNextPage = () => {
    if (currentPage < totalPages) {
        setCurrentPage((prevPage) => prevPage + 1);
    }
    };
        
    const handlePreviousPage = () => {
    if (currentPage > 1) {
        setCurrentPage((prevPage) => prevPage - 1);
    }
    };

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/lottomanagement`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error(`API-Anfrage fehlgeschlagen: ${response.statusText}`);
      }
  
      const data = await response.json();
      setTableData(data);
    } catch (error) {
      console.error('Fehler beim Abrufen der LottoManagement-Daten:', error);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

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
        // Wenn die Suchleiste leer ist, zeige alle Einträge an
        if (searchQuery.trim() === '') {
          fetchData(); // Rufe die ursprünglichen Daten erneut ab
          return;
        }
      
        // Überprüfen, ob die Eingabe das Format "spaltenname:wert" hat
        const queryParts = searchQuery.split(':');
        if (queryParts.length === 2) {
          const column = queryParts[0].trim(); // Spaltenname extrahieren
          const value = queryParts[1].trim();  // Suchwert extrahieren
      
          // Überprüfen, ob die Spalte in den filterColumns enthalten ist
          if (filterColumns.includes(column)) {
            const filteredData = tableData.filter((row) => {
              if (column === 'lottoscheine') {
                // Sonderfall für "lottoscheine": Suche nach mehreren Zahlen
                const searchNumbers = value.split(',').map((num) => num.trim());
                return row[column]
                  .split('\n') // Lottoscheine aufteilen
                  .some((lotto) => {
                    const lottoNumbers = lotto.split('-');
                    return searchNumbers.every((num) => lottoNumbers.includes(num));
                  });
              }
              // Allgemeine Suche für andere Spalten
              return row[column].toString().toLowerCase().includes(value.toLowerCase());
            });
      
            setTableData(filteredData);
            return;
          }
        }
      
        // Wenn die Eingabe ungültig ist, zeige alle Einträge an
        fetchData(); // Rufe die ursprünglichen Daten erneut ab
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

  return {
    tableData: paginatedData,
    setTableData,
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
    dropdownRef,
  };
}