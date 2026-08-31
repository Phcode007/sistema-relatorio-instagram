# Sistema de Relatórios Instagram API

Backend inicial da plataforma de relatórios mensais de Instagram, preparado para uma arquitetura modular em NestJS e TypeScript. Esta etapa contém somente a fundação da API e o health check.

## Requisitos

- Node.js 22 ou superior
- npm 10 ou superior

## Instalação

```bash
npm install
```

## Configuração

Copie `.env.example` para `.env` e ajuste as variáveis conforme necessário:

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=
```

`FRONTEND_URL` é opcional nesta etapa e será usada futuramente para restringir a origem do frontend.

## Desenvolvimento

```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000`.

## Build e produção

```bash
npm run build
npm run start:prod
```

## Testes e lint

```bash
npm run lint
npm run test
npm run test:watch
```

## Swagger

A documentação interativa está disponível em:

`http://localhost:3000/api/docs`

## Health check

```http
GET http://localhost:3000/api/health
```

Resposta:

```json
{
  "status": "ok"
}
```
