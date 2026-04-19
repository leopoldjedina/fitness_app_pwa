'use client'

import { useState } from 'react'
import { useAllFoods, addCustomFood, deleteCustomFood } from '@/lib/hooks/useFoods'
import { db } from '@/lib/db/database'
import { FOOD_REFERENCE, type FoodItem, type Einheit } from '@/lib/constants/foods'
import { Search, Plus, Trash2, X, Pencil, Save, Upload } from 'lucide-react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const EINHEIT_OPTIONS: Einheit[] = ['g', 'ml', 'Stück', 'EL', 'TL', 'Scheibe']
const INPUT_STYLE = { background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }

function emptyFood(): Partial<FoodItem> {
  return { portion_einheit: 'g', portion_menge: 100, kcal: 0, protein_g: 0, kategorie: 'Sonstiges', keywords: [] }
}

export default function LebensmittelPage() {
  const allFoods = useAllFoods()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newFood, setNewFood] = useState<Partial<FoodItem>>(emptyFood())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<FoodItem>>({})
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')

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
      name: newFood.name,
      portion_menge: newFood.portion_menge ?? 100,
      portion_einheit: (newFood.portion_einheit ?? 'g') as Einheit,
      kcal: newFood.kcal ?? 0,
      protein_g: newFood.protein_g ?? 0,
      kategorie: (newFood.kategorie as FoodItem['kategorie']) ?? 'Sonstiges',
      keywords: newFood.name.toLowerCase().split(' '),
    }
    await addCustomFood(food)
    setShowAdd(false)
    setNewFood(emptyFood())
  }

  async function handleSaveEdit(food: FoodItem) {
    const updated: FoodItem = {
      ...food,
      name: (editForm.name ?? food.name),
      portion_menge: editForm.portion_menge ?? food.portion_menge,
      portion_einheit: (editForm.portion_einheit ?? food.portion_einheit) as Einheit,
      kcal: editForm.kcal ?? food.kcal,
      protein_g: editForm.protein_g ?? food.protein_g,
      kategorie: (editForm.kategorie ?? food.kategorie) as FoodItem['kategorie'],
      keywords: (editForm.name ?? food.name).toLowerCase().split(' '),
    }
    if (builtInIds.has(food.id)) {
      // Override built-in: save as custom with same ID
      await db.customFoods.put(updated)
    } else {
      await db.customFoods.put(updated)
    }
    setEditingId(null)
    setEditForm({})
  }

  async function handleImportJSON() {
    try {
      const items: FoodItem[] = JSON.parse(importText)
      if (!Array.isArray(items)) throw new Error('Not an array')
      for (const item of items) {
        if (!item.name || !item.id) continue
        await db.customFoods.put({
          id: item.id || `import_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          name: item.name,
          portion_menge: item.portion_menge ?? 100,
          portion_einheit: (item.portion_einheit ?? 'g') as Einheit,
          kcal: item.kcal ?? 0,
          protein_g: item.protein_g ?? 0,
          kategorie: (item.kategorie ?? 'Sonstiges') as FoodItem['kategorie'],
          keywords: item.keywords ?? item.name.toLowerCase().split(' '),
        })
      }
      setShowImport(false)
      setImportText('')
    } catch {
      alert('Ungültiges JSON-Format. Erwartet: Array von {id, name, portion_menge, portion_einheit, kcal, protein_g, kategorie}')
    }
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
          {allFoods.length}
        </span>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
        style={{ ...INPUT_STYLE }}>
        <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
        <input type="text" placeholder="Suchen…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--color-text-primary)' }} />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
          style={{ background: 'var(--color-accent)', color: '#fff' }}>
          <Plus size={16} /> Neu
        </button>
        <button onClick={() => setShowImport(!showImport)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 glass"
          style={{ color: 'var(--color-text-secondary)' }}>
          <Upload size={16} /> Import
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <FoodForm
          title="Neu anlegen"
          food={newFood}
          onChange={setNewFood}
          onSave={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}

      {/* Import JSON */}
      {showImport && (
        <div className="rounded-xl p-4 space-y-3 glass">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>JSON Import</span>
            <button onClick={() => setShowImport(false)} style={{ color: 'var(--color-text-muted)' }}><X size={16} /></button>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            JSON-Array einfügen: [{'{'}id, name, portion_menge, portion_einheit, kcal, protein_g, kategorie{'}'}]
          </p>
          <textarea value={importText} onChange={e => setImportText(e.target.value)}
            rows={5} placeholder='[{"id":"muesli","name":"Müsli","portion_menge":60,"portion_einheit":"g","kcal":220,"protein_g":6,"kategorie":"Trockenwaren"}]'
            className="w-full text-xs rounded-lg px-3 py-2 outline-none resize-none font-mono"
            style={{ ...INPUT_STYLE }} />
          <button onClick={handleImportJSON}
            className="w-full py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--color-accent)', color: '#fff' }}>
            Importieren
          </button>
        </div>
      )}

      {/* Food list */}
      <div className="space-y-1">
        {filtered.map(food => (
          editingId === food.id ? (
            <FoodForm
              key={food.id}
              title={food.name}
              food={{ ...food, ...editForm }}
              onChange={setEditForm}
              onSave={() => handleSaveEdit(food)}
              onClose={() => { setEditingId(null); setEditForm({}) }}
            />
          ) : (
            <div key={food.id} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ borderBottom: '1px solid var(--color-border)' }}>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {food.name}
                  {!builtInIds.has(food.id) && (
                    <span className="text-[9px] ml-1.5 px-1 py-0.5 rounded"
                      style={{ background: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}>custom</span>
                  )}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {food.portion_menge} {food.portion_einheit} · {food.kcal} kcal · {food.protein_g}g P
                </div>
              </div>
              <button onClick={() => { setEditingId(food.id); setEditForm({}) }} className="p-1.5"
                style={{ color: 'var(--color-text-muted)' }}>
                <Pencil size={14} />
              </button>
              {!builtInIds.has(food.id) && (
                <button onClick={() => deleteCustomFood(food.id)} className="p-1.5"
                  style={{ color: 'var(--color-danger)' }}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )
        ))}
      </div>
    </div>
  )
}

function FoodForm({
  title, food, onChange, onSave, onClose
}: {
  title: string
  food: Partial<FoodItem>
  onChange: (f: Partial<FoodItem>) => void
  onSave: () => void
  onClose: () => void
}) {
  return (
    <div className="rounded-xl p-4 space-y-3 glass">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</span>
        <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}><X size={16} /></button>
      </div>
      <input type="text" placeholder="Name" value={food.name ?? ''}
        onChange={e => onChange({ ...food, name: e.target.value })}
        className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={INPUT_STYLE} />
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Menge</label>
          <input type="number" value={food.portion_menge ?? ''} onChange={e => onChange({ ...food, portion_menge: parseFloat(e.target.value) || 0 })}
            className="w-full text-sm rounded-lg px-2 py-1.5 outline-none" style={INPUT_STYLE} />
        </div>
        <div>
          <label className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Einheit</label>
          <select value={food.portion_einheit ?? 'g'} onChange={e => onChange({ ...food, portion_einheit: e.target.value as Einheit })}
            className="w-full text-sm rounded-lg px-2 py-1.5 outline-none" style={INPUT_STYLE}>
            {EINHEIT_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Kategorie</label>
          <select value={food.kategorie ?? 'Sonstiges'} onChange={e => onChange({ ...food, kategorie: e.target.value as FoodItem['kategorie'] })}
            className="w-full text-sm rounded-lg px-2 py-1.5 outline-none" style={INPUT_STYLE}>
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
          <input type="number" value={food.kcal ?? ''} onChange={e => onChange({ ...food, kcal: parseInt(e.target.value) || 0 })}
            className="w-full text-sm rounded-lg px-2 py-1.5 outline-none" style={INPUT_STYLE} />
        </div>
        <div>
          <label className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Protein (g)</label>
          <input type="number" value={food.protein_g ?? ''} onChange={e => onChange({ ...food, protein_g: parseFloat(e.target.value) || 0 })}
            className="w-full text-sm rounded-lg px-2 py-1.5 outline-none" style={INPUT_STYLE} />
        </div>
      </div>
      <button onClick={onSave}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
        style={{ background: 'var(--color-accent)', color: '#fff' }}>
        <Save size={14} /> Speichern
      </button>
    </div>
  )
}
