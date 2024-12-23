import { AlertColor } from '@mui/material';

export interface Localizacao {
  logradouro: string;
  numero: string;
  bairro: string;
  latitude?: number;
  longitude?: number;
}

export interface Veiculo {
  marca: string;
  modelo: string;
  cor: string;
}

export interface Pessoa {
  id: string;
  nome?: string;
  nomeMae?: string;
  nomePai?: string;
  dataNascimento?: string;
  rg?: string;
  cpf?: string;
  endereco?: string;
  fotoPerfil?: string;
  fotos: string[] | [];
  veiculos: Veiculo[] | [];
  anotacoes?: string;
}

export interface Abordagem {
  id: string;
  timestamp: string;
  local: Localizacao;
  pessoas: Pessoa[];
}

export interface FeedbackState {
  open: boolean;
  message: string;
  severity: AlertColor;
} 