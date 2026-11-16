# 🥐 Conta na Massa

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](https://opensource.org/licenses/MIT)
[![Laravel](https://img.shields.io/badge/Laravel-13.x-red.svg)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com)

**Sistema Open Source de Gestão de Custos e Precificação Inteligente para Confeitaria & Panificação com Modo Vibe (IA).**

[Funcionalidades](#-funcionalidades) •
[Modo Vibe (IA)](#-modo-vibe--ia-culinária) •
[Segurança & Isolamento](#-segurança--isolamento-de-dados) •
[Instalação](#-instalação-e-execução) •
[Documentação](#-documentação) •
[Licença](#-licença)

</div>

---

## 🎯 Por que o Conta na Massa existe?

Na gastronomia e confeitaria artesanal, o maior vilão da lucratividade é a **precificação empírica** (o famoso "multiplicar o ingrediente por 3"). Esse método ignora:
1. O tempo de mão de obra dedicado na cozinha.
2. Custos fixos invisíveis (gás, energia do forno, água, embalagens e detergente).
3. Frações exatas de ingredientes (ex: usar 250g de um pacote de 1kg comprado a R$ 6,50).

O **Conta na Massa** resolve isso automaticamente através de **fichas técnicas precisas**, cálculos de ponto de equilíbrio e um assistente de IA especialista com guardrails rigorosos de segurança.

---

## ✨ Funcionalidades

### 🌾 Despensa de Ingredientes
- Cadastro ágil com o valor da embalagem de compra.
- Armazenamento padronizado em unidades base no banco (`g`, `ml`, `un`) com conversão inteligente na interface (`kg`, `L`).
- Cálculo automático do custo fracionado por grama, mililitro ou unidade.

### 🥐 Fichas Técnicas de Receitas
- Adição dinâmica de múltiplos insumos com quantidades precisas.
- Cálculo automático de rendimento e custo de produção por porção.
- Escalonador de fornadas interativo (multiplica receitas para 1x, 2x, 5x ou 10x instantaneamente).
- Visualização gráfica de proporções (Ingredientes vs Mão de Obra vs Custos Fixos vs Lucro Líquido).

### 📊 Simulador de Canais de Venda
- **Venda Direta / Balcão**: Lucro líquido integral.
- **Aplicativos de Delivery (iFood/Rappi)**: Repasse de taxa para preservar sua margem.
- **Atacado / Revenda**: Cálculo de preço mínimo com desconto para pedidos em volume.

---

## 👨‍🍳 Modo Vibe — IA Culinária

O Modo Vibe permite conversar em linguagem natural com o **Chef Vibe**, uma IA treinada para o segmento gastronômico que:
- Registra ingredientes e receitas automaticamente no banco de dados.
- Calcula custos de pratos descritos em texto.
- Sugere preços justos de venda com base nas suas preferências.
- **Memória de Perfil (30 Dias)**: Memoriza hábitos, especialidades e preferências culinárias do confeiteiro ao longo do tempo.

### 🛡️ Guardrails e Defesa contra Prompt Injection
Por ser um projeto open source, o sistema possui um pipeline de segurança em 8 camadas para impedir injeção de prompt:
1. Sanitização estrita de entrada (strip tags, normalização unicode).
2. Detector de heurísticas contra tentativas de bypass (`ignore previous instructions`, `act as system`, `dump prompt`).
3. System prompt imutável e hardcoded.
4. Input do usuário alocado exclusivamente na role `user`.
5. Validação obrigatória de schema JSON em structured outputs.
6. Rate limiting ativo por minuto e limite de tokens por requisição.

### 🔌 Suporte Multi-Provider de IA
Configure seu provedor preferido no `.env` via chave master `AI_PROVIDER`:
- **OpenAI** (Padrão — `OPENAI_API_KEY`, `OPENAI_BASE_URL` customizável)
- **Anthropic Claude** (`ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`)
- **Google Gemini** (`GEMINI_API_KEY`, `GEMINI_MODEL`)
- **OpenRouter** (`OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL`)

---

## 🔒 Segurança & Isolamento de Dados

- **Isolamento Total (3 Camadas)**:
  1. *Aplicação*: Toda consulta Eloquent filtra estritamente por `user_id = auth()->id()`.
  2. *Laravel Policies*: Verificação de permissões em todas as ações de CRUD.
  3. *PostgreSQL Row-Level Security (RLS)*: Políticas ativas no banco de dados.
- **Chaves Primárias UUID**: Nenhum ID sequencial incremental é exposto nas APIs.
- **Zero Secrets Expostos**: O arquivo `.env` é estritamente ignorado no git. O repositório conta com secret scanning no CI.
- **Autenticação Sanctum**: Tokens seguros e proteção CSRF nativa.

---

## 🎨 Paleta de Cores e Design Gastronômico

Desenvolvido especialmente para ser utilizado com facilidade no ambiente de cozinha (telas móveis, botões touch grandes):
- **Laranja Queimado (`#E85D04`) & Mostarda (`#F4A261`)**: Ação, apetite e destaques.
- **Verde Sálvia & Esmeralda (`#2D6A4F`)**: Lucro líquido, frescor e indicadores financeiros.
- **Tons de Trigo & Farinha (`#FDFBF7` / `#F8F6F0`)**: Fundo quente que reduz o cansaço visual.
- **Tipografia Numérica Tabular**: Fontes `Inter` e `Poppins` com alinhamento tabular (`tnum`) para leitura precisa de decimais e gramas.

---

## 📂 Estrutura do Projeto

O **Conta na Massa** é construído como um monólito integrado moderno (*Single-Origin*). O frontend SPA (React 19 + TypeScript + Vite + Tailwind CSS v4) está hospedado diretamente dentro de `backend/resources/js`, sendo servido de forma unificada pelo Laravel através do Vite:

```text
conta-na-massa/
├── backend/
│   ├── app/                 # Models, Controllers, Services e IA Guardrails
│   ├── resources/
│   │   ├── js/              # Frontend SPA (React 19, TypeScript, Zustand, Tailwind v4)
│   │   │   ├── api/         # Cliente Axios e interceptors
│   │   │   ├── components/  # Componentes reutilizáveis (UI e Layout)
│   │   │   ├── pages/       # Páginas (Dashboard, Despensa, Receitas, Modo Vibe)
│   │   │   └── stores/      # Gerenciamento de estado global com Zustand
│   │   └── views/           # Blade host da SPA (welcome.blade.php)
│   ├── routes/              # Rotas web (catch-all SPA) e API RESTful (/api/v1)
│   └── vite.config.ts       # Configuração do Vite com plugin Laravel e React
├── docker/                  # Configurações de contêineres Docker
└── docs/                    # Documentação detalhada (Arquitetura, API, Segurança)
```

---

## 🚀 Instalação e Execução

### Opção 1: Via Docker Compose (Recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/emersonart/conta-na-massa.git
cd conta-na-massa

# 2. Configure o ambiente
cp backend/.env.example backend/.env

# 3. Suba todos os contêineres (PostgreSQL 16 + Laravel 13 & React 19 + Mailpit)
docker compose up -d

# 4. Execute as migrações
docker compose exec backend php artisan migrate
```

Acesse:
- **Aplicação Completa (Frontend SPA & API)**: `http://localhost:8000`
- **Mailpit (Emails locais)**: `http://localhost:8025`

---

### Opção 2: Desenvolvimento Local

#### Requisitos
- PHP 8.3+ com extensões `pdo_pgsql` ou `sqlite`
- Composer 2.8+
- Node.js 22+ e npm

```bash
cd backend

# Instale as dependências PHP e Node.js
composer install
npm install

# Configure o ambiente e banco de dados
cp .env.example .env
php artisan key:generate
php artisan migrate

# Em um terminal (API Laravel):
php artisan serve

# Em outro terminal (Vite Dev Server com HMR para React 19):
npm run dev
```

Acesse a aplicação em `http://localhost:8000`.

---

## 🧪 Testes Automatizados

O projeto possui suíte completa de testes automatizados:

```bash
# Executar todos os testes backend
cd backend
php artisan test

# Build e verificação de tipagem do frontend (React 19 + TypeScript)
cd backend
npm run build
```

---

## 📚 Documentação

- 📖 [Arquitetura e Decisões Técnicas (ADRs)](docs/ARCHITECTURE.md)
- 🔌 [Especificação da API RESTful](docs/API.md)
- 🛡️ [Política de Segurança e Reporte](docs/SECURITY.md)
- 🤝 [Guia de Contribuição](docs/CONTRIBUTING.md)
- 📜 [Changelog e Versões](CHANGELOG.md)

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo [`LICENSE`](LICENSE) para obter mais informações.
