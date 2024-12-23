import { useState, useEffect } from 'react';
import { Localizacao } from '../types';

interface GeolocationState {
  location: Localizacao | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocalização não é suportada pelo navegador',
        loading: false
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&addressdetails=1`
          );
          
          const data = await response.json();
          
          setState({
            location: {
              logradouro: data.address.road || '',
              numero: data.address.house_number || '',
              bairro: data.address.suburb || '',
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            },
            error: null,
            loading: false
          });
        } catch (error) {
          setState({
            location: {
              logradouro: '',
              numero: '',
              bairro: '',
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            },
            error: 'Erro ao obter endereço',
            loading: false
          });
        }
      },
      (error) => {
        setState({
          location: null,
          error: 'Erro ao obter localização: ' + error.message,
          loading: false
        });
      }
    );
  }, []);

  return state;
}; 