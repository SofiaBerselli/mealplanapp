import { create } from 'zustand';
import { Recipe, MealPlan, GroceryList, Meal, Leftover } from '@/types/recipe';
import { mockRecipes } from '@/data/mockData';

interface RecipeState {
  recipes: Recipe[];
  mealPlans: MealPlan[];
  groceryLists: GroceryList[];
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  toggleFavorite: (id: string) => void;
  createMealPlan: (startDate: Date, endDate: Date) => MealPlan;
  addMealToPlan: (planId: string, meal: Meal) => void;
  removeMealFromPlan: (planId: string, mealId: string) => void;
  updateMeal: (planId: string, mealId: string, updatedMeal: Partial<Meal>) => void;
  generateMealPlan: (startDate: Date, endDate: Date, preferences?: any) => MealPlan;
  createGroceryList: (mealPlanId: string) => GroceryList;
  toggleGroceryItem: (listId: string, itemId: string) => void;
  getRecipeById: (id: string) => Recipe | undefined;
  getMealPlanById: (id: string) => MealPlan | undefined;
  getGroceryListById: (id: string) => GroceryList | undefined;
  getCurrentMealPlan: () => MealPlan | undefined;
  getRecipesByCategory: (category: string) => Recipe[];
  getFavoriteRecipes: () => Recipe[];
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [...mockRecipes],
  mealPlans: [],
  groceryLists: [],

  addRecipe: (recipe) => set((state) => ({
    recipes: [...state.recipes, recipe]
  })),

  updateRecipe: (id, updatedRecipe) => set((state) => ({
    recipes: state.recipes.map((recipe) => 
      recipe.id === id ? { ...recipe, ...updatedRecipe, dateModified: new Date() } : recipe
    )
  })),

  deleteRecipe: (id) => set((state) => ({
    recipes: state.recipes.filter((recipe) => recipe.id !== id)
  })),

  toggleFavorite: (id) => set((state) => ({
    recipes: state.recipes.map((recipe) => 
      recipe.id === id ? { ...recipe, favorite: !recipe.favorite } : recipe
    )
  })),

  createMealPlan: (startDate, endDate) => {
    const newMealPlan = {
      id: Date.now().toString(),
      startDate,
      endDate,
      meals: [],
      leftovers: []
    };
    
    set((state) => ({
      mealPlans: [...state.mealPlans, newMealPlan]
    }));
    
    return newMealPlan;
  },

  addMealToPlan: (planId, meal) => set((state) => ({
    mealPlans: state.mealPlans.map((plan) => 
      plan.id === planId 
        ? { ...plan, meals: [...plan.meals, meal] }
        : plan
    )
  })),

  removeMealFromPlan: (planId, mealId) => set((state) => ({
    mealPlans: state.mealPlans.map((plan) => 
      plan.id === planId 
        ? { 
            ...plan, 
            meals: plan.meals.filter(meal => meal.id !== mealId),
            leftovers: plan.leftovers.filter(leftover => 
              leftover.fromMealId !== mealId && leftover.consumedInMealId !== mealId
            )
          }
        : plan
    )
  })),

  updateMeal: (planId, mealId, updatedMeal) => set((state) => ({
    mealPlans: state.mealPlans.map((plan) => 
      plan.id === planId 
        ? { 
            ...plan, 
            meals: plan.meals.map(meal => 
              meal.id === mealId ? { ...meal, ...updatedMeal } : meal
            )
          }
        : plan
    )
  })),

  generateMealPlan: (startDate, endDate, preferences) => {
    // Create a date array for each day in the meal plan
    const dates = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Simple implementation - just randomly assign recipes
    // In a real app, this would have a more sophisticated algorithm for leftovers
    const { recipes } = get();
    const mainDishes = recipes.filter(r => r.category === 'main');
    const breakfastDishes = recipes.filter(r => r.category === 'breakfast');
    
    const meals = [];
    const leftovers: Leftover[] = [];
    
    dates.forEach(date => {
      // Add breakfast
      if (breakfastDishes.length > 0) {
        const randomBreakfast = breakfastDishes[Math.floor(Math.random() * breakfastDishes.length)];
        meals.push({
          id: `breakfast-${date.toISOString()}`,
          date,
          type: 'breakfast',
          recipeId: randomBreakfast.id,
          servings: 2,
          notes: ''
        });
      }
      
      // Add lunch and dinner
      for (const mealType of ['lunch', 'dinner'] as MealType[]) {
        const useLeftovers = leftovers.length > 0 && Math.random() > 0.5;
        
        if (useLeftovers) {
          // Use a leftover
          const leftoverToUse = leftovers[0];
          leftoverToUse.consumedOnDate = date;
          leftoverToUse.consumedInMealId = `${mealType}-${date.toISOString()}`;
          
          // Remove the used leftover
          leftovers.splice(0, 1);
        } else {
          // Create a new meal with a random main dish
          const randomMain = mainDishes[Math.floor(Math.random() * mainDishes.length)];
          const mealId = `${mealType}-${date.toISOString()}`;
          
          meals.push({
            id: mealId,
            date,
            type: mealType,
            recipeId: randomMain.id,
            servings: 4,
            notes: ''
          });
          
          // Create a leftover for this meal
          leftovers.push({
            id: `leftover-${Date.now()}-${Math.random()}`,
            fromMealId: mealId,
            portionsRemaining: 2
          });
        }
      }
    });
    
    const newMealPlan = {
      id: Date.now().toString(),
      startDate,
      endDate,
      meals,
      leftovers
    };
    
    set((state) => ({
      mealPlans: [...state.mealPlans, newMealPlan]
    }));
    
    return newMealPlan;
  },
  
  createGroceryList: (mealPlanId) => {
    const { mealPlans, recipes } = get();
    const mealPlan = mealPlans.find(mp => mp.id === mealPlanId);
    
    if (!mealPlan) {
      throw new Error("Meal plan not found");
    }
    
    // Gather all recipes used in the meal plan
    const mealRecipeIds = mealPlan.meals.map(meal => meal.recipeId);
    const uniqueRecipeIds = [...new Set(mealRecipeIds)];
    const recipesUsed = uniqueRecipeIds.map(id => recipes.find(r => r.id === id)).filter(Boolean) as Recipe[];
    
    // Create grocery list items
    const groceryItems: { [key: string]: GroceryItem } = {};
    
    recipesUsed.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        const key = `${ingredient.name.toLowerCase()}-${ingredient.unit.toLowerCase()}`;
        
        if (groceryItems[key]) {
          // If this ingredient already exists, add to its amount
          const currentAmount = parseFloat(groceryItems[key].amount) || 0;
          const additionalAmount = parseFloat(ingredient.amount) || 0;
          
          groceryItems[key].amount = (currentAmount + additionalAmount).toString();
        } else {
          // Otherwise, add it as a new item
          groceryItems[key] = {
            id: `item-${Date.now()}-${Math.random()}`,
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
            checked: false,
            category: getIngredientCategory(ingredient.name),
          };
        }
      });
    });
    
    const groceryList: GroceryList = {
      id: `list-${Date.now()}`,
      title: `Grocery list for ${mealPlan.startDate.toLocaleDateString()} - ${mealPlan.endDate.toLocaleDateString()}`,
      dateCreated: new Date(),
      mealPlanId,
      items: Object.values(groceryItems),
      completed: false
    };
    
    set((state) => ({
      groceryLists: [...state.groceryLists, groceryList]
    }));
    
    return groceryList;
  },
  
  toggleGroceryItem: (listId, itemId) => set((state) => ({
    groceryLists: state.groceryLists.map(list => 
      list.id === listId
        ? {
            ...list,
            items: list.items.map(item => 
              item.id === itemId
                ? { ...item, checked: !item.checked }
                : item
            )
          }
        : list
    )
  })),

  getRecipeById: (id) => {
    return get().recipes.find(recipe => recipe.id === id);
  },

  getMealPlanById: (id) => {
    return get().mealPlans.find(plan => plan.id === id);
  },

  getGroceryListById: (id) => {
    return get().groceryLists.find(list => list.id === id);
  },

  getCurrentMealPlan: () => {
    const { mealPlans } = get();
    const now = new Date();
    return mealPlans.find(plan => plan.startDate <= now && plan.endDate >= now);
  },

  getRecipesByCategory: (category) => {
    return get().recipes.filter(recipe => recipe.category === category);
  },

  getFavoriteRecipes: () => {
    return get().recipes.filter(recipe => recipe.favorite);
  }
}));

// Helper function to categorize ingredients
function getIngredientCategory(ingredientName: string): string {
  const categories: { [key: string]: RegExp[] } = {
    'Produce': [/apple/i, /banana/i, /carrot/i, /lettuce/i, /tomato/i, /potato/i, /onion/i, /garlic/i, /pepper/i, /vegetable/i, /fruit/i],
    'Meat & Seafood': [/beef/i, /chicken/i, /pork/i, /fish/i, /shrimp/i, /meat/i, /salmon/i, /tuna/i],
    'Dairy': [/milk/i, /cheese/i, /yogurt/i, /cream/i, /butter/i, /egg/i],
    'Bakery': [/bread/i, /roll/i, /bun/i, /bagel/i, /muffin/i, /pastry/i],
    'Pantry': [/flour/i, /sugar/i, /oil/i, /vinegar/i, /spice/i, /sauce/i, /can/i, /pasta/i, /rice/i, /bean/i]
  };

  for (const [category, patterns] of Object.entries(categories)) {
    if (patterns.some(pattern => pattern.test(ingredientName))) {
      return category;
    }
  }

  return 'Other';
}