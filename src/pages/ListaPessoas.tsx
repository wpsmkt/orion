import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Box,
  CircularProgress
} from '@mui/material';
import { Pessoa } from '../types';
import { getPessoas } from '../services/supabaseService';
import PessoaCard from '../components/PessoaCard';

export default function ListaPessoas() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPessoas = async () => {
      try {
        const data = await getPessoas();
        setPessoas(data);
      } catch (error) {
        console.error('Erro ao carregar pessoas:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPessoas();
  }, []);

  const pessoasFiltradas = pessoas.filter(pessoa => {
    const searchLower = searchTerm.toLowerCase();
    return (
      pessoa.nome?.toLowerCase().includes(searchLower) ||
      pessoa.nomeMae?.toLowerCase().includes(searchLower) ||
      pessoa.nomePai?.toLowerCase().includes(searchLower) ||
      pessoa.cpf?.includes(searchTerm) ||
      pessoa.rg?.includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>Lista de Pessoas</Typography>
        
        <TextField
          fullWidth
          label="Pesquisar pessoas"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          margin="normal"
        />

        <Box mt={3}>
          {pessoasFiltradas.map(pessoa => (
            <PessoaCard
              key={pessoa.id}
              pessoa={pessoa}
              showActions={false}
            />
          ))}
          {pessoasFiltradas.length === 0 && (
            <Typography color="textSecondary">
              Nenhuma pessoa encontrada
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
} 