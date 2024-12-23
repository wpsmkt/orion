export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      pessoas: {
        Row: {
          id: string
          nome: string | null
          nome_mae: string | null
          nome_pai: string | null
          data_nascimento: string | null
          rg: string | null
          cpf: string | null
          endereco: string | null
          foto_perfil: string | null
          fotos: string[]
          anotacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['pessoas']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['pessoas']['Insert']>
      }
      veiculos: {
        Row: {
          id: string
          pessoa_id: string
          marca: string
          modelo: string
          cor: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['veiculos']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['veiculos']['Insert']>
      }
      abordagens: {
        Row: {
          id: string
          timestamp: string
          logradouro: string
          numero: string
          bairro: string
          latitude: number | null
          longitude: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['abordagens']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['abordagens']['Insert']>
      }
      abordagens_pessoas: {
        Row: {
          id: string
          abordagem_id: string
          pessoa_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['abordagens_pessoas']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['abordagens_pessoas']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 