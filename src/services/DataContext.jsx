import { useState } from 'react';
import { DataContext } from './data-context.js';
import { loadData } from './store.js';

export function DataProvider({ children }) {
  const [data, setData] = useState(loadData);

  function updateData(updater) {
    const next = typeof updater === 'function' ? updater(data) : updater;
    localStorage.setItem('campusflow-data-v1', JSON.stringify(next));
    setData(next);
  }

  return <DataContext.Provider value={{ data, updateData }}>{children}</DataContext.Provider>;
}