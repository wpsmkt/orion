import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { getAbordagens, deleteAbordagem } from '../services/supabaseService';
import { Abordagem, FeedbackState } from '../types';
import PessoaCard from '../components/PessoaCard';
import ConfirmDialog from '../components/ConfirmDialog';
import Feedback from '../components/Feedback';

export default function ListaAbordagens() {
  const navigate = useNavigate();
  const [abordagens, setAbordagens] = useState<Abordagem[]>([]);
  const [selectedAbordagem, setSelectedAbordagem] = useState<Abordagem | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackState>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadAbordagens();
  }, []);

  const loadAbordagens = async () => {
    try {
      const data = await getAbordagens();
      setAbordagens(data);
    } catch (error) {
      console.error('Erro ao carregar abordagens:', error);
      setFeedback({
        open: true,
        message: 'Erro ao carregar abordagens',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNovaAbordagem = () => {
    navigate('/nova-abordagem');
  };

  const handleViewAbordagem = (abordagem: Abordagem) => {
    setSelectedAbordagem(abordagem);
    setOpenDialog(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteAbordagem(deleteId);
      await loadAbordagens();
      setOpenDeleteDialog(false);
      setFeedback({
        open: true,
        message: 'Abordagem excluída com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao excluir abordagem:', error);
      setFeedback({
        open: true,
        message: 'Erro ao excluir abordagem',
        severity: 'error'
      });
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Abordagens</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNovaAbordagem}
        >
          Nova Abordagem
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data e Hora</TableCell>
              <TableCell>Local</TableCell>
              <TableCell>Pessoas</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {abordagens.map((abordagem) => (
              <TableRow key={abordagem.id}>
                <TableCell>{formatDate(abordagem.timestamp)}</TableCell>
                <TableCell>
                  {abordagem.local.logradouro}, {abordagem.local.numero} - {abordagem.local.bairro}
                </TableCell>
                <TableCell>{abordagem.pessoas.length}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => handleViewAbordagem(abordagem)}
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(abordagem.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de Visualização */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalhes da Abordagem
        </DialogTitle>
        <DialogContent>
          {selectedAbordagem && (
            <>
              <Typography variant="h6" gutterBottom>
                Data e Hora
              </Typography>
              <Typography paragraph>
                {formatDate(selectedAbordagem.timestamp)}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Local
              </Typography>
              <Typography paragraph>
                {selectedAbordagem.local.logradouro}, {selectedAbordagem.local.numero} - {selectedAbordagem.local.bairro}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Pessoas Abordadas
              </Typography>
              {selectedAbordagem.pessoas.map((pessoa) => (
                <PessoaCard
                  key={pessoa.id}
                  pessoa={pessoa}
                  onEdit={() => {}}
                  onRemove={() => {}}
                />
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <ConfirmDialog
        open={openDeleteDialog}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir esta abordagem? Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        onCancel={() => setOpenDeleteDialog(false)}
        confirmText="Excluir"
        cancelText="Cancelar"
        severity="error"
      />

      {/* Feedback */}
      <Feedback
        open={feedback.open}
        message={feedback.message}
        severity={feedback.severity}
        onClose={() => setFeedback(prev => ({ ...prev, open: false }))}
      />
    </Container>
  );
} 