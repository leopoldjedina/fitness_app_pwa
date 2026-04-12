import type { TrainingsTyp, UserProfile } from '../db/types'

const TRAINING_TYPEN_MIT_SPORT: TrainingsTyp[] = ['Push', 'Pull', 'Beine', 'Zone 2', 'HIIT']

export function computeKcalSoll(trainingsTyp: TrainingsTyp | undefined, profile: UserProfile): number {
  if (trainingsTyp && TRAINING_TYPEN_MIT_SPORT.includes(trainingsTyp)) {
    return profile.kcal_trainingstag
  }
  return profile.kcal_ruhetag
}

export function computeProteinSoll(profile: UserProfile): number {
  return profile.protein_ziel_g
}

export function isKalorienfloor(kcalIst: number | undefined): boolean {
  return kcalIst !== undefined && kcalIst < 1800
}

export function computeKcalAbweichung(kcalSoll: number, kcalIst: number | undefined): number {
  if (kcalIst === undefined) return 0
  return kcalIst - kcalSoll
}

export function computeProteinAbweichung(proteinSoll: number, proteinIst: number | undefined): number {
  if (proteinIst === undefined) return 0
  return proteinIst - proteinSoll
}

export function isGrosseAbweichung(kcalAbweichung: number, proteinAbweichung: number): boolean {
  return Math.abs(kcalAbweichung) >= 200 || Math.abs(proteinAbweichung) >= 15
}
