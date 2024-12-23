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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AccountCircle as AccountCircleIcon,
  Share as ShareIcon,
  WhatsApp as WhatsAppIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { getAbordagemById, deleteAbordagem } from '../services/supabaseService';
import { Abordagem, Pessoa } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';

export default function DetalheAbordagem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [abordagem, setAbordagem] = useState<Abordagem | null>(null);
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<{ [key: string]: string[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAbordagem();
  }, [id]);

  const loadAbordagem = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getAbordagemById(id);
      
      if (!data) {
        setError('Abordagem não encontrada');
        return;
      }

      // Inicializa o estado de fotos selecionadas
      const initialSelectedPhotos: { [key: string]: string[] } = {};
      if (data.pessoas && Array.isArray(data.pessoas)) {
        data.pessoas.forEach((pessoa: Pessoa) => {
          initialSelectedPhotos[pessoa.id] = [];
        });
      }
      setSelectedPhotos(initialSelectedPhotos);
      setAbordagem(data);
    } catch (error) {
      console.error('Erro ao carregar abordagem:', error);
      setError('Erro ao carregar dados da abordagem');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteAbordagem(id);
      navigate('/abordagens');
    } catch (error) {
      console.error('Erro ao excluir abordagem:', error);
      setError('Erro ao excluir abordagem');
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

  if (!abordagem) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Abordagem não encontrada</Typography>
      </Box>
    );
  }

  const handleShareWhatsApp = () => {
    let message = `*Registro de Abordagem*\n\n`;
    message += `📅 Data: ${new Date(abordagem.timestamp).toLocaleString()}\n`;
    if (abordagem.local) {
      message += `📍 Local: ${abordagem.local.logradouro}, ${abordagem.local.numero} - ${abordagem.local.bairro}\n\n`;
    }
    
    if (abordagem.pessoas && Array.isArray(abordagem.pessoas)) {
      abordagem.pessoas.forEach((pessoa) => {
        message += `👤 *${pessoa.nome || 'Nome não informado'}*\n`;
        message += `👩 Mãe: ${pessoa.nomeMae || 'Não informado'}\n`;
        message += `👨 Pai: ${pessoa.nomePai || 'Não informado'}\n`;
        message += `📅 Nascimento: ${pessoa.dataNascimento ? new Date(pessoa.dataNascimento).toLocaleDateString() : 'Não informado'}\n`;
        message += `📝 RG: ${pessoa.rg || 'Não informado'}\n\n`;
      });
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setOpenShareDialog(false);
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            edge="start"
            onClick={() => navigate(-1)}
            sx={{ color: 'text.secondary' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Detalhes da Abordagem
          </Typography>
          <IconButton onClick={() => setOpenShareDialog(true)}>
            <ShareIcon />
          </IconButton>
          <IconButton color="error" onClick={() => setOpenDeleteDialog(true)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        {/* Info Card */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon color="action" />
                <Typography>
                  {new Date(abordagem.timestamp).toLocaleString()}
                </Typography>
              </Box>
              {abordagem.local && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon color="action" />
                  <Typography>
                    {`${abordagem.local.logradouro}, ${abordagem.local.numero} - ${abordagem.local.bairro}`}
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Pessoas */}
        <Typography variant="h6" gutterBottom sx={{ px: 1 }}>
          Pessoas Abordadas
        </Typography>
        
        {abordagem.pessoas && Array.isArray(abordagem.pessoas) && abordagem.pessoas.map((pessoa) => (
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
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={pessoa.fotoPerfil}
                  sx={{ 
                    width: 56, 
                    height: 56,
                    mr: 2,
                    bgcolor: theme.palette.primary.main,
                  }}
                >
                  <AccountCircleIcon />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
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

              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Nome da Mãe
                  </Typography>
                  <Typography variant="body1">
                    {pessoa.nomeMae || 'Não informado'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Nome do Pai
                  </Typography>
                  <Typography variant="body1">
                    {pessoa.nomePai || 'Não informado'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      RG
                    </Typography>
                    <Typography variant="body1">
                      {pessoa.rg || 'Não informado'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      CPF
                    </Typography>
                    <Typography variant="body1">
                      {pessoa.cpf || 'Não informado'}
                    </Typography>
                  </Box>
                </Box>

                {pessoa.fotos && Array.isArray(pessoa.fotos) && pessoa.fotos.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Fotos
                    </Typography>
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                      gap: 1 
                    }}>
                      {pessoa.fotos.map((foto, index) => (
                        <img
                          key={index}
                          src={foto}
                          alt={`Foto ${index + 1}`}
                          style={{
                            width: '100%',
                            height: 100,
                            objectFit: 'cover',
                            borderRadius: 8,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Modal de Compartilhamento */}
      <Dialog
        open={openShareDialog}
        onClose={() => setOpenShareDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Compartilhar Abordagem</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<WhatsAppIcon />}
              onClick={handleShareWhatsApp}
              sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }}
            >
              Compartilhar no WhatsApp
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenShareDialog(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <ConfirmDialog
        open={openDeleteDialog}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir esta abordagem? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setOpenDeleteDialog(false)}
        confirmText="Excluir"
        cancelText="Cancelar"
        severity="error"
      />
    </Box>
  );
} 