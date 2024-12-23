import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Button,
  useTheme,
  useMediaQuery,
  Divider,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AccountCircle as AccountCircleIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Hub as HubIcon,
} from '@mui/icons-material';
import { getPessoaById, getAbordagensByPessoa, deletePessoa } from '../services/supabaseService';
import { Pessoa, Abordagem } from '../types';
import RelacoesGraph from '../components/RelacoesGraph';
import ConfirmDialog from '../components/ConfirmDialog';

export default function DetalhePessoa() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [pessoa, setPessoa] = useState<Pessoa | null>(null);
  const [abordagens, setAbordagens] = useState<Abordagem[]>([]);
  const [openGraph, setOpenGraph] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [pessoaData, abordagensData] = await Promise.all([
        getPessoaById(id),
        getAbordagensByPessoa(id)
      ]);
      setPessoa(pessoaData);
      setAbordagens(abordagensData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados da pessoa');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deletePessoa(id);
      navigate('/pessoas');
    } catch (error) {
      console.error('Erro ao excluir pessoa:', error);
      setError('Erro ao excluir pessoa');
    }
  };

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

  if (!pessoa) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Pessoa não encontrada</Typography>
      </Box>
    );
  }

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            edge="start"
            onClick={() => navigate(-1)}
            sx={{ color: 'text.secondary' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Detalhes da Pessoa
          </Typography>
          <IconButton onClick={() => setOpenGraph(true)}>
            <HubIcon />
          </IconButton>
          <IconButton color="primary" onClick={() => navigate(`/pessoa/${id}/edit`)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => setOpenDeleteDialog(true)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Profile Card */}
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={pessoa.fotoPerfil}
                sx={{
                  width: 80,
                  height: 80,
                  mr: 2,
                  bgcolor: theme.palette.primary.main,
                }}
              >
                <AccountCircleIcon sx={{ fontSize: 48 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" gutterBottom>
                  {pessoa.nome || 'Nome não informado'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {pessoa.dataNascimento
                    ? `Nascimento: ${new Date(pessoa.dataNascimento).toLocaleDateString()}`
                    : 'Data de nascimento não informada'}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Nome da Mãe
                </Typography>
                <Typography>
                  {pessoa.nomeMae || 'Não informado'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Nome do Pai
                </Typography>
                <Typography>
                  {pessoa.nomePai || 'Não informado'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  RG
                </Typography>
                <Typography>
                  {pessoa.rg || 'Não informado'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  CPF
                </Typography>
                <Typography>
                  {pessoa.cpf || 'Não informado'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Endereço
                </Typography>
                <Typography>
                  {pessoa.endereco || 'Não informado'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Abordagens */}
        <Typography variant="h6" gutterBottom>
          Histórico de Abordagens
        </Typography>
        {abordagens.map((abordagem) => (
          <Card 
            key={abordagem.id} 
            sx={{ 
              mb: 2,
              borderRadius: 2,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
            onClick={() => navigate(`/abordagem/${abordagem.id}`)}
          >
            <CardContent>
              <Typography variant="subtitle1">
                {new Date(abordagem.timestamp).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {abordagem.local.logradouro}, {abordagem.local.bairro}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {abordagem.pessoas.length} {abordagem.pessoas.length === 1 ? 'pessoa' : 'pessoas'} abordada(s)
              </Typography>
            </CardContent>
          </Card>
        ))}
        {abordagens.length === 0 && (
          <Typography color="text.secondary">
            Nenhuma abordagem registrada
          </Typography>
        )}
      </Box>

      {/* Grafo de Relações */}
      {openGraph && (
        <RelacoesGraph
          pessoa={pessoa}
          open={openGraph}
          onClose={() => setOpenGraph(false)}
        />
      )}

      {/* Diálogo de Confirmação de Exclusão */}
      <ConfirmDialog
        open={openDeleteDialog}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir esta pessoa? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setOpenDeleteDialog(false)}
        confirmText="Excluir"
        cancelText="Cancelar"
        severity="error"
      />
    </Box>
  );
} 