import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Avatar,
  useTheme,
  useMediaQuery,
  CircularProgress,
  InputAdornment,
  Fab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { getPessoas } from '../services/supabaseService';
import { Pessoa } from '../types';

export default function Pessoas() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const loadPessoas = async () => {
      try {
        const pessoasData = await getPessoas();
        setPessoas(pessoasData);
      } catch (error) {
        console.error('Erro ao carregar pessoas:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPessoas();
  }, []);

  const filteredPessoas = pessoas.filter(pessoa =>
    pessoa.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pessoa.nomeMae?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pessoa.nomePai?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const LoadingSkeleton = () => (
    <Card sx={{ mb: 2, borderRadius: 2 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={24} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body1">
            Carregando...
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 3,
      maxWidth: '100%',
      margin: '0 auto',
    }}>
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
          variant="outlined"
          placeholder="Buscar pessoa..."
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

      <Box sx={{ mb: 7 }}>
        {loading ? (
          Array.from(new Array(5)).map((_, index) => (
            <LoadingSkeleton key={index} />
          ))
        ) : filteredPessoas.length > 0 ? (
          filteredPessoas.map((pessoa) => (
            <Card 
              key={pessoa.id} 
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
              onClick={() => navigate(`/pessoa/${pessoa.id}`)}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={pessoa.fotoPerfil}
                  sx={{ 
                    width: 56, 
                    height: 56,
                    bgcolor: theme.palette.primary.main,
                  }}
                >
                  <AccountCircleIcon />
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {pessoa.nome || 'Nome não informado'}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Mãe: {pessoa.nomeMae || 'Não informado'}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Pai: {pessoa.nomePai || 'Não informado'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            mt: 4,
            color: 'text.secondary',
          }}>
            <Typography variant="body1">
              Nenhuma pessoa encontrada
            </Typography>
          </Box>
        )}
      </Box>

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