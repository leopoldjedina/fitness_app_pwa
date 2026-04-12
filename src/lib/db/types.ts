// ─── Enums ────────────────────────────────────────────────────────────────────

export type Standort = 'Berlin' | 'Salzburg'

export type TrainingsTyp =
  | 'Push'
  | 'Pull'
  | 'Beine'
  | 'Zone 2'
  | 'HIIT'
  | 'Active Recovery'
  | 'Ruhetag'

export type Wochentag = 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr' | 'Sa' | 'So'

export type Energielevel = 1 | 2 | 3 | 4 | 5

export type UebungsName =
  // Push
  | 'Brustpresse Maschine'
  | 'Butterfly Maschine'
  | 'Schulterdrücken KH'
  | 'Seitheben KH'
  | 'Trizeps Pushdown Kabel'
  // Pull
  | 'Latzug Maschine'
  | 'Rudermaschine sitzend'
  | 'Face Pulls Kabel'
  | 'Bizeps Curls KH'
  | 'Reverse Fly Maschine'
  // Beine
  | 'Beinpresse'
  | 'Beinbeuger Maschine'
  | 'Beinstrecker Maschine'
  | 'Wadenmaschine'
  | 'Wadenheber stehend KH'
  // Core
  | 'Cable Crunch'
  | 'Plank'
  | 'Russian Twist'
  | 'Dead Bug'
  | 'Reverse Crunch'
  | 'Mountain Climbers'
  // Cardio
  | 'Crosstrainer'
  | 'Ergometer'
  | 'Rudergerät'
  | 'Stepper'
  | 'Joggen'
  | 'Fahrrad'

// ─── Data Models ──────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string // always 'singleton'
  name: string
  alter: number
  groesse_cm: number
  startgewicht_kg: number
  start_bauchumfang_cm: number
  ziel_bauchumfang_cm: number
  ziel_kfa_prozent: number
  kcal_trainingstag: number
  kcal_ruhetag: number
  protein_ziel_g: number
  vo2max_start: number
  vo2max_ziel: number
  hf_max_bpm: number
  standort: Standort
  createdAt: string // ISO
  updatedAt: string // ISO
}

export interface DailyTracking {
  id: string
  datum: string // YYYY-MM-DD (unique per day)
  gewicht_kg?: number
  bauchumfang_cm?: number
  schlaf_h?: number
  schlafindex?: number
  ruhepuls_bpm?: number
  vo2max?: number
  energielevel?: Energielevel
  training_typ?: TrainingsTyp
  kcal_soll: number
  kcal_ist?: number
  protein_soll_g: number
  protein_ist_g?: number
  durchschnitts_hf_zone2_bpm?: number
  notizen?: string
}

export interface TrainingSession {
  id: string
  datum: string // YYYY-MM-DD
  trainingstyp: TrainingsTyp
  dauer_min?: number
  durchschnitts_hf_bpm?: number
  feedback?: string
  abgeschlossen: boolean
}

export interface ExerciseLog {
  id: string
  sessionId: string
  standort?: Standort
  uebungsname: UebungsName
  reihenfolge: number
  gewicht_kg: string // string! "40.5" or "Stufe 8"
  sets: number
  reps_ziel: string // "3×10" or "3×12–15"
  reps_ist?: string // "10/10/8"
  erledigt: boolean
  notizen?: string
}

export interface WeekDay {
  wochentag: Wochentag
  training_typ: TrainingsTyp
  notizen?: string
}

export interface WeekPlan {
  id: string
  kw: number
  jahr: number
  start_datum: string // YYYY-MM-DD (Monday)
  tage: WeekDay[] // 7 entries Mo–So
}

export interface Meal {
  name: string // "Frühstück", "Mittagessen", etc.
  lebensmittel: string // description with amounts
  kcal: number
  protein_g: number
  gegessen: boolean
}

export interface MealPlan {
  id: string
  datum: string // YYYY-MM-DD
  typ: 'Trainingstag' | 'Ruhetag'
  kcal_gesamt: number
  protein_gesamt_g: number
  mahlzeiten: Meal[]
}

export interface ShoppingItem {
  name: string
  menge?: string
  erledigt: boolean
  hinweis?: string
}

export interface ShoppingCategory {
  name: string
  items: ShoppingItem[]
}

export interface ShoppingList {
  id: string
  zeitraum: string // "Sa 11.04. – Mo 13.04."
  kategorien: ShoppingCategory[]
  createdAt: string
}
