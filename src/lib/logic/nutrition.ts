import type { Meal, AdaptiveMeal } from '../db/types'

export interface DailyTotals {
  kcalConsumed: number
  proteinConsumed: number
  kcalRemaining: number
  proteinRemaining: number
  mealsRemaining: number
}

/**
 * Compute adaptive meal targets.
 * Eaten meals stay fixed. Uneaten meals get proportionally adjusted
 * so the day's total still hits the budget.
 */
export function computeAdaptiveMeals(
  meals: Meal[],
  kcalBudget: number,
  proteinBudget: number
): AdaptiveMeal[] {
  // Step 1: Actual kcal/protein for each eaten meal
  const consumed = meals
    .filter(m => m.gegessen || m.kcal_abweichung !== undefined)
    .reduce(
      (acc, m) => ({
        kcal: acc.kcal + (m.kcal_abweichung ?? m.kcal),
        protein: acc.protein + (m.protein_g_abweichung ?? m.protein_g),
      }),
      { kcal: 0, protein: 0 }
    )

  const kcalRemaining = Math.max(0, kcalBudget - consumed.kcal)
  const proteinRemaining = Math.max(0, proteinBudget - consumed.protein)

  // Step 2: Uneaten meals (not eaten, no deviation set)
  const uneaten = meals.filter(m => !m.gegessen && m.kcal_abweichung === undefined)
  const uneatenKcalTotal = uneaten.reduce((s, m) => s + m.kcal, 0)
  const uneatenProteinTotal = uneaten.reduce((s, m) => s + m.protein_g, 0)

  return meals.map((meal): AdaptiveMeal => {
    const isEaten = meal.gegessen || meal.kcal_abweichung !== undefined

    if (isEaten) {
      return {
        ...meal,
        kcal_adjusted: meal.kcal_abweichung ?? meal.kcal,
        protein_g_adjusted: meal.protein_g_abweichung ?? meal.protein_g,
        isAdjusted: meal.kcal_abweichung !== undefined,
      }
    }

    // Scale uneaten meal proportionally
    let kcalAdjusted: number
    let proteinAdjusted: number

    if (uneatenKcalTotal > 0) {
      const kcalScale = kcalRemaining / uneatenKcalTotal
      kcalAdjusted = Math.max(0, Math.round(meal.kcal * kcalScale))
    } else {
      kcalAdjusted = uneaten.length > 0 ? Math.round(kcalRemaining / uneaten.length) : 0
    }

    if (uneatenProteinTotal > 0) {
      const proteinScale = proteinRemaining / uneatenProteinTotal
      proteinAdjusted = Math.max(0, Math.round(meal.protein_g * proteinScale))
    } else {
      proteinAdjusted = uneaten.length > 0 ? Math.round(proteinRemaining / uneaten.length) : 0
    }

    const isAdjusted = Math.abs(kcalAdjusted - meal.kcal) > 5

    return {
      ...meal,
      kcal_adjusted: kcalAdjusted,
      protein_g_adjusted: proteinAdjusted,
      isAdjusted,
    }
  })
}

export function computeDailyTotals(
  meals: Meal[],
  kcalBudget: number,
  proteinBudget: number
): DailyTotals {
  const consumed = meals
    .filter(m => m.gegessen || m.kcal_abweichung !== undefined)
    .reduce(
      (acc, m) => ({
        kcal: acc.kcal + (m.kcal_abweichung ?? m.kcal),
        protein: acc.protein + (m.protein_g_abweichung ?? m.protein_g),
      }),
      { kcal: 0, protein: 0 }
    )

  return {
    kcalConsumed: consumed.kcal,
    proteinConsumed: consumed.protein,
    kcalRemaining: Math.max(0, kcalBudget - consumed.kcal),
    proteinRemaining: Math.max(0, proteinBudget - consumed.protein),
    mealsRemaining: meals.filter(m => !m.gegessen && m.kcal_abweichung === undefined).length,
  }
}
