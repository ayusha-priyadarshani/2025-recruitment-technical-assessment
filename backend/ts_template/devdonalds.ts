import express, { Request, Response } from "express";

// ==== Type Definitions, feel free to add or modify ==========================
interface cookbookEntry {
  name: string;
  type: string;
}

interface requiredItem {
  name: string;
  quantity: number;
}

interface recipe extends cookbookEntry {
  requiredItems: requiredItem[];
}

interface ingredient extends cookbookEntry {
  cookTime: number;
}

interface RecipeSummary {
  name: string;
  ingredients: {
      name: string;
      quantity: number;
  }[];
  totalCookTime: number;
}

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
const cookbook: any = null;

// Task 1 helper (don't touch)
app.post("/parse", (req:Request, res:Response) => {
  const { input } = req.body;

  const parsed_string = parse_handwriting(input)
  if (parsed_string == null) {
    res.status(400).send("this string is cooked");
    return;
  } 
  res.json({ msg: parsed_string });
  return;
  
});

// [TASK 1] ====================================================================
// Takes in a recipeName and returns it in a form that 
const parse_handwriting = (recipeName: string): string | null => {
  // If input is of an invalid type
  if (!recipeName || typeof recipeName !== 'string') {
    return null;
  }

  // Replace hyphens and underscores with spaces
  let recipe = recipeName.replace(/[-_]/g, ' ');

  // Remove all characters except letters and spaces
  recipe = recipe.replace(/[^a-zA-Z\s]/g, '');

  // Remove extra spaces and trim
  recipe = recipe.trim().replace(/\s+/g, ' ');

  // Check if string is empty after processing
  if (!recipe) {
      return null;
  }

  // Capitalize first letter of each word and make rest lowercase
  recipe = recipe.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

  return recipe;
}

// [TASK 2] ====================================================================
// Endpoint that adds a CookbookEntry to your magical cookbook
app.post("/entry", (req:Request, res:Response) => {
  const entry = req.body as cookbookEntry;

  if (isValidEntry(entry)) {
    res.status(200).send({});
    cookbook.push(entry);
  } else {
    res.status(400).send("huh???");
  }
});

function isValidEntry(entry: cookbookEntry): boolean {
  if (!entry || typeof entry.name !== "string") return false;

  // Check type is valid
  if (entry.type !== 'recipe' && entry.type !== 'ingredient') return false;

  if (entry.type === "ingredient") {
    const ingredient = entry as ingredient;
    if (typeof ingredient.cookTime !== "number" || ingredient.cookTime < 0) return false;
  } else {
    const recipe = entry as recipe;
    
    // Invalid input type
    if (!Array.isArray(recipe.requiredItems)) return false;
    
    // Check if name and quantity are in correct format
    const elementsFound = new Set<string>();
    for (const { name, quantity } of recipe.requiredItems) {
      if (typeof name !== "string" || typeof quantity !== "number") return false;
      if (elementsFound.has(name)) return false; 
      elementsFound.add(name);
    }
  }

  return !cookbook.some(existingEntry => existingEntry.name === entry.name);
}

// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req:Request, res:Response) => { // endpoint skeleton had "res: Request" written
  const recipeName = req.query.name as string;

  if (!recipeName) {
    res.status(400).send("Recipe name is required");
    return;
  }

  const summary = getRecipeSummary(recipeName);
  if (!summary) {
    res.status(400).send("Give a summary bruh");
    return;
  }

  res.status(200).send({});
});

const getRecipeSummary = (recipeName: string): RecipeSummary | null => {
  let entry = cookbook.find(entry => entry.name == recipeName);

  if (!entry || entry.type !== 'recipe') {
    return null;
  }
  
  const recipe = entry as recipe;
  const ingredients: { name: string; quantity: number; }[] = [];
  let totalCookTime = 0;

  for (const item of entry.requiredItems) {
    let currItem = cookbook.find(entry => entry.name == item );

    if (!currItem) { 
      return null; 
    } else {
      ingredients.push({
        name: item.name,
        quantity: item.quantity
      });

      if (entry.type === 'ingredient') {
        totalCookTime += entry.cookTime * item.quantity;
      }
    }
  }

  return {
    name: recipeName,
    ingredients,
    totalCookTime
  };
}

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
