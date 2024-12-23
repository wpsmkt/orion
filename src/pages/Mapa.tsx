import { useEffect, useRef, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAbordagens } from '../services/supabaseService';
import { Abordagem } from '../types';

export default function Mapa() {
  const theme = useTheme();
  const mapRef = useRef<L.Map | null>(null);
  const [abordagens, setAbordagens] = useState<Abordagem[]>([]);

  useEffect(() => {
    const loadAbordagens = async () => {
      try {
        const data = await getAbordagens();
        setAbordagens(data);
      } catch (error) {
        console.error('Erro ao carregar abordagens:', error);
      }
    };
    loadAbordagens();
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('map').setView([-23.5505, -46.6333], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      mapRef.current = map;

      // Ajusta o zoom para mostrar todos os marcadores
      const todosOsPontos = abordagens
        .filter(abordagem => abordagem.local.latitude && abordagem.local.longitude)
        .map(abordagem => L.latLng(abordagem.local.latitude!, abordagem.local.longitude!));

      if (todosOsPontos.length > 0) {
        const bounds = L.latLngBounds(todosOsPontos);
        map.fitBounds(bounds);
      }
    }
  }, [abordagens]);

  return (
    <Box
      id="map"
      sx={{
        height: '100vh',
        width: '100%',
        bgcolor: theme.palette.background.paper
      }}
    />
  );
} 