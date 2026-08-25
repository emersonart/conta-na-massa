# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

### Adicionado
- Estrutura inicial do projeto Full Stack Open Source (Laravel 13 + React 19 + PostgreSQL 16).
- Camada de isolamento de dados com UUIDs, Laravel Policies e PostgreSQL Row-Level Security (RLS).
- Módulo de autenticação segura via Laravel Sanctum (registro, login, logout, me).
- Módulo de gerenciamento de ingredientes com conversão de unidades (g, ml, un) e custo unitário.
- Módulo de receitas com cálculo automático de custos de produção e porção.
- Calculadora de preço de venda e margens de lucro customizáveis (overhead, mão de obra, margem líquida).
- Modo "Vibe": Chat com IA especialista culinário e guardrails de segurança contra prompt injection.
- Suporte multi-provider de IA (OpenAI, Anthropic, Gemini, OpenRouter) configurável via `AI_PROVIDER`.
- Memória de perfil de preferências culinárias com retenção de 30 dias.
- Interface React com paleta gastronômica (#E85D04 / #2D6A4F / Neutros Trigo) e tipografia numérica tabular.
- Documentação completa: README, ARCHITECTURE, API, SECURITY, CONTRIBUTING.
- Suporte a Docker e Docker Compose para desenvolvimento e deploy em produção.

---

## [0.1.0] - 2026-08-23

### Adicionado
- Versão inicial do Conta na Massa.
