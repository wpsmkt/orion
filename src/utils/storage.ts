import { Abordagem, Pessoa } from '../types';

const STORAGE_KEY = 'abordagens';
const PESSOAS_KEY = 'pessoas';
const MAX_ITEMS = 100;

export const getPessoas = (): Pessoa[] => {
  try {
    const data = localStorage.getItem(PESSOAS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao obter pessoas:', error);
    return [];
  }
};

export const getPessoa = (id: string): Pessoa | null => {
  try {
    const pessoas = getPessoas();
    return pessoas.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Erro ao obter pessoa:', error);
    return null;
  }
};

export const savePessoa = (pessoa: Pessoa): void => {
  try {
    const pessoas = getPessoas();
    const index = pessoas.findIndex(p => p.id === pessoa.id);
    
    if (index >= 0) {
      // Atualiza a pessoa existente
      pessoas[index] = {
        ...pessoas[index],
        ...pessoa,
        id: pessoas[index].id // Mantém o ID original
      };
    } else {
      // Adiciona nova pessoa
      pessoas.push({
        ...pessoa,
        id: pessoa.id || Date.now().toString()
      });
    }
    
    localStorage.setItem(PESSOAS_KEY, JSON.stringify(pessoas));
  } catch (error) {
    console.error('Erro ao salvar pessoa:', error);
    throw new Error('Falha ao salvar pessoa no localStorage');
  }
};

export const deletePessoa = (id: string): void => {
  try {
    const pessoas = getPessoas();
    const novasPessoas = pessoas.filter(p => p.id !== id);
    localStorage.setItem(PESSOAS_KEY, JSON.stringify(novasPessoas));
  } catch (error) {
    console.error('Erro ao excluir pessoa:', error);
    throw new Error('Falha ao excluir pessoa do localStorage');
  }
};

export const searchPessoas = (query: string): Pessoa[] => {
  try {
    const pessoas = getPessoas();
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) return [];

    return pessoas.filter(pessoa => 
      (pessoa.nome?.toLowerCase() || '').includes(searchTerm) ||
      (pessoa.nomeMae?.toLowerCase() || '').includes(searchTerm) ||
      (pessoa.nomePai?.toLowerCase() || '').includes(searchTerm) ||
      (pessoa.rg?.toLowerCase() || '').includes(searchTerm) ||
      (pessoa.cpf?.toLowerCase() || '').includes(searchTerm)
    );
  } catch (error) {
    console.error('Erro ao pesquisar pessoas:', error);
    return [];
  }
};

export const getAbordagens = (): Abordagem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao obter abordagens:', error);
    return [];
  }
};

export const getAbordagem = (id: string): Abordagem | null => {
  try {
    const abordagens = getAbordagens();
    return abordagens.find(a => a.id === id) || null;
  } catch (error) {
    console.error('Erro ao obter abordagem:', error);
    return null;
  }
};

export const saveAbordagem = (abordagem: Abordagem): void => {
  try {
    const abordagens = getAbordagens();
    const index = abordagens.findIndex(a => a.id === abordagem.id);
    
    if (index >= 0) {
      // Atualiza a abordagem existente
      abordagens[index] = abordagem;
    } else {
      // Adiciona nova abordagem
      abordagens.push(abordagem);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(abordagens));
  } catch (error) {
    console.error('Erro ao salvar abordagem:', error);
    throw new Error('Falha ao salvar abordagem no localStorage');
  }
};

export const deleteAbordagem = (id: string): void => {
  try {
    const abordagens = getAbordagens();
    const novasAbordagens = abordagens.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novasAbordagens));
  } catch (error) {
    console.error('Erro ao excluir abordagem:', error);
    throw new Error('Falha ao excluir abordagem do localStorage');
  }
};

export const getAbordagensByPessoa = (pessoaId: string): Abordagem[] => {
  try {
    const abordagens = getAbordagens();
    return abordagens
      .filter(abordagem => abordagem.pessoas.some(pessoa => pessoa.id === pessoaId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error('Erro ao obter abordagens da pessoa:', error);
    return [];
  }
}; 