export interface FoodItem {
  name: string
  portion: string
  kcal: number
  protein_g: number
  kategorie: 'Kühlregal' | 'Obst & Gemüse' | 'Trockenwaren' | 'Sonstiges'
  keywords: string[] // for shopping list matching
}

export const FOOD_REFERENCE: FoodItem[] = [
  { name: 'Skyr (natur)', portion: '200g', kcal: 120, protein_g: 22, kategorie: 'Kühlregal', keywords: ['skyr'] },
  { name: 'Magerquark', portion: '200g', kcal: 136, protein_g: 24, kategorie: 'Kühlregal', keywords: ['magerquark', 'quark'] },
  { name: 'Hüttenkäse', portion: '100g', kcal: 98, protein_g: 11, kategorie: 'Kühlregal', keywords: ['hüttenkäse', 'hüttenkase', 'cottage'] },
  { name: 'Haferflocken', portion: '50g', kcal: 180, protein_g: 7, kategorie: 'Trockenwaren', keywords: ['haferflocken', 'oats'] },
  { name: 'Ei (Größe M)', portion: '1 Stück', kcal: 85, protein_g: 7, kategorie: 'Kühlregal', keywords: ['ei', 'eier'] },
  { name: 'Hühnchenbrust', portion: '150g', kcal: 165, protein_g: 33, kategorie: 'Kühlregal', keywords: ['hühnchen', 'huhn', 'hühnchenbrust', 'chicken'] },
  { name: 'Thunfisch (Dose, im Saft)', portion: '150g', kcal: 165, protein_g: 37, kategorie: 'Trockenwaren', keywords: ['thunfisch', 'tuna'] },
  { name: 'Lachs', portion: '150g', kcal: 280, protein_g: 30, kategorie: 'Kühlregal', keywords: ['lachs', 'salmon'] },
  { name: 'Vollkornbrot', portion: '1 Scheibe', kcal: 80, protein_g: 3, kategorie: 'Trockenwaren', keywords: ['vollkornbrot', 'brot'] },
  { name: 'Banane (klein)', portion: '1 Stück', kcal: 80, protein_g: 1, kategorie: 'Obst & Gemüse', keywords: ['banane'] },
  { name: 'Beeren (Heidel-/Himbeeren)', portion: '100g', kcal: 45, protein_g: 1, kategorie: 'Obst & Gemüse', keywords: ['beeren', 'heidelbeeren', 'himbeeren', 'blueberries'] },
  { name: 'Leichter Feta', portion: '50g', kcal: 90, protein_g: 7, kategorie: 'Kühlregal', keywords: ['feta'] },
  { name: 'Walnüsse', portion: '10g', kcal: 65, protein_g: 2, kategorie: 'Trockenwaren', keywords: ['walnüsse', 'walnuss'] },
  { name: 'Olivenöl', portion: '1 EL', kcal: 120, protein_g: 0, kategorie: 'Trockenwaren', keywords: ['olivenöl', 'öl'] },
  { name: 'Süßkartoffel', portion: '200g', kcal: 172, protein_g: 3, kategorie: 'Obst & Gemüse', keywords: ['süßkartoffel', 'sweet potato'] },
  { name: 'Reis (gekocht)', portion: '150g', kcal: 195, protein_g: 4, kategorie: 'Trockenwaren', keywords: ['reis', 'rice'] },
  { name: 'Honig', portion: '1 TL', kcal: 25, protein_g: 0, kategorie: 'Trockenwaren', keywords: ['honig'] },
  { name: 'Tomate', portion: '1 Stück', kcal: 20, protein_g: 1, kategorie: 'Obst & Gemüse', keywords: ['tomate', 'tomaten'] },
  { name: 'Gurke', portion: '0.5 Stück', kcal: 15, protein_g: 1, kategorie: 'Obst & Gemüse', keywords: ['gurke'] },
  { name: 'Brokkoli', portion: '200g', kcal: 70, protein_g: 6, kategorie: 'Obst & Gemüse', keywords: ['brokkoli', 'broccoli'] },
]

export function findFoodByKeyword(keyword: string): FoodItem | undefined {
  const lower = keyword.toLowerCase()
  return FOOD_REFERENCE.find(f => f.keywords.some(k => lower.includes(k)))
}
