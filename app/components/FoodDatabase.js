/**
 * Food Database Component
 * Comprehensive nutrition data and food items
 */

const FOOD_DATABASE = [
  // Breakfast Foods
  {
    id: 'oatmeal',
    name: 'Oatmeal Bowl',
    icon: '🥣',
    categories: ['breakfast', 'healthy'],
    calories: 150,
    protein: 5,
    carbs: 27,
    fat: 3,
    isHealthy: true,
    statEffects: {
      health: 5,
      stamina: 3,
      weight: -1,
    },
    description: 'Heart-healthy whole grains to start your day',
    tags: ['fiber', 'whole grain', 'breakfast'],
  },
  {
    id: 'eggs_toast',
    name: 'Eggs & Toast',
    icon: '🍳',
    categories: ['breakfast'],
    calories: 280,
    protein: 18,
    carbs: 25,
    fat: 12,
    isHealthy: true,
    statEffects: {
      health: 3,
      strength: 4,
      stamina: 2,
    },
    description: 'Protein-packed classic breakfast',
    tags: ['protein', 'eggs', 'breakfast'],
  },
  {
    id: 'pancakes',
    name: 'Pancakes',
    icon: '🥞',
    categories: ['breakfast', 'junk'],
    calories: 350,
    protein: 8,
    carbs: 60,
    fat: 14,
    isHealthy: false,
    statEffects: {
      health: -2,
      happiness: 5,
      weight: 3,
    },
    description: 'Sweet and fluffy, but high in sugar',
    tags: ['sweet', 'breakfast', 'treat'],
  },
  {
    id: 'smoothie',
    name: 'Green Smoothie',
    icon: '🥤',
    categories: ['breakfast', 'drinks', 'healthy'],
    calories: 180,
    protein: 8,
    carbs: 35,
    fat: 2,
    isHealthy: true,
    statEffects: {
      health: 6,
      stamina: 4,
      happiness: 2,
    },
    description: 'Nutrient-dense blend of fruits and veggies',
    tags: ['smoothie', 'healthy', 'drink'],
  },

  // Lunch Foods
  {
    id: 'grilled_chicken',
    name: 'Grilled Chicken Salad',
    icon: '🥗',
    categories: ['lunch', 'dinner', 'healthy'],
    calories: 320,
    protein: 35,
    carbs: 15,
    fat: 12,
    isHealthy: true,
    statEffects: {
      health: 8,
      strength: 6,
      weight: -2,
    },
    description: 'Lean protein with fresh vegetables',
    tags: ['protein', 'salad', 'healthy'],
  },
  {
    id: 'burger',
    name: 'Cheeseburger',
    icon: '🍔',
    categories: ['lunch', 'dinner', 'junk'],
    calories: 550,
    protein: 25,
    carbs: 45,
    fat: 30,
    isHealthy: false,
    statEffects: {
      health: -5,
      happiness: 6,
      weight: 5,
      stamina: -2,
    },
    description: 'Tasty but heavy on calories and fat',
    tags: ['burger', 'fast food', 'junk'],
  },
  {
    id: 'sandwich',
    name: 'Turkey Sandwich',
    icon: '🥪',
    categories: ['lunch'],
    calories: 350,
    protein: 24,
    carbs: 40,
    fat: 10,
    isHealthy: true,
    statEffects: {
      health: 3,
      strength: 3,
      stamina: 2,
    },
    description: 'Balanced meal with whole grain bread',
    tags: ['sandwich', 'lunch', 'balanced'],
  },
  {
    id: 'sushi',
    name: 'Sushi Roll',
    icon: '🍣',
    categories: ['lunch', 'dinner', 'healthy'],
    calories: 280,
    protein: 20,
    carbs: 38,
    fat: 5,
    isHealthy: true,
    statEffects: {
      health: 6,
      focus: 4,
      happiness: 3,
    },
    description: 'Fresh fish with rice and vegetables',
    tags: ['sushi', 'japanese', 'healthy'],
  },

  // Dinner Foods
  {
    id: 'steak',
    name: 'Grilled Steak',
    icon: '🥩',
    categories: ['dinner'],
    calories: 450,
    protein: 40,
    carbs: 5,
    fat: 28,
    isHealthy: true,
    statEffects: {
      strength: 8,
      health: 2,
      stamina: 3,
    },
    description: 'High-protein meal for muscle building',
    tags: ['steak', 'protein', 'dinner'],
  },
  {
    id: 'pizza',
    name: 'Pizza Slice',
    icon: '🍕',
    categories: ['lunch', 'dinner', 'junk'],
    calories: 285,
    protein: 12,
    carbs: 36,
    fat: 10,
    isHealthy: false,
    statEffects: {
      health: -3,
      happiness: 7,
      weight: 4,
    },
    description: 'Everyone loves pizza, but moderation is key',
    tags: ['pizza', 'fast food', 'junk'],
  },
  {
    id: 'salmon',
    name: 'Grilled Salmon',
    icon: '🐟',
    categories: ['dinner', 'healthy'],
    calories: 380,
    protein: 35,
    carbs: 8,
    fat: 22,
    isHealthy: true,
    statEffects: {
      health: 9,
      focus: 5,
      stamina: 4,
    },
    description: 'Omega-3 rich fish for brain and heart health',
    tags: ['fish', 'healthy', 'omega-3'],
  },
  {
    id: 'pasta',
    name: 'Pasta Marinara',
    icon: '🍝',
    categories: ['dinner'],
    calories: 420,
    protein: 15,
    carbs: 65,
    fat: 10,
    isHealthy: true,
    statEffects: {
      stamina: 6,
      happiness: 4,
      weight: 1,
    },
    description: 'Carb-loading for endurance activities',
    tags: ['pasta', 'italian', 'carbs'],
  },

  // Snacks
  {
    id: 'apple',
    name: 'Apple',
    icon: '🍎',
    categories: ['snacks', 'healthy'],
    calories: 95,
    protein: 0,
    carbs: 25,
    fat: 0,
    isHealthy: true,
    statEffects: {
      health: 3,
      happiness: 1,
    },
    description: 'A healthy snack full of fiber',
    tags: ['fruit', 'healthy', 'snack'],
  },
  {
    id: 'chips',
    name: 'Potato Chips',
    icon: '🥔',
    categories: ['snacks', 'junk'],
    calories: 160,
    protein: 2,
    carbs: 15,
    fat: 10,
    isHealthy: false,
    statEffects: {
      health: -2,
      happiness: 3,
      weight: 2,
    },
    description: 'Salty and crunchy, but not nutritious',
    tags: ['chips', 'snack', 'junk'],
  },
  {
    id: 'nuts',
    name: 'Mixed Nuts',
    icon: '🥜',
    categories: ['snacks', 'healthy'],
    calories: 170,
    protein: 6,
    carbs: 6,
    fat: 15,
    isHealthy: true,
    statEffects: {
      health: 4,
      focus: 3,
      strength: 2,
    },
    description: 'Healthy fats and protein in a handful',
    tags: ['nuts', 'healthy', 'protein'],
  },
  {
    id: 'chocolate',
    name: 'Chocolate Bar',
    icon: '🍫',
    categories: ['snacks', 'junk'],
    calories: 220,
    protein: 2,
    carbs: 28,
    fat: 12,
    isHealthy: false,
    statEffects: {
      happiness: 8,
      health: -1,
      weight: 3,
    },
    description: 'Sweet treat for occasional enjoyment',
    tags: ['chocolate', 'sweet', 'treat'],
  },
  {
    id: 'yogurt',
    name: 'Greek Yogurt',
    icon: '🥛',
    categories: ['snacks', 'healthy'],
    calories: 130,
    protein: 15,
    carbs: 10,
    fat: 3,
    isHealthy: true,
    statEffects: {
      health: 5,
      strength: 3,
      stamina: 2,
    },
    description: 'Probiotic-rich protein snack',
    tags: ['yogurt', 'protein', 'healthy'],
  },

  // Drinks
  {
    id: 'water',
    name: 'Water',
    icon: '💧',
    categories: ['drinks', 'healthy'],
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    isHealthy: true,
    statEffects: {
      health: 5,
      stamina: 3,
      focus: 2,
    },
    description: 'Essential for hydration and health',
    tags: ['water', 'hydration', 'healthy'],
  },
  {
    id: 'soda',
    name: 'Soda',
    icon: '🥤',
    categories: ['drinks', 'junk'],
    calories: 150,
    protein: 0,
    carbs: 39,
    fat: 0,
    isHealthy: false,
    statEffects: {
      health: -3,
      happiness: 4,
      weight: 2,
      focus: -2,
    },
    description: 'High in sugar with no nutritional value',
    tags: ['soda', 'drink', 'junk'],
  },
  {
    id: 'coffee',
    name: 'Coffee',
    icon: '☕',
    categories: ['drinks'],
    calories: 5,
    protein: 0,
    carbs: 1,
    fat: 0,
    isHealthy: true,
    statEffects: {
      focus: 6,
      stamina: 4,
      happiness: 2,
    },
    description: 'Caffeine boost for energy and focus',
    tags: ['coffee', 'caffeine', 'drink'],
  },
  {
    id: 'protein_shake',
    name: 'Protein Shake',
    icon: '🥤',
    categories: ['drinks', 'healthy'],
    calories: 200,
    protein: 30,
    carbs: 15,
    fat: 3,
    isHealthy: true,
    statEffects: {
      strength: 7,
      stamina: 4,
      health: 3,
    },
    description: 'Post-workout recovery drink',
    tags: ['protein', 'shake', 'fitness'],
  },

  // Special/Cheat Foods
  {
    id: 'ice_cream',
    name: 'Ice Cream',
    icon: '🍦',
    categories: ['snacks', 'junk'],
    calories: 270,
    protein: 4,
    carbs: 35,
    fat: 14,
    isHealthy: false,
    statEffects: {
      happiness: 10,
      health: -2,
      weight: 4,
    },
    description: 'Ultimate comfort food',
    tags: ['ice cream', 'dessert', 'treat'],
  },
  {
    id: 'donut',
    name: 'Donut',
    icon: '🍩',
    categories: ['breakfast', 'snacks', 'junk'],
    calories: 250,
    protein: 3,
    carbs: 30,
    fat: 14,
    isHealthy: false,
    statEffects: {
      happiness: 6,
      health: -3,
      weight: 3,
      stamina: -1,
    },
    description: 'Sweet treat that should be limited',
    tags: ['donut', 'sweet', 'junk'],
  },
  {
    id: 'fried_chicken',
    name: 'Fried Chicken',
    icon: '🍗',
    categories: ['lunch', 'dinner', 'junk'],
    calories: 480,
    protein: 28,
    carbs: 25,
    fat: 28,
    isHealthy: false,
    statEffects: {
      happiness: 7,
      health: -4,
      weight: 5,
      strength: 2,
    },
    description: 'Crispy but high in unhealthy fats',
    tags: ['chicken', 'fried', 'junk'],
  },
];

const FoodDatabase = {
  getAllFoods: () => FOOD_DATABASE,
  
  getFoodById: (id) => FOOD_DATABASE.find(food => food.id === id),
  
  getFoodsByCategory: (category) => 
    FOOD_DATABASE.filter(food => food.categories.includes(category)),
  
  getHealthyFoods: () => FOOD_DATABASE.filter(food => food.isHealthy),
  
  getJunkFoods: () => FOOD_DATABASE.filter(food => !food.isHealthy),
  
  searchFoods: (query) => {
    const lowerQuery = query.toLowerCase();
    return FOOD_DATABASE.filter(food =>
      food.name.toLowerCase().includes(lowerQuery) ||
      food.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  },
  
  getRecentMeals: (mealHistory) => {
    if (!mealHistory || mealHistory.length === 0) return [];
    
    // Get unique recent food items
    const recentFoodIds = [...new Set(
      mealHistory
        .slice(-10) // Last 10 meals
        .map(meal => meal.food?.id)
        .filter(Boolean)
    )];
    
    return recentFoodIds
      .map(id => FOOD_DATABASE.find(food => food.id === id))
      .filter(Boolean);
  },
  
  calculateDailyNutrition: (meals) => {
    return meals.reduce((totals, meal) => {
      const food = meal.food;
      if (!food) return totals;
      
      return {
        calories: totals.calories + food.calories,
        protein: totals.protein + food.protein,
        carbs: totals.carbs + food.carbs,
        fat: totals.fat + food.fat,
        healthyMeals: totals.healthyMeals + (food.isHealthy ? 1 : 0),
        junkMeals: totals.junkMeals + (!food.isHealthy ? 1 : 0),
      };
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      healthyMeals: 0,
      junkMeals: 0,
    });
  },
};

export default FoodDatabase;