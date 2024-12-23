import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  AccountCircle as AccountCircleIcon,
  Delete as DeleteIcon,
  MyLocation as MyLocationIcon,
} from '@mui/icons-material';
import { getPessoas, createPessoa, createAbordagem } from '../services/supabaseService';
import { Pessoa, Localizacao } from '../types';
import FormularioPessoa from '../components/FormularioPessoa';

export default function NovaAbordagem() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchTerm, setSearchTerm] = useState('');
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [pessoasFiltradas, setPessoasFiltradas] = useState<Pessoa[]>([]);
  const [pessoasSelecionadas, setPessoasSelecionadas] = useState<Pessoa[]>([]);
  const [openFormulario, setOpenFormulario] = useState(false);
  const [local, setLocal] = useState<Localizacao>({
    logradouro: '',
    numero: '',
    bairro: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pessoasTemporarias, setPessoasTemporarias] = useState<Omit<Pessoa, 'id'>[]>([]);

  useEffect(() => {
    const loadPessoas = async () => {
      try {
        const pessoasData = await getPessoas();
        setPessoas(pessoasData);
      } catch (error) {
        console.error('Erro ao carregar pessoas:', error);
        setError('Erro ao carregar pessoas');
      }
    };
    loadPessoas();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = pessoas.filter(
        (pessoa) =>
          !pessoasSelecionadas.some((p) => p.id === pessoa.id) &&
          (pessoa.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pessoa.nomeMae?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pessoa.nomePai?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pessoa.rg?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pessoa.cpf?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setPessoasFiltradas(filtered);
    } else {
      setPessoasFiltradas([]);
    }
  }, [searchTerm, pessoasSelecionadas, pessoas]);

  const handleGetLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada pelo seu navegador');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          const data = await response.json();

          if (data.address) {
            setLocal({
              logradouro: data.address.road || '',
              numero: data.address.house_number || '',
              bairro: data.address.suburb || data.address.neighbourhood || '',
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          }
        } catch (error) {
          setError('Erro ao obter o endereço');
          console.error('Erro:', error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setError('Erro ao obter localização: ' + error.message);
        setLoading(false);
      }
    );
  };

  const handleSavePessoa = async (pessoa: Omit<Pessoa, 'id'>) => {
    try {
      setPessoasTemporarias([...pessoasTemporarias, pessoa]);
      const pessoaTemp = {
        ...pessoa,
        id: `temp-${Date.now()}`
      };
      setPessoasSelecionadas([...pessoasSelecionadas, pessoaTemp]);
      setOpenFormulario(false);
    } catch (error) {
      console.error('Erro ao processar pessoa:', error);
      setError('Erro ao processar pessoa');
    }
  };

  const handleRemovePessoa = (id: string) => {
    setPessoasSelecionadas(pessoasSelecionadas.filter((p) => p.id !== id));
  };

  const handleFinalizarAbordagem = async () => {
    if (!local.logradouro || !local.numero || !local.bairro) {
      setError('Por favor, preencha todos os campos do endereço');
      return;
    }

    if (pessoasSelecionadas.length === 0) {
      setError('Adicione pelo menos uma pessoa à abordagem');
      return;
    }

    try {
      const pessoasSalvas: Pessoa[] = [];
      for (const pessoa of pessoasTemporarias) {
        const novaPessoa = await createPessoa(pessoa);
        pessoasSalvas.push(novaPessoa);
      }

      const pessoasFinais = pessoasSelecionadas.map(pessoa => {
        if (pessoa.id.startsWith('temp-')) {
          const pessoaSalva = pessoasSalvas[pessoasTemporarias.findIndex(p => 
            p.nome === pessoa.nome && 
            p.nomeMae === pessoa.nomeMae && 
            p.cpf === pessoa.cpf
          )];
          return pessoaSalva;
        }
        return pessoa;
      });

      const novaAbordagem = {
        timestamp: new Date().toISOString(),
        local,
        pessoas: pessoasFinais,
      };

      const abordagemSalva = await createAbordagem(novaAbordagem);
      setSuccess(true);
      navigate(`/abordagem/${abordagemSalva.id}`);
    } catch (error) {
      console.error('Erro ao salvar abordagem:', error);
      setError('Erro ao salvar abordagem');
    }
  };

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
        <Typography variant="h6">Nova Abordagem</Typography>
      </Box>

      {/* Content */}
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Abordagem salva com sucesso!
          </Alert>
        )}

        {/* Localização */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Localização
              </Typography>
              <Button
                startIcon={<MyLocationIcon />}
                onClick={handleGetLocation}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  'Obter Localização'
                )}
              </Button>
            </Box>

            <Box sx={{ display: 'grid', gap: 2 }}>
              <TextField
                fullWidth
                label="Logradouro"
                value={local.logradouro}
                onChange={(e) =>
                  setLocal({ ...local, logradouro: e.target.value })
                }
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Número"
                  value={local.numero}
                  onChange={(e) => setLocal({ ...local, numero: e.target.value })}
                />
                <TextField
                  label="Bairro"
                  value={local.bairro}
                  onChange={(e) => setLocal({ ...local, bairro: e.target.value })}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Pessoas */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pessoas
            </Typography>

            <TextField
              fullWidth
              placeholder="Buscar pessoa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
              sx={{ mb: 2 }}
            />

            {pessoasFiltradas.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Resultados da busca
                </Typography>
                {pessoasFiltradas.map((pessoa) => (
                  <Card
                    key={pessoa.id}
                    sx={{
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() =>
                      setPessoasSelecionadas([...pessoasSelecionadas, pessoa])
                    }
                  >
                    <CardContent
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        py: 1,
                        '&:last-child': { pb: 1 },
                      }}
                    >
                      <Avatar
                        src={pessoa.fotoPerfil}
                        sx={{ width: 32, height: 32, mr: 1 }}
                      >
                        <AccountCircleIcon />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2">
                          {pessoa.nome || 'Nome não informado'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {pessoa.nomeMae
                            ? `Mãe: ${pessoa.nomeMae}`
                            : 'Mãe não informada'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Pessoas selecionadas
              </Typography>
              {pessoasSelecionadas.map((pessoa) => (
                <Card key={pessoa.id} sx={{ mb: 1 }}>
                  <CardContent
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      py: 1,
                      '&:last-child': { pb: 1 },
                    }}
                  >
                    <Avatar
                      src={pessoa.fotoPerfil}
                      sx={{ width: 32, height: 32, mr: 1 }}
                    >
                      <AccountCircleIcon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2">
                        {pessoa.nome || 'Nome não informado'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {pessoa.nomeMae
                          ? `Mãe: ${pessoa.nomeMae}`
                          : 'Mãe não informada'}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleRemovePessoa(pessoa.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setOpenFormulario(true)}
              fullWidth
            >
              Adicionar Nova Pessoa
            </Button>
          </CardContent>
        </Card>

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleFinalizarAbordagem}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Finalizar Abordagem'}
        </Button>
      </Box>

      {/* Modal de Nova Pessoa */}
      <Dialog
        open={openFormulario}
        onClose={() => setOpenFormulario(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nova Pessoa</DialogTitle>
        <DialogContent>
          <FormularioPessoa onSubmit={handleSavePessoa} />
        </DialogContent>
      </Dialog>
    </Box>
  );
} 