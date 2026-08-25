# Política de Segurança — Conta na Massa

> **Projeto Open Source**: Levamos a segurança e o isolamento de dados com prioridade máxima.

---

## 1. Relato de Vulnerabilidades

Se você descobriu uma vulnerabilidade de segurança no **Conta na Massa**, por favor **NÃO** abra uma issue pública.

Em vez disso, envie um e-mail com os detalhes para:
**security@contanamassa.org** (ou abra uma [Security Advisory Privada](https://github.com/emersonart/conta-na-massa/security/advisories/new) no GitHub).

Por favor inclua:
- Tipo de vulnerabilidade (ex: Injeção de Prompt, Vazamento de Tenancy, Quebra de Autenticação).
- Passo a passo detalhado ou script de reprodução (PoC).
- Impacto potencial estimado.

Garantimos retorno em até 48 horas e crédito público após a correção (salvo se solicitado anonimato).

---

## 2. Princípios de Segurança e Isolamento de Dados

### 2.1 Multi-tenancy e Isolamento Rigoroso (3 Camadas)
1. **Camada de Aplicação**: Todo Eloquent Model e Query Builder filtra obrigatoriamente por `user_id = auth()->id()`.
2. **Laravel Policies**: Todas as rotas de manipulação de dados utilizam `authorize('view'|'update'|'delete', $resource)` garantindo que o recurso pertença exclusivamente ao usuário autenticado.
3. **PostgreSQL Row-Level Security (RLS)**: Tabelas sensíveis (`ingredients`, `recipes`, `cost_settings`, `ai_conversations`, `ai_user_profiles`) possuem políticas de RLS ativas para evitar vazamento acidental em consultas complexas ou migrações.
4. **UUIDs**: Nenhum ID sequencial incremental é exposto nas rotas públicas ou payloads de API, mitigando ataques de enumeração / IDOR.

### 2.2 Gestão Segura de Variáveis de Ambiente e Segredos
- O arquivo `.env` está estritamente adicionado ao `.gitignore` e **nunca** deve ser commitado.
- O `.env.example` é versionado contendo apenas chaves com valores em branco ou valores padrão de sandbox seguros.
- Tokens e chaves de API (`APP_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`) nunca devem ser hardcoded em código-fonte.
- CI/CD no GitHub Actions utiliza `GitHub Secrets` e ferramentas de Secret Scanning (Gitleaks / Trivy).

### 2.3 Modo Vibe — Guardrails de IA e Defesa contra Prompt Injection
Para evitar que entradas maliciosas manipulem o comportamento do agente ou extraiam dados do sistema:
1. **Sanitização de Entrada**: Normalização Unicode, strip de tags HTML, remoção de caracteres de controle.
2. **Filtro de Heurística / Padrões de Injeção**: Bloqueio de termos como `ignore previous instructions`, `act as system`, `system:`, delimitadores de payload e tentativas de jailbreak.
3. **System Prompt Imutável**: O System Prompt é hardcoded no backend e nunca interpolado com dados fornecidos pelo usuário.
4. **Entrada Estrita em User Role**: Entradas do usuário são encapsuladas exclusivamente no payload de mensagem do tipo `user`.
5. **Structured Outputs Obrigatórios**: Todas as respostas da IA para ações estruturadas (criação de ingredientes/receitas) exigem validação de schema JSON estrito.
6. **Rate Limiting e Limite de Tokens**: Limitação de tamanho de mensagem de entrada (`AI_MAX_TOKENS_INPUT`) e frequência de requisições por usuário (`AI_MAX_MESSAGES_PER_MINUTE`).
7. **Auditoria e Flagging**: Tentativas suspeitas são salvas com `is_flagged = true` para auditoria e rate-limit penalizado.

### 2.4 Proteções HTTP & API
- **Sanctum SPA Auth**: Autenticação baseada em cookies HttpOnly, SameSite=Lax e verificação de token CSRF.
- **Rate Limiting**: Throttling ativo em rotas de login/registro (5 requisições/minuto) e chat de IA.
- **Security Headers**: Middleware configurado com `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin` e `Content-Security-Policy`.
- **Validação de Entrada**: FormRequests com regras estritas e rejeição fail-fast sem vazamento de stack traces em produção (`APP_DEBUG=false`).

---

## 3. Versões Suportadas

| Versão | Suporte de Segurança |
| :--- | :--- |
| 1.x (Laravel 13 + React 19) | :white_check_mark: Suportado |
| < 1.0.0 (Prerelease) | :x: Não suportado |
