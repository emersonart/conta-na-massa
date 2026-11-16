# Arquitetura do Sistema — Conta na Massa

> **Visão Técnica e Decisões de Arquitetura (ADRs)**

---

## 1. Visão Geral da Arquitetura

O **Conta na Massa** é construído como uma aplicação desacoplada no padrão **Single-Origin Monolith**: o Frontend Single Page Application (SPA) em React 19 está integrado dentro do repositório em `backend/resources/js`, sendo empacotado pelo Vite e servido diretamente pelo Laravel via rota catch-all no Blade (`welcome.blade.php`).

Isso elimina complexidades de CORS em produção, dispensa proxy reverso adicional e unifica a autenticação por cookies/sessão e tokens Sanctum na mesma porta (8000).

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 19 + Vite)               │
│   - Local: backend/resources/js/                            │
│   - UI/UX: Design Gastronômico (#E85D04 / #2D6A4F / Trigo)  │
│   - Estado: Zustand (AuthStore, RecipeStore, ChatStore)     │
│   - Tipografia Tabular: Inter / Poppins                     │
│   - Input Touch: inputmode="decimal" otimizado p/ cozinha   │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON / REST via Sanctum Cookies / Bearer
┌──────────────────────────────▼──────────────────────────────┐
│                    Backend (Laravel 13 API)                 │
│   - Servidor HTTP: Apache / PHP 8.3 na porta 8000           │
│   - SPA Host: welcome.blade.php com @viteReactRefresh       │
│   - Auth: Laravel Sanctum com Rate Limiting                 │
│   - Controllers: RESTful com FormRequests e API Resources   │
│   - Services:                                               │
│       • CostCalculatorService (Custos, Markup, Margens)     │
│       • AiChatService (Orquestrador de IA + Guardrails)     │
│       • AiUserProfileService (Memória e Perfil de 30 dias)  │
│       • AiProviderFactory (OpenAI, Anthropic, Gemini, etc.) │
│   - Segurança: Policies em todos os resources               │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│               Banco de Dados (PostgreSQL 16)                │
│   - Chaves Primárias: UUIDv4                                │
│   - Row-Level Security (RLS) por user_id                    │
│   - Tipagem Numérica precisa para moedas e gramas           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Decisões Arquiteturais Relevantes (ADRs)

### ADR 01: Multi-Provider de IA com Guardrails Unificados
- **Contexto**: Suportar múltiplos provedores (OpenAI, Anthropic, Gemini, OpenRouter) sem duplicar regras de negócio nem comprometer a segurança.
- **Decisão**: Criar a interface `AiProviderInterface` e a factory `AiProviderFactory`. Toda mensagem passa primeiro pelo pipeline de guardrails do `AiChatService` antes de atingir qualquer provedor.
- **Consequência**: Troca transparente via variável `AI_PROVIDER` sem risco de prompt injection em nenhum dos modelos.

### ADR 02: Memória de Perfil de Usuário com Expiração de 30 Dias
- **Contexto**: A IA precisa entender hábitos do confeiteiro/padeiro sem armazenar histórico eterno desnecessário.
- **Decisão**: Mensagens de chat possuem `expires_at = NOW() + 30 days` e geram sumários periódicos em `ai_user_profiles` (JSONB).
- **Consequência**: Personalização alta, conformidade com privacidade (LGPD/GDPR) e retenção controlada.

### ADR 03: Unidades Base no Banco de Dados
- **Contexto**: Evitar erros de arredondamento em conversões culinárias (ex: 250g de trigo de um pacote de 1kg a R$ 6,00).
- **Decisão**: Banco armazena sempre na menor unidade comum (`g` para peso, `ml` para líquidos, `un` para contagem).
- **Consequência**: Cálculos matemáticos precisos no backend (`cost_per_unit_brl`), interface visual convertendo dinamicamente para kg ou L quando `quantidade >= 1000`.

### ADR 04: Frontend SPA Integrado ao Laravel via Vite (Single-Origin)
- **Contexto**: Manter frontend e backend desacoplados em código, mas fáceis de implantar e gerenciar sem duplicar portas públicas, proxies reversos (Nginx adicionais) ou lidar com problemas de CORS em desenvolvimento/produção.
- **Decisão**: Hospedar a SPA React 19 em `backend/resources/js`, orquestrada pelo plugin oficial `@laravel/vite-plugin`. A rota web padrão do Laravel (`/{any}`) serve a casca Blade (`welcome.blade.php`), e o Vite gerencia os assets compilados em `public/build/`.
- **Consequência**: Build unificado no Docker (`APP_BUILD_ASSETS=true`), ambiente local ágil com HMR instantâneo (`npm run dev`) e comunicação direta com `/api/v1` sob a mesma origem.

---

## 3. Modelo Matemático de Precificação

O `CostCalculatorService` utiliza a seguinte formulação:

$$Custo_{Ingredientes} = \sum (Quantidade_{utilizada} \times Custo_{unitario})$$

$$Custo_{MaoDeObra} = \frac{Tempo_{preparo\_minutos}}{60} \times Custo_{hora}$$

$$Custo_{Base} = Custo_{Ingredientes} + Custo_{MaoDeObra}$$

$$Custo_{Total} = Custo_{Base} \times (1 + \frac{Overhead_{\%}}{100})$$

$$Preco_{Venda} = Custo_{Total} \times (1 + \frac{Lucro_{\%}}{100})$$

$$Preco_{Porcao} = \frac{Preco_{Venda}}{Rendimento}$$
