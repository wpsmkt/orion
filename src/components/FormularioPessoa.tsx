import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Avatar,
  Typography,
  useTheme,
  Grid,
  Divider,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { Pessoa } from '../types';
import { supabase } from '../lib/supabase';

interface Props {
  onSubmit: (pessoa: Omit<Pessoa, 'id'>) => void;
  pessoa?: Pessoa;
}

export default function FormularioPessoa({ onSubmit, pessoa }: Props) {
  const theme = useTheme();
  const [formData, setFormData] = useState<Omit<Pessoa, 'id'>>(
    pessoa || {
      nome: '',
      nomeMae: '',
      nomePai: '',
      dataNascimento: '',
      rg: '',
      cpf: '',
      fotoPerfil: '',
      fotos: [],
      veiculos: [],
      endereco: '',
      anotacoes: '',
    }
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      try {
        const uploadedUrls = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `fotos/${fileName}`;

          // Upload do arquivo para o Supabase Storage
          const { data, error } = await supabase.storage
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

  const handleDeletePhoto = async (url: string) => {
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
        fotoPerfil: prev.fotoPerfil === url ? '' : prev.fotoPerfil,
      }));
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
    }
  };

  const handleSetProfilePhoto = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      fotoPerfil: url,
    }));
  };

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
    setOpenImageDialog(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      {/* Foto de Perfil */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <Avatar
          src={formData.fotoPerfil}
          sx={{
            width: 120,
            height: 120,
            mb: 1,
            bgcolor: theme.palette.primary.main,
          }}
        >
          <AccountCircleIcon sx={{ fontSize: 60 }} />
        </Avatar>
      </Box>

      {/* Fotos */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
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
            component="span"
            variant="outlined"
            startIcon={<PhotoCameraIcon />}
            fullWidth
            sx={{ mb: 2 }}
          >
            Adicionar Fotos
          </Button>
        </label>

        <ImageList sx={{ maxHeight: 300 }} cols={3} rowHeight={164}>
          {formData.fotos.map((foto, index) => (
            <ImageListItem key={index}>
              <img
                src={foto}
                alt={`Foto ${index + 1}`}
                loading="lazy"
                style={{ cursor: 'pointer' }}
                onClick={() => handleImageClick(foto)}
              />
              <ImageListItemBar
                sx={{
                  background:
                    'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                }}
                position="top"
                actionIcon={
                  <Box>
                    <IconButton
                      sx={{ color: 'white' }}
                      onClick={() => handleSetProfilePhoto(foto)}
                    >
                      {formData.fotoPerfil === foto ? <StarIcon /> : <StarBorderIcon />}
                    </IconButton>
                    <IconButton
                      sx={{ color: 'white' }}
                      onClick={() => handleDeletePhoto(foto)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
                actionPosition="right"
              />
            </ImageListItem>
          ))}
        </ImageList>
      </Box>

      <Grid container spacing={2}>
        {/* Dados Pessoais */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Dados Pessoais
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Nome Completo"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Nome da Mãe"
            value={formData.nomeMae}
            onChange={(e) => setFormData({ ...formData, nomeMae: e.target.value })}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Nome do Pai"
            value={formData.nomePai}
            onChange={(e) => setFormData({ ...formData, nomePai: e.target.value })}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Data de Nascimento"
            type="date"
            value={formData.dataNascimento}
            onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="RG"
            value={formData.rg}
            onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="CPF"
            value={formData.cpf}
            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
          />
        </Grid>

        {/* Endereço */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Endereço
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Endereço Completo"
            multiline
            rows={2}
            value={formData.endereco}
            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
          />
        </Grid>

        {/* Anotações */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Anotações
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Anotações"
            value={formData.anotacoes}
            onChange={(e) => setFormData({ ...formData, anotacoes: e.target.value })}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
        >
          Salvar
        </Button>
      </Box>

      {/* Dialog para visualizar imagem */}
      <Dialog
        open={openImageDialog}
        onClose={() => setOpenImageDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Visualizar Foto</DialogTitle>
        <DialogContent>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Foto em tamanho maior"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '70vh',
                objectFit: 'contain',
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImageDialog(false)}>Fechar</Button>
          {selectedImage && (
            <>
              <Button
                onClick={() => handleSetProfilePhoto(selectedImage)}
                color="primary"
                startIcon={formData.fotoPerfil === selectedImage ? <StarIcon /> : <StarBorderIcon />}
              >
                {formData.fotoPerfil === selectedImage ? 'Remover como Perfil' : 'Definir como Perfil'}
              </Button>
              <Button
                onClick={() => {
                  handleDeletePhoto(selectedImage);
                  setOpenImageDialog(false);
                }}
                color="error"
                startIcon={<DeleteIcon />}
              >
                Excluir
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
} 