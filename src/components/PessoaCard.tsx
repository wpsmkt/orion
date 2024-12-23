import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Avatar,
  Grid,
  Divider
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Pessoa } from '../types';

interface PessoaCardProps {
  pessoa: Pessoa;
  onEdit?: () => void;
  onRemove?: () => void;
  showActions?: boolean;
}

export default function PessoaCard({ pessoa, onEdit, onRemove, showActions = true }: PessoaCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (!onEdit) {
      navigate(`/pessoa/${pessoa.id}`);
    }
  };

  return (
    <Card 
      sx={{ 
        mb: 2, 
        cursor: !onEdit ? 'pointer' : 'default',
        '&:hover': !onEdit ? {
          backgroundColor: 'action.hover'
        } : {}
      }}
      onClick={handleCardClick}
    >
      <CardContent>
        {/* Cabeçalho */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={pessoa.fotoPerfil}
            sx={{ width: 80, height: 80, mr: 2 }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">
              {pessoa.nome || 'Nome não informado'}
            </Typography>
          </Box>
          {showActions && (
            <Box>
              {onEdit && (
                <IconButton onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}>
                  <EditIcon />
                </IconButton>
              )}
              {onRemove && (
                <IconButton onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}>
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Informações Pessoais */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Nome da Mãe
            </Typography>
            <Typography>
              {pessoa.nomeMae || 'Não informado'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Nome do Pai
            </Typography>
            <Typography>
              {pessoa.nomePai || 'Não informado'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="textSecondary">
              Data de Nascimento
            </Typography>
            <Typography>
              {pessoa.dataNascimento 
                ? new Date(pessoa.dataNascimento).toLocaleDateString()
                : 'Não informado'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="textSecondary">
              RG
            </Typography>
            <Typography>
              {pessoa.rg || 'Não informado'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="textSecondary">
              CPF
            </Typography>
            <Typography>
              {pessoa.cpf || 'Não informado'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary">
              Último Endereço
            </Typography>
            <Typography>
              {pessoa.endereco || 'Não informado'}
            </Typography>
          </Grid>

          {pessoa.veiculos && pessoa.veiculos.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">
                Veículos
              </Typography>
              {pessoa.veiculos.map((veiculo, index) => (
                <Typography key={index}>
                  {`${veiculo.marca} ${veiculo.modelo} - ${veiculo.cor}`}
                </Typography>
              ))}
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
} 