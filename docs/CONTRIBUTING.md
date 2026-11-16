# Guia de Contribuição — Conta na Massa

Obrigado pelo interesse em contribuir com o **Conta na Massa**! Este é um projeto open source comunitário focado em confeiteiros, padeiros e entusiastas da gastronomia.

---

## 1. Código de Conduta

- Seja respeitoso e acolhedor com todos os contribuidores.
- Mantenha discussões técnicas focadas em soluções limpas e pragmáticas.
- Não tolere assédio ou linguagem ofensiva.

---

## 2. Como Contribuir

### 2.1 Criando uma Issue
- Verifique se a issue já não foi aberta.
- Descreva o problema claramente, incluindo passos para reproduzir, sistema operacional e comportamento esperado.

### 2.2 Submetendo Pull Requests (PRs)
1. Faça um Fork do repositório.
2. Crie uma branch para sua feature/correção: `git checkout -b feature/minha-feature` ou `fix/meu-fix`.
3. Siga as convenções de código:
   - **Backend**: PSR-12, Tipagem estrita PHP, FormRequests para validações, Policies para autorização.
   - **Frontend**: TypeScript rigoroso, Componentes reutilizáveis, Tailwind CSS com a paleta oficial (Laranja Queimado `#E85D04`, Verde Sálvia `#2D6A4F`, Neutros Trigo).
4. Escreva testes automatizados para toda nova funcionalidade ou correção de bug.
5. Verifique se todos os testes passam antes de abrir o PR:
   ```bash
   # Backend
   cd backend && php artisan test
   
   # Frontend (React 19 + TypeScript)
   cd backend && npm run build
   ```
6. Abra o PR com uma descrição detalhada das mudanças.

---

## 3. Segurança e Segredos

- **NUNCA** submeta PRs contendo arquivos `.env`, chaves de API, credenciais ou dados pessoais.
- Mantenha o `.env.example` atualizado sempre que novas variáveis de configuração forem introduzidas.
