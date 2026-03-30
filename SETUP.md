# Configuração do Projeto

## Variáveis de Ambiente

Este projeto utiliza variáveis de ambiente para gerenciar credenciais e configurações sensíveis.

### Passo 1: Instalar dependências

```bash
npm install
npm install dotenv
```

### Passo 2: Configurar arquivo .env

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env` e adicione suas credenciais reais:
   - `MONGODB_DENUNCIAS_URI`: Sua string de conexão MongoDB para o database de denúncias
   - `MONGODB_LOGIN_URI`: Sua string de conexão MongoDB para o database de login
   - `PORT`: Porta que o servidor rodará (padrão: 3000)
   - `API_BASE_URL`: URL base da API

### Passo 3: Executar o servidor

```bash
node server.js
```

## Segurança

- ✅ O arquivo `.env` está no `.gitignore` e NÃO será commitado
- ✅ Todas as credenciais foram removidas do código
- ✅ Use o arquivo `.env.example` como referência ao clonar o projeto em novo ambiente
- ✅ Nunca compartilhe seu arquivo `.env` real

## Para fazer deploy

1. Certifique-se de que o `.env` NÃO está sendo commitado
2. No servidor, crie um arquivo `.env` com as variáveis de ambiente apropriadas
3. Instale o pacote `dotenv` no servidor: `npm install dotenv`
