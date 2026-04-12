import Dexie, { type Table } from 'dexie'
import type {
  UserProfile,
  DailyTracking,
  TrainingSession,
  ExerciseLog,
  WeekPlan,
  MealPlan,
  ShoppingList,
} from './types'

class FitnessDB extends Dexie {
  userProfile!: Table<UserProfile>
  dailyTracking!: Table<DailyTracking>
  trainingSessions!: Table<TrainingSession>
  exerciseLogs!: Table<ExerciseLog>
  weekPlans!: Table<WeekPlan>
  mealPlans!: Table<MealPlan>
  shoppingLists!: Table<ShoppingList>

  constructor() {
    super('leofit-db')
    this.version(1).stores({
      userProfile: 'id',
      dailyTracking: 'id, datum',
      trainingSessions: 'id, datum',
      exerciseLogs: 'id, sessionId, [sessionId+uebungsname]',
      weekPlans: 'id, [jahr+kw]',
      mealPlans: 'id, datum',
      shoppingLists: 'id',
    })
  }
}

export const db = new FitnessDB()
