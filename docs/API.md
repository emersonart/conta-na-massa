# Especificação da API REST — Conta na Massa

> **Base URL**: `/api/v1`  
> **Autenticação**: Sanctum Session Cookie (SPA) ou Bearer Token (`Authorization: Bearer <token>`)

---

## 1. Autenticação

### `POST /api/v1/auth/register`
Cria nova conta de usuário.
- **Request Body**:
  ```json
  {
    "name": "Maria Silva",
    "email": "maria@confeitaria.com",
    "password": "SenhaSegura@2026",
    "password_confirmation": "SenhaSegura@2026"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "user": {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "name": "Maria Silva",
      "email": "maria@confeitaria.com"
    },
    "token": "1|sanctum_plain_text_token"
  }
  ```

### `POST /api/v1/auth/login`
Autentica o usuário.
- **Request Body**:
  ```json
  {
    "email": "maria@confeitaria.com",
    "password": "SenhaSegura@2026"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "user": {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "name": "Maria Silva",
      "email": "maria@confeitaria.com"
    },
    "token": "2|sanctum_plain_text_token"
  }
  ```

### `POST /api/v1/auth/logout`
Encerra a sessão ativa.

### `GET /api/v1/auth/me`
Retorna os dados do usuário autenticado.

---

## 2. Ingredientes

### `GET /api/v1/ingredients`
Lista ingredientes do usuário logado (com busca e paginação).
- **Query Params**: `search=farinha`, `page=1`, `per_page=20`
- **Response `200 OK`**:
  ```json
  {
    "data": [
      {
        "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
        "name": "Farinha de Trigo Especial",
        "unit": "g",
        "package_quantity": 1000.00,
        "package_cost_brl": 6.50,
        "cost_per_unit_brl": 0.0065,
        "notes": "Marca Dona Benta",
        "created_at": "2026-08-23T10:00:00Z"
      }
    ]
  }
  ```

### `POST /api/v1/ingredients`
Cadastra novo ingrediente.
- **Request Body**:
  ```json
  {
    "name": "Manteiga sem Sal",
    "unit": "g",
    "package_quantity": 200,
    "package_cost_brl": 12.90,
    "notes": "82% de gordura"
  }
  ```

### `PUT /api/v1/ingredients/{id}`
Atualiza ingrediente existente do usuário.

### `DELETE /api/v1/ingredients/{id}`
Remove ingrediente do usuário.

---

## 3. Receitas

### `GET /api/v1/recipes`
Lista receitas com resumo financeiro calculado.
- **Response `200 OK`**:
  ```json
  {
    "data": [
      {
        "id": "a3b2c1d0-1234-5678-9abc-def012345678",
        "name": "Bolo de Cenoura com Brigadeiro",
        "description": "Massa fofa e cobertura cremosa",
        "yield_quantity": 12,
        "yield_unit": "fatias",
        "prep_time_minutes": 60,
        "ingredients_count": 6,
        "total_ingredients_cost_brl": 24.50,
        "total_cost_brl": 35.50,
        "suggested_selling_price_brl": 55.00,
        "cost_per_portion_brl": 2.96,
        "price_per_portion_brl": 4.58,
        "profit_margin_pct": 54.9
      }
    ]
  }
  ```

### `POST /api/v1/recipes`
Cria receita com lista de ingredientes e quantidades.
- **Request Body**:
  ```json
  {
    "name": "Pão de Fermentação Natural",
    "description": "Farinha orgânica e levain",
    "yield_quantity": 2,
    "yield_unit": "unidades",
    "prep_time_minutes": 180,
    "notes": "Tempo de fermentação de 24h",
    "items": [
      {
        "ingredient_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
        "quantity": 500
      }
    ]
  }
  ```

### `GET /api/v1/recipes/{id}`
Detalha receita com todos os ingredientes e detalhamento de custos.

### `PUT /api/v1/recipes/{id}`
Atualiza receita e seus ingredientes.

### `DELETE /api/v1/recipes/{id}`
Exclui receita.

---

## 4. Configurações de Custo (`/api/v1/cost-settings`)

### `GET /api/v1/cost-settings`
Retorna as preferências de margem e mão de obra do usuário.

### `PUT /api/v1/cost-settings`
Atualiza preferências financeiras:
```json
{
  "overhead_pct": 20.0,
  "profit_margin_pct": 40.0,
  "labor_cost_per_hour_brl": 25.00
}
```

---

## 5. Modo Vibe — Chat com IA (`/api/v1/ai`)

### `GET /api/v1/ai/history`
Recupera o histórico recente de conversas e o resumo do perfil do usuário.

### `POST /api/v1/ai/chat`
Envia mensagem para o assistente culinário especialista.
- **Request Body**:
  ```json
  {
    "session_id": "optional-uuid",
    "message": "Comprei 1kg de chocolate 50% por 45 reais e usei 200g no bolo de cenoura. Quanto custou essa porção de chocolate?"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "reply": "O chocolate custa R$ 0,045 por grama. Para os 200g utilizados na receita, o custo é de **R$ 9,00**!",
    "extracted_actions": [
      {
        "type": "create_ingredient",
        "data": {
          "name": "Chocolate em Pó 50%",
          "unit": "g",
          "package_quantity": 1000,
          "package_cost_brl": 45.00
        }
      }
    ],
    "user_profile_summary": "Especialista em bolos caseiros e confeitaria artesanal"
  }
  ```
