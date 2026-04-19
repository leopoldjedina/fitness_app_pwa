'use client'

import { useState } from 'react'
import { useAllFoods, addCustomFood, deleteCustomFood } from '@/lib/hooks/useFoods'
import { FOOD_REFERENCE, type FoodItem, type Einheit } from '@/lib/constants/foods'
import { Search, Plus, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const EINHEIT_OPTIONS: Einheit[] = ['g', 'ml', 'Stück', 'EL', 'TL', 'Scheibe']

export default function LebensmittelPage() {
  const allFoods = useAllFoods()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newFood, setNewFood] = useState<Partial<FoodItem>>({
    portion_einheit: 'g',
    portion_menge: 100,
    kcal: 0,
    protein_g: 0,
    kategorie: 'Sonstiges',
    keywords: [],
  })

  const builtInIds = new Set(FOOD_REFERENCE.map(f => f.id))
  const filtered = search
    ? allFoods.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.keywords.some(k => k.includes(search.toLowerCase()))
      )
    : allFoods

  async function handleAdd() {
    if (!newFood.name) return
    const food: FoodItem = {
      id: `custom_${Date.now()}`,
      name: newFood.name ?? '',
      portion_menge: newFood.portion_menge ?? 100,
      portion_einheit: (newFood.portion_einheit ?? 'g') as Einheit,
      kcal: newFood.kcal ?? 0,
      protein_g: newFood.protein_g ?? 0,
      kategorie: (newFood.kategorie as FoodItem['kategorie']) ?? 'Sonstiges',
      keywords: newFood.name?.toLowerCase().split(' ') ?? [],
    }
    await addCustomFood(food)
    setShowAdd(false)
    setNewFood({ portion_einheit: 'g', portion_menge: 100, kcal: 0, protein_g: 0, kategorie: 'Sonstiges', keywords: [] })
  }

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/ernaehrung" className="p-1.5 rounded-lg" style={{ color: 'var(--color-text-secondary)' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Lebensmittel
        </h1>
        <span className="text-xs ml-auto" style={{ color: 'var(--color-text-muted)' }}>
          {allFoods.length} Einträge
        </span>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
        style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
        <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
        <input
          type="text"
          placeholder="Suchen…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--color-text-primary)' }}
        />
      </div>

      {/* Add new */}
      <button
        onClick={() => setShowAdd(!showAdd)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
        style={{ background: 'var(--color-accent)', color: '#fff' }}
      >
        <Plus size={16} /> Neues Lebensmittel
      </button>

      {/* Add form */}
      {showAdd && (
        <div className="rounded-xl p-4 space-y-3 glass">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Neu anlegen</span>
            <button onClick={() => setShowAdd(false)} style={{ color: 'var(--color-text-muted)' }}><X size={16} /></button>
          </div>
          <input
            type="text"
            placeholder="Name"
            value={newFood.name ?? ''}
            onChange={e => setNewFood(f => ({ ...f, name: e.target.value }))}
            className="w-full text-sm rounded-lg px-3 py-2 outline-none"
            style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Menge</label>
              <input type="number" value={newFood.portion_menge ?? ''} onChange={e => setNewFood(f => ({ ...f, portion_menge: parseFloat(e.target.value) || 0 }))}
                className="w-full text-sm rounded-lg px-2 py-1.5 outline-none"
                style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
            </div>
            <div>
              <label className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Einheit</label>
              <select value={newFood.portion_einheit} onChange={e => setNewFood(f => ({ ...f, portion_einheit: e.target.value as Einheit }))}
                className="w-full text-sm rounded-lg px-2 py-1.5 outline-none"
                style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
                {EINHEIT_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Kategorie</label>
              <select value={newFood.kategorie} onChange={e => setNewFood(f => ({ ...f, kategorie: e.target.value as FoodItem['kategorie'] }))}
                className="w-full text-sm rounded-lg px-2 py-1.5 outline-none"
                style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
                <option value="Kühlregal">Kühlregal</option>
                <option value="Obst & Gemüse">Obst & Gemüse</option>
                <option value="Trockenwaren">Trockenwaren</option>
                <option value="Sonstiges">Sonstiges</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>kcal (pro Portion)</label>
              <input type="number" value={newFood.kcal ?? ''} onChange={e => setNewFood(f => ({ ...f, kcal: parseInt(e.target.value) || 0 }))}
                className="w-full text-sm rounded-lg px-2 py-1.5 outline-none"
                style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
            </div>
            <div>
              <label className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Protein (g pro Portion)</label>
              <input type="number" value={newFood.protein_g ?? ''} onChange={e => setNewFood(f => ({ ...f, protein_g: parseFloat(e.target.value) || 0 }))}
                className="w-full text-sm rounded-lg px-2 py-1.5 outline-none"
                style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
            </div>
          </div>
          <button onClick={handleAdd}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ background: 'var(--color-accent)', color: '#fff' }}>
            Hinzufügen
          </button>
        </div>
      )}

      {/* Food list */}
      <div className="space-y-1">
        {filtered.map(food => (
          <div key={food.id} className="flex items-center gap-3 p-3 rounded-xl"
            style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                {food.name}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {food.portion_menge} {food.portion_einheit} · {food.kcal} kcal · {food.protein_g}g P
              </div>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-muted)' }}>
              {food.kategorie}
            </span>
            {!builtInIds.has(food.id) && (
              <button onClick={() => deleteCustomFood(food.id)} className="p-1" style={{ color: 'var(--color-danger)' }}>
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
