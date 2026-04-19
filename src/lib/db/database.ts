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
import type { FoodItem } from '../constants/foods'

class FitnessDB extends Dexie {
  userProfile!: Table<UserProfile>
  dailyTracking!: Table<DailyTracking>
  trainingSessions!: Table<TrainingSession>
  exerciseLogs!: Table<ExerciseLog>
  weekPlans!: Table<WeekPlan>
  mealPlans!: Table<MealPlan>
  shoppingLists!: Table<ShoppingList>
  customFoods!: Table<FoodItem>

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
    // Version 2: add custom foods table
    this.version(2).stores({
      userProfile: 'id',
      dailyTracking: 'id, datum',
      trainingSessions: 'id, datum',
      exerciseLogs: 'id, sessionId, [sessionId+uebungsname]',
      weekPlans: 'id, [jahr+kw]',
      mealPlans: 'id, datum',
      shoppingLists: 'id',
      customFoods: 'id, name',
    })
  }
}

export const db = new FitnessDB()
