import { useContext } from 'react';
import { DataContext } from './data-context.js';

export function useCampusData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useCampusData must be used inside DataProvider');
  return context;
}