import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
  Avatar,
  AvatarGroup,
  Fab,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  AccountCircle as AccountCircleIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { getAbordagens } from '../services/supabaseService';
import { Abordagem } from '../types';

export default function Abordagens() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [abordagens, setAbordagens] = useState<Abordagem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAbordagens = async () => {
      try {
        const abordagensData = await getAbordagens();
        setAbordagens(abordagensData.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
      } catch (error) {
        console.error('Erro ao carregar abordagens:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAbordagens();
  }, []);

  const filteredAbordagens = abordagens.filter(abordagem => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (abordagem.local?.logradouro?.toLowerCase().includes(searchTermLower) ||
      abordagem.local?.bairro?.toLowerCase().includes(searchTermLower)) ||
      abordagem.pessoas?.some(pessoa =>
        pessoa.nome?.toLowerCase().includes(searchTermLower) ||
        pessoa.nomeMae?.toLowerCase().includes(searchTermLower) ||
        pessoa.nomePai?.toLowerCase().includes(searchTermLower)
      )
    );
  });

  return (
    <Box sx={{ pb: isMobile ? 2 : 3 }}>
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          px: isMobile ? 2 : 3,
          py: 1,
        }}
      >
        <Typography variant="h6">Abordagens</Typography>
      </Box>

      {/* Content */}
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        {/* Search */}
        <Box sx={{ 
          position: 'sticky', 
          top: isMobile ? 56 : 64,
          zIndex: 1,
          backgroundColor: theme.palette.background.default,
          pt: 2,
          pb: 2,
        }}>
          <TextField
            fullWidth
            placeholder="Buscar abordagem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: 'white',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.2) !important',
                },
              },
            }}
          />
        </Box>

        {/* Abordagens List */}
        <Box sx={{ mb: 7 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredAbordagens.length > 0 ? (
            filteredAbordagens.map((abordagem) => (
              <Card
                key={abordagem.id}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                }}
                onClick={() => navigate(`/abordagem/${abordagem.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Data e Hora */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(abordagem.timestamp).toLocaleString()}
                      </Typography>
                    </Box>

                    {/* Localização */}
                    {abordagem.local && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon color="action" fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                          {`${abordagem.local.logradouro}, ${abordagem.local.numero} - ${abordagem.local.bairro}`}
                        </Typography>
                      </Box>
                    )}

                    {/* Pessoas */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <AvatarGroup max={4}>
                        {abordagem.pessoas.map((pessoa) => (
                          <Avatar
                            key={pessoa.id}
                            src={pessoa.fotoPerfil}
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: theme.palette.primary.main,
                            }}
                          >
                            <AccountCircleIcon sx={{ fontSize: 20 }} />
                          </Avatar>
                        ))}
                      </AvatarGroup>
                      <Typography variant="body2" color="text.secondary">
                        {abordagem.pessoas.length} {abordagem.pessoas.length === 1 ? 'pessoa' : 'pessoas'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
              <Typography>
                {searchTerm
                  ? 'Nenhuma abordagem encontrada'
                  : 'Nenhuma abordagem registrada'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* FAB */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => navigate('/nova-abordagem')}
        sx={{
          position: 'fixed',
          bottom: isMobile ? 16 : 32,
          right: isMobile ? 16 : 32,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
} 