import type { UebungsName, ExerciseLog, TrainingsTyp } from '../db/types'

// ─── Machine increments (fixed steps) ────────────────────────────────────────

export const MACHINE_INCREMENTS: Partial<Record<UebungsName, number[]>> = {
  'Brustpresse Maschine': [35, 38.3, 40.5, 42.8, 45, 47.3],
  'Rudermaschine sitzend': [35, 40, 45, 50, 55, 60],
  'Latzug Maschine': [35, 40, 45, 50, 55, 60, 65, 70],
  'Beinpresse': [60, 70, 80, 90, 100, 110, 120, 130, 140],
  'Beinbeuger Maschine': [20, 25, 30, 35, 40, 45, 50],
  'Beinstrecker Maschine': [20, 25, 30, 35, 40, 45, 50],
  'Wadenmaschine': [30, 40, 50, 60, 70, 80],
  'Cable Crunch': [20, 25, 30, 35, 40, 45],
  'Trizeps Pushdown Kabel': [15, 20, 25, 30, 35, 40],
  'Face Pulls Kabel': [15, 20, 25, 30, 35],
}

// ─── Exercise type classification ─────────────────────────────────────────────

export const COMPOUND_EXERCISES: UebungsName[] = [
  'Brustpresse Maschine',
  'Schulterdrücken KH',
  'Latzug Maschine',
  'Rudermaschine sitzend',
  'Beinpresse',
]

// ─── Workout templates ────────────────────────────────────────────────────────

type ExerciseTemplate = Omit<ExerciseLog, 'id' | 'sessionId' | 'standort' | 'reps_ist' | 'erledigt' | 'notizen'>

export const PUSH_TEMPLATE: ExerciseTemplate[] = [
  { uebungsname: 'Brustpresse Maschine', reihenfolge: 1, gewicht_kg: '40.5', sets: 3, reps_ziel: '3×8–10' },
  { uebungsname: 'Butterfly Maschine', reihenfolge: 2, gewicht_kg: '30', sets: 3, reps_ziel: '3×10–12' },
  { uebungsname: 'Schulterdrücken KH', reihenfolge: 3, gewicht_kg: '16', sets: 3, reps_ziel: '3×8–10' },
  { uebungsname: 'Seitheben KH', reihenfolge: 4, gewicht_kg: '10', sets: 3, reps_ziel: '3×12–15' },
  { uebungsname: 'Trizeps Pushdown Kabel', reihenfolge: 5, gewicht_kg: '25', sets: 3, reps_ziel: '3×10–12' },
  { uebungsname: 'Cable Crunch', reihenfolge: 6, gewicht_kg: '30', sets: 3, reps_ziel: '3×12–15' },
  { uebungsname: 'Plank', reihenfolge: 7, gewicht_kg: '–', sets: 3, reps_ziel: '3×30–60s' },
]

export const PULL_TEMPLATE: ExerciseTemplate[] = [
  { uebungsname: 'Latzug Maschine', reihenfolge: 1, gewicht_kg: '55', sets: 3, reps_ziel: '3×8–10' },
  { uebungsname: 'Rudermaschine sitzend', reihenfolge: 2, gewicht_kg: '45', sets: 3, reps_ziel: '3×8–10' },
  { uebungsname: 'Face Pulls Kabel', reihenfolge: 3, gewicht_kg: '25', sets: 3, reps_ziel: '3×12–15' },
  { uebungsname: 'Bizeps Curls KH', reihenfolge: 4, gewicht_kg: '14', sets: 3, reps_ziel: '3×10–12' },
  { uebungsname: 'Reverse Fly Maschine', reihenfolge: 5, gewicht_kg: '15', sets: 3, reps_ziel: '3×12–15' },
  { uebungsname: 'Russian Twist', reihenfolge: 6, gewicht_kg: '–', sets: 3, reps_ziel: '3×15 pro Seite' },
  { uebungsname: 'Dead Bug', reihenfolge: 7, gewicht_kg: '–', sets: 3, reps_ziel: '3×10 pro Seite' },
]

export const BEINE_TEMPLATE: ExerciseTemplate[] = [
  { uebungsname: 'Beinpresse', reihenfolge: 1, gewicht_kg: '100', sets: 3, reps_ziel: '3×8–10' },
  { uebungsname: 'Beinbeuger Maschine', reihenfolge: 2, gewicht_kg: '35', sets: 3, reps_ziel: '3×10–12' },
  { uebungsname: 'Beinstrecker Maschine', reihenfolge: 3, gewicht_kg: '35', sets: 3, reps_ziel: '3×10–12' },
  { uebungsname: 'Wadenmaschine', reihenfolge: 4, gewicht_kg: '50', sets: 3, reps_ziel: '3×12–15' },
  { uebungsname: 'Reverse Crunch', reihenfolge: 5, gewicht_kg: '–', sets: 3, reps_ziel: '3×12–15' },
  { uebungsname: 'Dead Bug', reihenfolge: 6, gewicht_kg: '–', sets: 3, reps_ziel: '3×10 pro Seite' },
]

export const TEMPLATES: Partial<Record<TrainingsTyp, ExerciseTemplate[]>> = {
  Push: PUSH_TEMPLATE,
  Pull: PULL_TEMPLATE,
  Beine: BEINE_TEMPLATE,
}

export const CARDIO_TYPEN: UebungsName[] = [
  'Crosstrainer',
  'Ergometer',
  'Rudergerät',
  'Stepper',
  'Joggen',
  'Fahrrad',
]

export const TRAININGS_TYPEN: TrainingsTyp[] = [
  'Push', 'Pull', 'Beine', 'Zone 2', 'HIIT', 'Active Recovery', 'Ruhetag'
]
