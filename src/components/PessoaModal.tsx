import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Grid,
  Typography,
  Avatar,
  FormHelperText
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, PhotoCamera } from '@mui/icons-material';
import { Pessoa, Veiculo } from '../types';
import { validateCPF, validateRG, formatCPF, formatRG } from '../utils/validation';
import { compressImage } from '../utils/imageCompression';

interface PessoaModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (pessoa: Pessoa) => void;
  pessoa?: Pessoa | null;
}

const emptyPessoa: Pessoa = {
  id: '',
  nome: '',
  nomeMae: '',
  nomePai: '',
  dataNascimento: '',
  fotos: [],
  veiculos: [],
  fotoPerfil: '',
  anotacoes: ''
};

const emptyVeiculo: Veiculo = {
  marca: '',
  modelo: '',
  cor: ''
};

export default function PessoaModal({ open, onClose, onSave, pessoa }: PessoaModalProps) {
  const [formData, setFormData] = useState<Pessoa>(emptyPessoa);
  const [novoVeiculo, setNovoVeiculo] = useState<Veiculo>(emptyVeiculo);
  const [errors, setErrors] = useState({
    cpf: '',
    rg: ''
  });

  useEffect(() => {
    if (pessoa) {
      setFormData(pessoa);
    } else {
      setFormData({ ...emptyPessoa, id: Date.now().toString() });
    }
    setErrors({ cpf: '', rg: '' });
    setNovoVeiculo(emptyVeiculo);
  }, [pessoa, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cpf') {
      formattedValue = formatCPF(value);
      setErrors(prev => ({
        ...prev,
        cpf: value && !validateCPF(value) ? 'CPF inválido' : ''
      }));
    } else if (name === 'rg') {
      formattedValue = formatRG(value);
      setErrors(prev => ({
        ...prev,
        rg: value && !validateRG(value) ? 'RG inválido' : ''
      }));
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleVeiculoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNovoVeiculo(prev => ({ ...prev, [name]: value }));
  };

  const handleAddVeiculo = () => {
    if (novoVeiculo.marca && novoVeiculo.modelo) {
      setFormData(prev => ({
        ...prev,
        veiculos: [...prev.veiculos, novoVeiculo]
      }));
      setNovoVeiculo(emptyVeiculo);
    }
  };

  const handleRemoveVeiculo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      veiculos: prev.veiculos.filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          // Comprimir a imagem antes de salvar
          const compressedImage = await compressImage(base64String);
          setFormData(prev => ({
            ...prev,
            fotos: [...prev.fotos, compressedImage],
            fotoPerfil: prev.fotoPerfil || compressedImage
          }));
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Erro ao processar imagem:', error);
      }
    }
  };

  const handleSetFotoPerfil = (foto: string) => {
    setFormData(prev => ({ ...prev, fotoPerfil: foto }));
  };

  const handleRemoveFoto = (index: number) => {
    setFormData(prev => {
      const novasFotos = prev.fotos.filter((_, i) => i !== index);
      return {
        ...prev,
        fotos: novasFotos,
        fotoPerfil: prev.fotoPerfil === prev.fotos[index] ? (novasFotos[0] || '') : prev.fotoPerfil
      };
    });
  };

  const handleSubmit = () => {
    if (formData.cpf && !validateCPF(formData.cpf)) {
      setErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
      return;
    }
    if (formData.rg && !validateRG(formData.rg)) {
      setErrors(prev => ({ ...prev, rg: 'RG inválido' }));
      return;
    }

    // Se tiver dados de veículo preenchidos, adiciona à lista antes de salvar
    if (novoVeiculo.marca || novoVeiculo.modelo || novoVeiculo.cor) {
      const dadosFinais = {
        ...formData,
        veiculos: [...formData.veiculos, novoVeiculo]
      };
      onSave(dadosFinais);
    } else {
      onSave(formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Avatar
            src={formData.fotoPerfil}
            sx={{ 
              width: 120, 
              height: 120,
              mb: 1
            }}
          />
          <Typography variant="h6">
            {pessoa ? 'Editar Pessoa' : 'Adicionar Nova Pessoa'}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box component="form" noValidate sx={{ mt: 2 }}>
          {/* Dados Pessoais */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome Completo"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome da Mãe"
                name="nomeMae"
                value={formData.nomeMae}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome do Pai"
                name="nomePai"
                value={formData.nomePai}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Data de Nascimento"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="RG"
                name="rg"
                value={formData.rg || ''}
                onChange={handleInputChange}
                error={!!errors.rg}
                helperText={errors.rg}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="CPF"
                name="cpf"
                value={formData.cpf || ''}
                onChange={handleInputChange}
                error={!!errors.cpf}
                helperText={errors.cpf}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Endereço"
                name="endereco"
                value={formData.endereco || ''}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>

          {/* Fotos */}
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>Fotos da Abordagem</Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="foto-button-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="foto-button-file">
              <Button
                variant="contained"
                component="span"
                startIcon={<PhotoCamera />}
              >
                Adicionar Foto
              </Button>
            </label>

            <Grid container spacing={2} mt={2}>
              {formData.fotos.map((foto, index) => (
                <Grid item key={index}>
                  <Box position="relative">
                    <Avatar
                      src={foto}
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        cursor: 'pointer',
                        border: foto === formData.fotoPerfil ? '2px solid #1976d2' : 'none'
                      }}
                      onClick={() => handleSetFotoPerfil(foto)}
                    />
                    {foto === formData.fotoPerfil && (
                      <Typography variant="caption" color="primary" align="center" display="block">
                        Foto de Perfil
                      </Typography>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveFoto(index)}
                      sx={{ position: 'absolute', top: 0, right: 0 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Veículos */}
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>Veículos</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Marca"
                  name="marca"
                  value={novoVeiculo.marca}
                  onChange={handleVeiculoChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Modelo"
                  name="modelo"
                  value={novoVeiculo.modelo}
                  onChange={handleVeiculoChange}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Cor"
                  name="cor"
                  value={novoVeiculo.cor}
                  onChange={handleVeiculoChange}
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <IconButton 
                  onClick={handleAddVeiculo}
                  title="Adicionar mais um veículo"
                  aria-label="Adicionar mais um veículo"
                >
                  <AddIcon />
                </IconButton>
              </Grid>
            </Grid>

            {formData.veiculos.map((veiculo, index) => (
              <Box key={index} mt={1} display="flex" alignItems="center">
                <Typography>
                  {veiculo.marca} {veiculo.modelo} - {veiculo.cor}
                </Typography>
                <IconButton size="small" onClick={() => handleRemoveVeiculo(index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>

          {/* Anotações */}
          <Box mt={3}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Anotações"
              name="anotacoes"
              value={formData.anotacoes || ''}
              onChange={handleInputChange}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!!errors.cpf || !!errors.rg}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
} 