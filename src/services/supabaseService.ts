import { supabase } from '../lib/supabase';
import { Pessoa, Abordagem, Veiculo } from '../types';

interface AbordagemRow {
  id: string;
  timestamp: string;
  logradouro: string;
  numero: string;
  bairro: string;
  latitude?: number;
  longitude?: number;
  abordagens_pessoas: Array<{
    pessoas: Pessoa & {
      veiculos: Veiculo[];
    };
  }>;
}

interface AbordagemPessoaRow {
  abordagem: AbordagemRow;
}

// Funções para Pessoas
export const getPessoas = async () => {
  const { data, error } = await supabase
    .from('pessoas')
    .select(`
      *,
      veiculos (*)
    `);
  
  if (error) throw error;
  return data;
};

export const getPessoaById = async (id: string) => {
  const { data, error } = await supabase
    .from('pessoas')
    .select(`
      *,
      veiculos (*)
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createPessoa = async (pessoa: Omit<Pessoa, 'id'>) => {
  const { data, error } = await supabase
    .from('pessoas')
    .insert({
      nome: pessoa.nome,
      nome_mae: pessoa.nomeMae,
      nome_pai: pessoa.nomePai,
      data_nascimento: pessoa.dataNascimento,
      rg: pessoa.rg,
      cpf: pessoa.cpf,
      endereco: pessoa.endereco,
      foto_perfil: pessoa.fotoPerfil,
      fotos: pessoa.fotos,
      anotacoes: pessoa.anotacoes
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePessoa = async (id: string, pessoa: Partial<Omit<Pessoa, 'id'>>) => {
  const { data, error } = await supabase
    .from('pessoas')
    .update({
      nome: pessoa.nome,
      nome_mae: pessoa.nomeMae,
      nome_pai: pessoa.nomePai,
      data_nascimento: pessoa.dataNascimento,
      rg: pessoa.rg,
      cpf: pessoa.cpf,
      endereco: pessoa.endereco,
      foto_perfil: pessoa.fotoPerfil,
      fotos: pessoa.fotos,
      anotacoes: pessoa.anotacoes
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePessoa = async (id: string) => {
  const { error } = await supabase
    .from('pessoas')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Funções para Veículos
export const createVeiculo = async (veiculo: Veiculo & { pessoa_id: string }) => {
  const { data, error } = await supabase
    .from('veiculos')
    .insert({
      pessoa_id: veiculo.pessoa_id,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      cor: veiculo.cor
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteVeiculo = async (id: string) => {
  const { error } = await supabase
    .from('veiculos')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Funções para Abordagens
export const getAbordagens = async () => {
  const { data, error } = await supabase
    .from('abordagens')
    .select(`
      *,
      abordagens_pessoas (
        pessoas (
          *,
          veiculos (*)
        )
      )
    `);
  
  if (error) throw error;

  // Transforma os dados para o formato esperado
  return data.map(item => {
    const abordagem = item as unknown as AbordagemRow;
    return {
      id: abordagem.id,
      timestamp: abordagem.timestamp,
      local: {
        logradouro: abordagem.logradouro,
        numero: abordagem.numero,
        bairro: abordagem.bairro,
        latitude: abordagem.latitude,
        longitude: abordagem.longitude
      },
      pessoas: (abordagem.abordagens_pessoas || []).map(ap => ({
        ...ap.pessoas,
        veiculos: ap.pessoas.veiculos || []
      }))
    };
  });
};

export const getAbordagemById = async (id: string) => {
  const { data, error } = await supabase
    .from('abordagens')
    .select(`
      *,
      abordagens_pessoas (
        pessoas (
          *,
          veiculos (*)
        )
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  if (!data) return null;

  // Transforma os dados para o formato esperado
  const abordagem = data as unknown as AbordagemRow;
  return {
    id: abordagem.id,
    timestamp: abordagem.timestamp,
    local: {
      logradouro: abordagem.logradouro,
      numero: abordagem.numero,
      bairro: abordagem.bairro,
      latitude: abordagem.latitude,
      longitude: abordagem.longitude
    },
    pessoas: (abordagem.abordagens_pessoas || []).map(ap => ({
      ...ap.pessoas,
      veiculos: ap.pessoas.veiculos || []
    }))
  };
};

export const createAbordagem = async (abordagem: Omit<Abordagem, 'id'>) => {
  const { data: abordagemData, error: abordagemError } = await supabase
    .from('abordagens')
    .insert({
      timestamp: abordagem.timestamp,
      logradouro: abordagem.local.logradouro,
      numero: abordagem.local.numero,
      bairro: abordagem.local.bairro,
      latitude: abordagem.local.latitude,
      longitude: abordagem.local.longitude
    })
    .select()
    .single();

  if (abordagemError) throw abordagemError;

  // Criar relações com pessoas
  const abordagensPessoas = abordagem.pessoas.map(pessoa => ({
    abordagem_id: abordagemData.id,
    pessoa_id: pessoa.id
  }));

  const { error: relationError } = await supabase
    .from('abordagens_pessoas')
    .insert(abordagensPessoas);

  if (relationError) throw relationError;

  return abordagemData;
};

export const updateAbordagem = async (id: string, abordagem: Partial<Omit<Abordagem, 'id'>>) => {
  const { data: abordagemData, error: abordagemError } = await supabase
    .from('abordagens')
    .update({
      timestamp: abordagem.timestamp,
      logradouro: abordagem.local?.logradouro,
      numero: abordagem.local?.numero,
      bairro: abordagem.local?.bairro,
      latitude: abordagem.local?.latitude,
      longitude: abordagem.local?.longitude
    })
    .eq('id', id)
    .select()
    .single();

  if (abordagemError) throw abordagemError;

  if (abordagem.pessoas) {
    // Remover relações antigas
    const { error: deleteError } = await supabase
      .from('abordagens_pessoas')
      .delete()
      .eq('abordagem_id', id);

    if (deleteError) throw deleteError;

    // Criar novas relações
    const abordagensPessoas = abordagem.pessoas.map(pessoa => ({
      abordagem_id: id,
      pessoa_id: pessoa.id
    }));

    const { error: relationError } = await supabase
      .from('abordagens_pessoas')
      .insert(abordagensPessoas);

    if (relationError) throw relationError;
  }

  return abordagemData;
};

export const deleteAbordagem = async (id: string) => {
  const { error } = await supabase
    .from('abordagens')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const getAbordagensByPessoa = async (pessoaId: string) => {
  const { data, error } = await supabase
    .from('abordagens_pessoas')
    .select(`
      abordagem:abordagens (
        *,
        abordagens_pessoas (
          pessoas (
            *,
            veiculos (*)
          )
        )
      )
    `)
    .eq('pessoa_id', pessoaId);

  if (error) throw error;

  // Transforma os dados para o formato esperado
  return data.map(item => {
    const abordagem = item.abordagem as unknown as AbordagemRow;
    return {
      id: abordagem.id,
      timestamp: abordagem.timestamp,
      local: {
        logradouro: abordagem.logradouro,
        numero: abordagem.numero,
        bairro: abordagem.bairro,
        latitude: abordagem.latitude,
        longitude: abordagem.longitude
      },
      pessoas: (abordagem.abordagens_pessoas || []).map(ap => ({
        ...ap.pessoas,
        veiculos: ap.pessoas.veiculos || []
      }))
    };
  });
}; 