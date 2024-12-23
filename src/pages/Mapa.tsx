import { useEffect, useState, useRef } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { getPessoas } from '../services/supabaseService';
import { Pessoa } from '../types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrige o ícone do marcador do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Coordenadas {
  lat: number;
  lng: number;
  cidade?: string;
}

export default function Mapa() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [coordenadasPessoas, setCoordenadasPessoas] = useState<Map<string, Coordenadas>>(new Map());
  const [mapaCarregado, setMapaCarregado] = useState(false);
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState<Coordenadas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Carrega as pessoas do Supabase
  useEffect(() => {
    const loadPessoas = async () => {
      try {
        const data = await getPessoas();
        setPessoas(data);
      } catch (error) {
        console.error('Erro ao carregar pessoas:', error);
        setError('Erro ao carregar dados das pessoas');
      } finally {
        setLoading(false);
      }
    };
    loadPessoas();
  }, []);

  // Obtém a localização do usuário
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          // Obtém o nome da cidade usando a API do Nominatim
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
            );
            const data = await response.json();
            
            setLocalizacaoUsuario({
              ...coords,
              cidade: data.address?.city || data.address?.town || data.address?.municipality
            });
          } catch (error) {
            console.error('Erro ao obter nome da cidade:', error);
            setLocalizacaoUsuario(coords);
          }
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          // Usa São Paulo como localização padrão
          setLocalizacaoUsuario({ lat: -23.5505, lng: -46.6333, cidade: 'São Paulo' });
        }
      );
    } else {
      // Usa São Paulo como localização padrão se geolocalização não estiver disponível
      setLocalizacaoUsuario({ lat: -23.5505, lng: -46.6333, cidade: 'São Paulo' });
    }
  }, []);

  useEffect(() => {
    const geocodificarEnderecos = async () => {
      const novasCoordenadas = new Map<string, Coordenadas>();

      for (const pessoa of pessoas) {
        if (pessoa.endereco) {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pessoa.endereco)}&addressdetails=1`
            );
            const data = await response.json();
            
            if (data && data[0]) {
              novasCoordenadas.set(pessoa.id, {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                cidade: data[0].address?.city || data[0].address?.town || data[0].address?.municipality
              });
            }
          } catch (error) {
            console.error('Erro ao geocodificar endereço:', error);
          }
          
          // Aguarda 1 segundo entre as requisições para evitar limite de taxa
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setCoordenadasPessoas(novasCoordenadas);
      setMapaCarregado(true);
    };

    if (pessoas.length > 0) {
      geocodificarEnderecos();
    }
  }, [pessoas]);

  useEffect(() => {
    if (!mapaCarregado || !mapContainerRef.current || !localizacaoUsuario) return;

    // Limpa o mapa existente
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Cria o mapa centralizado na localização do usuário
    const map = L.map(mapContainerRef.current).setView([localizacaoUsuario.lat, localizacaoUsuario.lng], 13);
    mapRef.current = map;

    // Adiciona o layer do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Adiciona marcador da localização do usuário
    const userMarker = L.marker([localizacaoUsuario.lat, localizacaoUsuario.lng], {
      icon: L.divIcon({
        className: 'user-location-marker',
        html: `<div style="
          background-color: #4CAF50;
          border: 2px solid white;
          border-radius: 50%;
          width: 15px;
          height: 15px;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
        "></div>`
      })
    }).addTo(map);

    userMarker.bindPopup(`
      <div style="text-align: center;">
        <strong>Sua localização</strong><br/>
        ${localizacaoUsuario.cidade ? `${localizacaoUsuario.cidade}` : ''}
      </div>
    `);

    // Adiciona os marcadores das pessoas
    pessoas.forEach((pessoa) => {
      const coordenadas = coordenadasPessoas.get(pessoa.id);
      if (coordenadas) {
        const marker = L.marker([coordenadas.lat, coordenadas.lng]).addTo(map);
        
        // Cria o popup com as informações da pessoa
        const popupContent = document.createElement('div');
        popupContent.innerHTML = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0;">${pessoa.nome || 'Nome não informado'}</h3>
            <p style="margin: 0 0 8px 0;">
              ${pessoa.endereco || 'Endereço não informado'}<br/>
              ${coordenadas.cidade ? `<strong>Cidade:</strong> ${coordenadas.cidade}` : ''}
            </p>
            <button 
              onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${coordenadas.lat},${coordenadas.lng}')"
              style="
                background-color: #1976d2;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
              "
            >
              Como Chegar
            </button>
          </div>
        `;
        
        marker.bindPopup(popupContent);
      }
    });

    // Ajusta o zoom para mostrar todos os marcadores e a localização do usuário
    const todosOsPontos = [
      [localizacaoUsuario.lat, localizacaoUsuario.lng],
      ...Array.from(coordenadasPessoas.values()).map(coord => [coord.lat, coord.lng])
    ];

    if (todosOsPontos.length > 1) {
      const bounds = L.latLngBounds(todosOsPontos);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [mapaCarregado, coordenadasPessoas, pessoas, localizacaoUsuario]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!mapaCarregado || !localizacaoUsuario) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Carregando mapa...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', width: '100%', position: 'relative' }}>
      <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
    </Box>
  );
} 