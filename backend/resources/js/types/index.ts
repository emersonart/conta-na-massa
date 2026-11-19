export type UnitType = 'g' | 'ml' | 'un';

export interface User {
  id: string;
  name: string;
  email: string;
  pending_email?: string | null;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: UnitType;
  package_quantity: number;
  package_cost_brl: number;
  cost_per_unit_brl: number;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RecipeItem {
  id?: string;
  ingredient_id: string;
  name?: string;
  unit?: UnitType;
  quantity: number;
  cost_per_unit_brl?: number;
  subtotal_cost_brl?: number;
}

export interface FinancialBreakdown {
  recipe_id: string;
  yield_quantity: number;
  yield_unit: string;
  prep_time_minutes: number;
  ingredients_cost_brl: number;
  labor_cost_brl: number;
  base_cost_brl: number;
  overhead_pct: number;
  overhead_value_brl: number;
  total_cost_brl: number;
  profit_margin_pct: number;
  profit_value_brl: number;
  suggested_selling_price_brl: number;
  cost_per_portion_brl: number;
  price_per_portion_brl: number;
  scenarios: {
    direct_sale: number;
    delivery_app_15pct: number;
    wholesale: number;
  };
  breakdown_items: Array<{
    id?: string;
    ingredient_id: string;
    name: string;
    unit: string;
    quantity: number;
    cost_per_unit_brl: number;
    subtotal_brl: number;
  }>;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string | null;
  yield_quantity: number;
  yield_unit: string;
  prep_time_minutes: number;
  notes?: string | null;
  financials?: FinancialBreakdown;
  items?: RecipeItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CostSetting {
  id?: string;
  overhead_pct: number;
  profit_margin_pct: number;
  labor_cost_per_hour_brl: number;
}

export interface AiMessage {
  id?: string;
  session_id?: string;
  role: 'user' | 'assistant';
  content: string;
  is_flagged?: boolean;
  actions_executed?: Array<{
    type: string;
    id?: string;
    name?: string;
    [key: string]: any;
  }>;
  created_at?: string;
}

export interface AiUserProfile {
  id?: string;
  preferences?: Record<string, any>;
  summary?: string;
  last_updated_at?: string;
}
