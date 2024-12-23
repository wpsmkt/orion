import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  Typography,
  Avatar,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, PhotoCamera } from '@mui/icons-material';
import { Pessoa, Veiculo } from '../types';
import { validateCPF, validateRG, formatCPF, formatRG } from '../utils/validation';
import { supabase } from '../lib/supabase';

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
  rg: '',
  cpf: '',
  endereco: '',
  fotoPerfil: '',
  fotos: [],
  veiculos: [],
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
  const [errors, setErrors] = useState<{
    cpf: string;
    rg: string;
  }>({
    cpf: '',
    rg: ''
  });

  useEffect(() => {
    if (pessoa) {
      setFormData(pessoa);
    } else {
      setFormData(emptyPessoa);
    }
  }, [pessoa]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    let formattedValue = value;

    // Formatação e validação específica para CPF e RG
    if (name === 'cpf') {
      formattedValue = formatCPF(value);
      setErrors((prev) => ({
        ...prev,
        cpf: value && !validateCPF(value) ? 'CPF inválido' : ''
      }));
    } else if (name === 'rg') {
      formattedValue = formatRG(value);
      setErrors((prev) => ({
        ...prev,
        rg: value && !validateRG(value) ? 'RG inválido' : ''
      }));
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleVeiculoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNovoVeiculo((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddVeiculo = () => {
    if (novoVeiculo.marca && novoVeiculo.modelo && novoVeiculo.cor) {
      setFormData((prev) => ({
        ...prev,
        veiculos: [...prev.veiculos, novoVeiculo]
      }));
      setNovoVeiculo(emptyVeiculo);
    }
  };

  const handleRemoveVeiculo = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      veiculos: prev.veiculos.filter((_, i) => i !== index)
    }));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      try {
        const uploadedUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `fotos/${fileName}`;

          // Upload do arquivo para o Supabase Storage
          const { error } = await supabase.storage
            .from('pessoas')
            .upload(filePath, file);

          if (error) throw error;

          // Gera URL pública do arquivo
          const { data: { publicUrl } } = supabase.storage
            .from('pessoas')
            .getPublicUrl(filePath);

          uploadedUrls.push(publicUrl);
        }

        setFormData((prev) => ({
          ...prev,
          fotos: [...prev.fotos, ...uploadedUrls],
        }));
      } catch (error) {
        console.error('Erro ao fazer upload das fotos:', error);
      }
    }
  };

  const handleSetProfilePhoto = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      fotoPerfil: url
    }));
  };

  const handleRemovePhoto = async (url: string) => {
    try {
      // Extrai o nome do arquivo da URL
      const filePath = url.split('/').pop();
      if (!filePath) return;

      // Remove o arquivo do Supabase Storage
      const { error } = await supabase.storage
        .from('pessoas')
        .remove([`fotos/${filePath}`]);

      if (error) throw error;

      // Atualiza o estado removendo a foto
      setFormData((prev) => ({
        ...prev,
        fotos: prev.fotos.filter((foto) => foto !== url),
        fotoPerfil: prev.fotoPerfil === url ? '' : prev.fotoPerfil
      }));
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
    }
  };

  const handleSave = () => {
    // Validações
    if (!formData.nome) {
      return;
    }

    if (formData.cpf && !validateCPF(formData.cpf)) {
      setErrors((prev) => ({ ...prev, cpf: 'CPF inválido' }));
      return;
    }

    if (formData.rg && !validateRG(formData.rg)) {
      setErrors((prev) => ({ ...prev, rg: 'RG inválido' }));
      return;
    }

    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {pessoa ? 'Editar Pessoa' : 'Nova Pessoa'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
          {/* Foto de Perfil */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={formData.fotoPerfil}
              sx={{
                width: 120,
                height: 120,
                mb: 1
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {formData.fotoPerfil ? 'Foto de perfil selecionada' : 'Nenhuma foto de perfil selecionada'}
            </Typography>
          </Box>

          {/* Fotos */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Fotos
            </Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="fotos-input"
              type="file"
              multiple
              onChange={handlePhotoUpload}
            />
            <label htmlFor="fotos-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<PhotoCamera />}
                fullWidth
              >
                Adicionar Fotos
              </Button>
            </label>

            <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 1 }}>
              {formData.fotos.map((foto: string, index: number) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    paddingTop: '100%',
                    '&:hover .actions': {
                      opacity: 1
                    }
                  }}
                >
                  <Box
                    component="img"
                    src={foto}
                    alt={`Foto ${index + 1}`}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 1
                    }}
                  />
                  <Box
                    className="actions"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      background: 'rgba(0, 0, 0, 0.5)',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      borderRadius: 1
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => handleSetProfilePhoto(foto)}
                      sx={{ color: 'white', mb: 1 }}
                    >
                      <AddIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleRemovePhoto(foto)}
                      sx={{ color: 'white' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Dados Pessoais */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome Completo"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome da Mãe"
                name="nomeMae"
                value={formData.nomeMae}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
                label="Data de Nascimento"
                name="dataNascimento"
                type="date"
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
                value={formData.rg}
                onChange={handleInputChange}
                error={!!errors.rg}
                helperText={errors.rg}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CPF"
                name="cpf"
                value={formData.cpf}
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
                value={formData.endereco}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Anotações"
                name="anotacoes"
                value={formData.anotacoes}
                onChange={handleInputChange}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>

          {/* Veículos */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Veículos
            </Typography>
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
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Cor"
                  name="cor"
                  value={novoVeiculo.cor}
                  onChange={handleVeiculoChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddVeiculo}
                  disabled={!novoVeiculo.marca || !novoVeiculo.modelo || !novoVeiculo.cor}
                >
                  Adicionar Veículo
                </Button>
              </Grid>
            </Grid>

            {formData.veiculos.map((veiculo: Veiculo, index: number) => (
              <Box
                key={index}
                sx={{
                  mt: 2,
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2">
                    {veiculo.marca} {veiculo.modelo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cor: {veiculo.cor}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveVeiculo(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
} 