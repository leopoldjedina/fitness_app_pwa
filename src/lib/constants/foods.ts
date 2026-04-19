export type Einheit = 'g' | 'ml' | 'Stück' | 'EL' | 'TL' | 'Scheibe'

export interface FoodItem {
  id: string
  name: string
  portion_menge: number       // standard portion quantity
  portion_einheit: Einheit    // standard portion unit
  kcal: number                // per standard portion
  protein_g: number           // per standard portion
  kategorie: 'Kühlregal' | 'Obst & Gemüse' | 'Trockenwaren' | 'Sonstiges'
  keywords: string[]
}

export const FOOD_REFERENCE: FoodItem[] = [
  { id: 'skyr', name: 'Skyr (natur)', portion_menge: 200, portion_einheit: 'g', kcal: 120, protein_g: 22, kategorie: 'Kühlregal', keywords: ['skyr'] },
  { id: 'magerquark', name: 'Magerquark', portion_menge: 200, portion_einheit: 'g', kcal: 136, protein_g: 24, kategorie: 'Kühlregal', keywords: ['magerquark', 'quark'] },
  { id: 'huettenkaese', name: 'Hüttenkäse', portion_menge: 100, portion_einheit: 'g', kcal: 98, protein_g: 11, kategorie: 'Kühlregal', keywords: ['hüttenkäse', 'cottage'] },
  { id: 'haferflocken', name: 'Haferflocken', portion_menge: 50, portion_einheit: 'g', kcal: 180, protein_g: 7, kategorie: 'Trockenwaren', keywords: ['haferflocken', 'oats'] },
  { id: 'ei', name: 'Ei (Größe M)', portion_menge: 1, portion_einheit: 'Stück', kcal: 85, protein_g: 7, kategorie: 'Kühlregal', keywords: ['ei', 'eier'] },
  { id: 'huehnchenbrust', name: 'Hühnchenbrust', portion_menge: 150, portion_einheit: 'g', kcal: 165, protein_g: 33, kategorie: 'Kühlregal', keywords: ['hühnchen', 'chicken'] },
  { id: 'thunfisch', name: 'Thunfisch (Dose)', portion_menge: 150, portion_einheit: 'g', kcal: 165, protein_g: 37, kategorie: 'Trockenwaren', keywords: ['thunfisch', 'tuna'] },
  { id: 'lachs', name: 'Lachs', portion_menge: 150, portion_einheit: 'g', kcal: 280, protein_g: 30, kategorie: 'Kühlregal', keywords: ['lachs', 'salmon'] },
  { id: 'vollkornbrot', name: 'Vollkornbrot', portion_menge: 1, portion_einheit: 'Scheibe', kcal: 80, protein_g: 3, kategorie: 'Trockenwaren', keywords: ['vollkornbrot', 'brot'] },
  { id: 'banane', name: 'Banane (klein)', portion_menge: 1, portion_einheit: 'Stück', kcal: 80, protein_g: 1, kategorie: 'Obst & Gemüse', keywords: ['banane'] },
  { id: 'beeren', name: 'Beeren (Heidel-/Himbeeren)', portion_menge: 100, portion_einheit: 'g', kcal: 45, protein_g: 1, kategorie: 'Obst & Gemüse', keywords: ['beeren', 'heidelbeeren', 'himbeeren'] },
  { id: 'feta', name: 'Leichter Feta', portion_menge: 50, portion_einheit: 'g', kcal: 90, protein_g: 7, kategorie: 'Kühlregal', keywords: ['feta'] },
  { id: 'walnuesse', name: 'Walnüsse', portion_menge: 10, portion_einheit: 'g', kcal: 65, protein_g: 2, kategorie: 'Trockenwaren', keywords: ['walnüsse'] },
  { id: 'olivenoel', name: 'Olivenöl', portion_menge: 1, portion_einheit: 'EL', kcal: 120, protein_g: 0, kategorie: 'Trockenwaren', keywords: ['olivenöl', 'öl'] },
  { id: 'suesskartoffel', name: 'Süßkartoffel', portion_menge: 200, portion_einheit: 'g', kcal: 172, protein_g: 3, kategorie: 'Obst & Gemüse', keywords: ['süßkartoffel'] },
  { id: 'reis', name: 'Reis (gekocht)', portion_menge: 150, portion_einheit: 'g', kcal: 195, protein_g: 4, kategorie: 'Trockenwaren', keywords: ['reis', 'rice'] },
  { id: 'honig', name: 'Honig', portion_menge: 1, portion_einheit: 'TL', kcal: 25, protein_g: 0, kategorie: 'Trockenwaren', keywords: ['honig'] },
  { id: 'tomate', name: 'Tomate', portion_menge: 1, portion_einheit: 'Stück', kcal: 20, protein_g: 1, kategorie: 'Obst & Gemüse', keywords: ['tomate', 'tomaten'] },
  { id: 'gurke', name: 'Gurke', portion_menge: 0.5, portion_einheit: 'Stück', kcal: 15, protein_g: 1, kategorie: 'Obst & Gemüse', keywords: ['gurke'] },
  { id: 'brokkoli', name: 'Brokkoli', portion_menge: 200, portion_einheit: 'g', kcal: 70, protein_g: 6, kategorie: 'Obst & Gemüse', keywords: ['brokkoli', 'broccoli'] },
  { id: 'milch', name: 'Milch (1.5%)', portion_menge: 200, portion_einheit: 'ml', kcal: 94, protein_g: 7, kategorie: 'Kühlregal', keywords: ['milch'] },
  { id: 'protein_shake', name: 'Proteinshake', portion_menge: 1, portion_einheit: 'Stück', kcal: 120, protein_g: 25, kategorie: 'Sonstiges', keywords: ['protein', 'shake'] },
  { id: 'zucchini', name: 'Zucchini', portion_menge: 200, portion_einheit: 'g', kcal: 36, protein_g: 2, kategorie: 'Obst & Gemüse', keywords: ['zucchini'] },
  { id: 'apfel', name: 'Apfel', portion_menge: 1, portion_einheit: 'Stück', kcal: 70, protein_g: 0, kategorie: 'Obst & Gemüse', keywords: ['apfel', 'äpfel'] },
]

export function calculateMacros(food: FoodItem, menge: number): { kcal: number; protein_g: number } {
  const factor = menge / food.portion_menge
  return {
    kcal: Math.round(food.kcal * factor),
    protein_g: Math.round(food.protein_g * factor * 10) / 10,
  }
}

export function findFoodById(id: string): FoodItem | undefined {
  return FOOD_REFERENCE.find(f => f.id === id)
}

export function searchFoods(query: string): FoodItem[] {
  const lower = query.toLowerCase()
  return FOOD_REFERENCE.filter(f =>
    f.name.toLowerCase().includes(lower) ||
    f.keywords.some(k => k.includes(lower))
  )
}
