# Sistema de Abordagem

Sistema web responsivo para registro e gerenciamento de abordagens, desenvolvido com React, TypeScript e Material UI.

## Funcionalidades

- Registro de novas abordagens com captura de localização GPS
- Cadastro e pesquisa de pessoas abordadas
- Upload e gerenciamento de fotos
- Registro de veículos associados
- Armazenamento local usando localStorage
- Interface responsiva e amigável
- Listagem e visualização de todas as abordagens

## Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

## Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
cd sistema-abordagem
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

## Estrutura do Projeto

```
src/
  ├── components/        # Componentes reutilizáveis
  ├── pages/            # Páginas da aplicação
  ├── types/            # Definições de tipos TypeScript
  ├── utils/            # Funções utilitárias
  ├── hooks/            # Hooks personalizados
  ├── App.tsx           # Componente principal
  └── main.tsx          # Ponto de entrada
```

## Tecnologias Utilizadas

- React
- TypeScript
- Material UI
- React Router
- Vite

## Armazenamento

Todos os dados são armazenados localmente no localStorage do navegador. A estrutura de dados inclui:

- Informações de localização (GPS)
- Dados pessoais dos abordados
- Fotos (armazenadas em base64)
- Informações de veículos
- Anotações e observações

## Desenvolvimento Futuro

Para uma versão de produção, considere:

- Implementar um backend para persistência de dados
- Adicionar autenticação e autorização
- Otimizar o armazenamento de imagens
- Implementar sincronização offline
- Adicionar testes automatizados

## Licença

Este projeto está sob a licença MIT.
