import { useState, useEffect } from 'react';

// Mock data for stations
const mockStationsData = [
  'สถานีไฟฟ้าย่อย กฟภ.1',
  'สถานีไฟฟ้าย่อย กฟภ.2', 
  'สถานีไฟฟ้าย่อย กฟภ.3',
  'สถานีไฟฟ้าย่อย กฟภ.4',
  'สถานีไฟฟ้าย่อย กฟภ.5'
];

const mockLinesData = [
  'สาย 22 kV ท่าจีน',
  'สาย 22 kV บางปะอิน',
  'สาย 22 kV นวนคร',
  'สาย 22 kV สามโคก',
  'สาย 22 kV วังน้อย'
];

export const useStations = () => {
  const [stations, setStations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate API call - เตรียมไว้สำหรับ real API
  const fetchStations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      // const response = await axios.get('/api/stations');
      // setStations(response.data);
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setStations(mockStationsData);
    } catch {
      setError('Failed to fetch stations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  return {
    stations,
    loading,
    error,
    fetchStations
  };
};

export const useLines = () => {
  const [lines, setLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate API call - เตรียมไว้สำหรับ real API
  const fetchLines = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call  
      // const response = await axios.get('/api/lines');
      // setLines(response.data);
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setLines(mockLinesData);
    } catch {
      setError('Failed to fetch lines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLines();
  }, []);

  return {
    lines,
    loading,
    error,
    fetchLines
  };
};