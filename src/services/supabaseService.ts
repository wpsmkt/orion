import { supabase } from '../lib/supabase';
import { Pessoa, Abordagem, Veiculo } from '../types';

interface PessoaRow {
  id: string;
  nome: string;
  nome_mae: string;
  nome_pai: string;
  data_nascimento: string;
  rg: string;
  cpf: string;
  endereco: string;
  foto_perfil: string;
  fotos: string[];
  veiculos: Veiculo[];
  anotacoes: string;
}

interface AbordagemRow {
  id: string;
  timestamp: string;
  local: {
    logradouro: string;
    numero: string;
    bairro: string;
    latitude?: number;
    longitude?: number;
  };
  pessoas: string[];
}

// Funções de conversão
function convertPessoaRowToPessoa(row: PessoaRow): Pessoa {
  return {
    id: row.id,
    nome: row.nome,
    nomeMae: row.nome_mae,
    nomePai: row.nome_pai,
    dataNascimento: row.data_nascimento,
    rg: row.rg,
    cpf: row.cpf,
    endereco: row.endereco,
    fotoPerfil: row.foto_perfil,
    fotos: row.fotos,
    veiculos: row.veiculos,
    anotacoes: row.anotacoes,
  };
}

function convertPessoaToPessoaRow(pessoa: Omit<Pessoa, 'id'>): Omit<PessoaRow, 'id'> {
  return {
    nome: pessoa.nome || '',
    nome_mae: pessoa.nomeMae || '',
    nome_pai: pessoa.nomePai || '',
    data_nascimento: pessoa.dataNascimento || '',
    rg: pessoa.rg || '',
    cpf: pessoa.cpf || '',
    endereco: pessoa.endereco || '',
    foto_perfil: pessoa.fotoPerfil || '',
    fotos: pessoa.fotos || [],
    veiculos: pessoa.veiculos || [],
    anotacoes: pessoa.anotacoes || '',
  };
}

// Funções de serviço
export async function getPessoas(): Promise<Pessoa[]> {
  const { data, error } = await supabase
    .from('pessoas')
    .select('*')
    .order('nome');

  if (error) throw error;

  return (data as PessoaRow[]).map(convertPessoaRowToPessoa);
}

export async function getPessoaById(id: string): Promise<Pessoa | null> {
  const { data, error } = await supabase
    .from('pessoas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) return null;

  return convertPessoaRowToPessoa(data as PessoaRow);
}

export async function createPessoa(pessoa: Omit<Pessoa, 'id'>): Promise<Pessoa> {
  const { data, error } = await supabase
    .from('pessoas')
    .insert([convertPessoaToPessoaRow(pessoa)])
    .select()
    .single();

  if (error) throw error;

  return convertPessoaRowToPessoa(data as PessoaRow);
}

export async function updatePessoa(id: string, pessoa: Omit<Pessoa, 'id'>): Promise<Pessoa> {
  const { data, error } = await supabase
    .from('pessoas')
    .update(convertPessoaToPessoaRow(pessoa))
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return convertPessoaRowToPessoa(data as PessoaRow);
}

export async function deletePessoa(id: string): Promise<void> {
  const { error } = await supabase
    .from('pessoas')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getAbordagens(): Promise<Abordagem[]> {
  const { data: abordagensData, error: abordagensError } = await supabase
    .from('abordagens')
    .select('*')
    .order('timestamp', { ascending: false });

  if (abordagensError) throw abordagensError;

  const abordagens = abordagensData as AbordagemRow[];
  const pessoasIds = new Set<string>();
  abordagens.forEach(abordagem => {
    abordagem.pessoas.forEach(id => pessoasIds.add(id));
  });

  const { data: pessoasData, error: pessoasError } = await supabase
    .from('pessoas')
    .select('*')
    .in('id', Array.from(pessoasIds));

  if (pessoasError) throw pessoasError;

  const pessoasMap = new Map<string, Pessoa>();
  (pessoasData as PessoaRow[]).forEach(pessoa => {
    pessoasMap.set(pessoa.id, convertPessoaRowToPessoa(pessoa));
  });

  return abordagens.map(abordagem => ({
    id: abordagem.id,
    timestamp: abordagem.timestamp,
    local: abordagem.local,
    pessoas: abordagem.pessoas
      .map(id => pessoasMap.get(id))
      .filter((pessoa): pessoa is Pessoa => pessoa !== undefined),
  }));
}

export async function getAbordagemById(id: string): Promise<Abordagem | null> {
  const { data: abordagemData, error: abordagemError } = await supabase
    .from('abordagens')
    .select('*')
    .eq('id', id)
    .single();

  if (abordagemError) throw abordagemError;
  if (!abordagemData) return null;

  const abordagem = abordagemData as AbordagemRow;
  const { data: pessoasData, error: pessoasError } = await supabase
    .from('pessoas')
    .select('*')
    .in('id', abordagem.pessoas);

  if (pessoasError) throw pessoasError;

  return {
    id: abordagem.id,
    timestamp: abordagem.timestamp,
    local: abordagem.local,
    pessoas: (pessoasData as PessoaRow[]).map(convertPessoaRowToPessoa),
  };
}

export async function getAbordagensByPessoa(pessoaId: string): Promise<Abordagem[]> {
  const { data: abordagensData, error: abordagensError } = await supabase
    .from('abordagens')
    .select('*')
    .contains('pessoas', [pessoaId])
    .order('timestamp', { ascending: false });

  if (abordagensError) throw abordagensError;

  const abordagens = abordagensData as AbordagemRow[];
  const pessoasIds = new Set<string>();
  abordagens.forEach(abordagem => {
    abordagem.pessoas.forEach(id => pessoasIds.add(id));
  });

  const { data: pessoasData, error: pessoasError } = await supabase
    .from('pessoas')
    .select('*')
    .in('id', Array.from(pessoasIds));

  if (pessoasError) throw pessoasError;

  const pessoasMap = new Map<string, Pessoa>();
  (pessoasData as PessoaRow[]).forEach(pessoa => {
    pessoasMap.set(pessoa.id, convertPessoaRowToPessoa(pessoa));
  });

  return abordagens.map(abordagem => ({
    id: abordagem.id,
    timestamp: abordagem.timestamp,
    local: abordagem.local,
    pessoas: abordagem.pessoas
      .map(id => pessoasMap.get(id))
      .filter((pessoa): pessoa is Pessoa => pessoa !== undefined),
  }));
}

export async function createAbordagem(abordagem: Omit<Abordagem, 'id'>): Promise<Abordagem> {
  const abordagemRow: Omit<AbordagemRow, 'id'> = {
    timestamp: abordagem.timestamp,
    local: abordagem.local,
    pessoas: abordagem.pessoas.map(pessoa => pessoa.id),
  };

  const { data, error } = await supabase
    .from('abordagens')
    .insert([abordagemRow])
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    timestamp: data.timestamp,
    local: data.local,
    pessoas: abordagem.pessoas,
  };
}

export async function deleteAbordagem(id: string): Promise<void> {
  const { error } = await supabase
    .from('abordagens')
    .delete()
    .eq('id', id);

  if (error) throw error;
} 