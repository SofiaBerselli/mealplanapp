export type Ingredient = {
  id: string;
  name: string;
  amount: string;
  unit: string;
};

export type Category = 
  | 'main'
  | 'breakfast'
  | 'salad'
  | 'snack'
  | 'sweet'
  | 'side'
  | 'other';

export type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  category: Category;
  favorite: boolean;
  imageUrl?: string;
  dateCreated: Date;
  dateModified: Date;
};

export type MealPlan = {
  id: string;
  startDate: Date;
  endDate: Date;
  meals: Meal[];
  leftovers: Leftover[];
};

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export type Meal = {
  id: string;
  date: Date;
  type: MealType;
  recipeId: string;
  servings: number;
  notes: string;
};

export type Leftover = {
  id: string;
  fromMealId: string;
  consumedOnDate?: Date;
  consumedInMealId?: string;
  portionsRemaining: number;
};

export type GroceryItem = {
  id: string;
  name: string;
  amount: string;
  unit: string;
  checked: boolean;
  category: string;
};

export type GroceryList = {
  id: string;
  title: string;
  dateCreated: Date;
  mealPlanId: string;
  items: GroceryItem[];
  completed: boolean;
};