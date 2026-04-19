'use client'

import { useState } from 'react'
// motion removed for Safari compatibility
import { FOOD_REFERENCE, calculateMacros } from '@/lib/constants/foods'
import { useAllFoods } from '@/lib/hooks/useFoods'
import type { Meal, MealFoodItem } from '@/lib/db/types'
import { X, Search, Plus, Trash2 } from 'lucide-react'

interface MealEditorProps {
  meal: Meal
  onSave: (meal: Meal) => void
  onClose: () => void
}

export default function MealEditor({ meal, onSave, onClose }: MealEditorProps) {
  const allFoods = useAllFoods()
  const [items, setItems] = useState<MealFoodItem[]>(meal.items ?? [])
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const searchResults = searchQuery.length > 0
    ? allFoods.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.keywords.some(k => k.includes(searchQuery.toLowerCase())))
    : allFoods.slice(0, 12)

  const totalKcal = items.reduce((s, i) => s + i.kcal, 0)
  const totalProtein = items.reduce((s, i) => s + i.protein_g, 0)

  function addFoodItem(foodId: string) {
    const food = allFoods.find(f => f.id === foodId)
    if (!food) return
    const newItem: MealFoodItem = {
      food_id: food.id,
      name: food.name,
      menge: food.portion_menge,
      einheit: food.portion_einheit,
      kcal: food.kcal,
      protein_g: food.protein_g,
    }
    setItems(prev => [...prev, newItem])
    setShowSearch(false)
    setSearchQuery('')
  }

  function updateItemMenge(index: number, menge: number) {
    setItems(prev => {
      const updated = [...prev]
      const food = allFoods.find(f => f.id === updated[index].food_id)
      if (food) {
        const macros = calculateMacros(food, menge)
        updated[index] = { ...updated[index], menge, kcal: macros.kcal, protein_g: macros.protein_g }
      }
      return updated
    })
  }

  function removeItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  function handleSave() {
    const lebensmittel = items.map(i => `${i.name} (${i.menge}${i.einheit})`).join(', ')
    onSave({
      ...meal,
      items,
      lebensmittel,
      kcal: totalKcal,
      protein_g: totalProtein,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div
        className="w-full max-h-[85dvh] overflow-y-auto rounded-t-2xl p-5 space-y-4"
        style={{ background: 'var(--color-surface)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {meal.name}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full" style={{ color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Totals */}
        <div className="flex gap-4 p-3 rounded-xl" style={{ background: 'var(--color-surface-elevated)' }}>
          <div className="text-center flex-1">
            <div className="text-lg font-bold" style={{ color: 'var(--color-accent)' }}>{totalKcal}</div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>kcal</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-lg font-bold" style={{ color: 'var(--color-success)' }}>{totalProtein.toFixed(1)}</div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>g Protein</div>
          </div>
        </div>

        {/* Food items list */}
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {item.name}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {item.kcal} kcal · {item.protein_g}g P
                </div>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={item.menge}
                  onChange={e => updateItemMenge(i, parseFloat(e.target.value) || 0)}
                  className="w-16 text-sm text-center rounded-lg px-2 py-1.5 outline-none"
                  style={{
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                  {item.einheit}
                </span>
              </div>
              <button onClick={() => removeItem(i)} className="p-1.5" style={{ color: 'var(--color-danger)' }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Add food */}
        {showSearch ? (
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <Search size={14} style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Lebensmittel suchen…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--color-text-primary)' }}
                autoFocus
              />
              <button onClick={() => { setShowSearch(false); setSearchQuery('') }}
                className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Abbrechen
              </button>
            </div>
            <div className="max-h-56 overflow-y-auto">
              {searchResults.map(food => (
                <button
                  key={food.id}
                  onClick={() => addFoodItem(food.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors active:opacity-70"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <div>
                    <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{food.name}</span>
                    <span className="text-xs ml-2" style={{ color: 'var(--color-text-muted)' }}>
                      {food.portion_menge} {food.portion_einheit}
                    </span>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                    {food.kcal} kcal · {food.protein_g}g P
                  </span>
                </button>
              ))}
              {searchResults.length === 0 && (
                <div className="px-3 py-4 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Nichts gefunden
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ border: '1px dashed var(--color-border-strong)', color: 'var(--color-text-secondary)' }}
          >
            <Plus size={14} />
            Lebensmittel hinzufügen
          </button>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
          style={{ background: 'var(--color-accent)', color: '#fff' }}
        >
          Speichern ({totalKcal} kcal · {totalProtein.toFixed(0)}g P)
        </button>
      </div>
    </div>
  )
}
