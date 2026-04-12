# Fitness App – Vollständige Spezifikation für Google Antigravity

> **Zweck dieses Dokuments:** Dieses Spec-Dokument enthält alles, was du brauchst, um in Google Antigravity eine persönliche Fitness-App zu bauen. Es beschreibt das Datenmodell, alle Screens, die Business-Logik und die empfohlene Vorgehensweise. Du kannst dieses Dokument direkt als Prompt oder Briefing in Antigravity verwenden.

---

## 1. App-Übersicht

**Name:** LeoFit (oder frei wählbar)
**Plattform:** Mobile App (iOS + Android) – ideal als Flutter, React Native oder PWA
**Nutzer:** Single-User (kein Login nötig, alle Daten lokal oder in einfachem Backend)
**Sprache der UI:** Deutsch

### Was die App können soll

Die App ersetzt das bisherige Notion-basierte Fitness-Tracking-System und vereint fünf Kernbereiche:

1. **Tägliches Tracking** – Biomarker, Ernährung (SOLL/IST), Training
2. **Trainingsplanung & -log** – Wochenpläne mit Push/Pull/Beine/Cardio, Übungen mit Progressive Overload
3. **Essenspläne** – Tägliche Mahlzeitenpläne mit kcal/Protein pro Mahlzeit
4. **Einkaufslisten** – Automatisch aus Essensplänen generiert
5. **Fortschritts-Dashboard** – Trends für Gewicht, Bauchumfang, Kraft, VO2max

---

## 2. Datenmodell

### 2.1 UserProfile (Singleton – ein Eintrag)

| Feld | Typ | Beispielwert |
|------|-----|-------------|
| name | String | "Leopold" |
| alter | Int | 45 |
| groesse_cm | Int | 180 |
| startgewicht_kg | Float | 71.1 |
| start_bauchumfang_cm | Float | 84.0 |
| ziel_bauchumfang_cm | Float | 78.0 (dann 74–76) |
| ziel_kfa_prozent | Float | 10–12 |
| kcal_trainingstag | Int | 2200 |
| kcal_ruhetag | Int | 2000 |
| protein_ziel_g | Int | 135 |
| vo2max_start | Float | 41.1 |
| vo2max_ziel | Float | 44–47 |
| hf_max_bpm | Int | 188 |

### 2.2 DailyTracking (1 Eintrag pro Tag)

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | UUID | Auto-generiert |
| datum | Date | Eindeutig pro Tag |
| gewicht_kg | Float? | Morgens gemessen |
| bauchumfang_cm | Float? | Morgens gemessen |
| schlaf_h | Float? | Schlafstunden |
| schlafindex | Int? | 0–100 (von Apple Watch) |
| ruhepuls_bpm | Int? | Morgens |
| vo2max | Float? | Von Apple Watch |
| energielevel | Enum(1–5) | 1=Sehr schlecht ... 5=Sehr gut |
| training_typ | Enum? | Push, Pull, Beine, Zone 2, HIIT, Active Recovery, Ruhetag |
| kcal_soll | Int | Automatisch basierend auf training_typ |
| kcal_ist | Int? | Am Abend eingetragen |
| protein_soll_g | Int | Automatisch (135g) |
| protein_ist_g | Int? | Am Abend eingetragen |
| durchschnitts_hf_zone2_bpm | Int? | Nur bei Zone 2 / HIIT |
| notizen | String? | Freitext |

**Automatik-Logik:**
- `kcal_soll` = 2200 wenn training_typ ∈ {Push, Pull, Beine, Zone 2, HIIT}, sonst 2000
- `protein_soll_g` = 135 (immer)

### 2.3 TrainingSession (1 Eintrag pro Trainingseinheit)

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | UUID | Auto-generiert |
| datum | Date | FK → DailyTracking.datum |
| trainingstyp | Enum | Push, Pull, Beine, Zone 2, HIIT |
| dauer_min | Int? | Gesamtdauer |
| durchschnitts_hf_bpm | Int? | Herzfrequenz gesamt |
| feedback | String? | Freitext nach dem Training |

### 2.4 ExerciseLog (N Einträge pro TrainingSession)

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | UUID | Auto-generiert |
| session_id | UUID | FK → TrainingSession.id |
| standort | Enum? | Berlin, Salzburg (für standortspezifische Gewichtsvergleiche) |
| uebungsname | Enum | Siehe Übungsliste unten |
| reihenfolge | Int | Sortierung innerhalb der Session |
| gewicht_kg | String | z.B. "40.5" oder "Stufe 8" (Text, da Maschinen) |
| sets | Int | Anzahl Sätze (Standard: 3) |
| reps_ziel | String | z.B. "3×10" oder "3×12–15" |
| reps_ist | String? | z.B. "10/10/8" |
| erledigt | Bool | Default: false |
| notizen | String? | Form-Hinweise, Feedback |

**Übungsliste (Enum-Werte für uebungsname):**

*Push:*
- Brustpresse Maschine
- Butterfly Maschine
- Schulterdrücken KH
- Seitheben KH
- Trizeps Pushdown Kabel

*Pull:*
- Latzug Maschine
- Rudermaschine sitzend
- Face Pulls Kabel
- Bizeps Curls KH
- Reverse Fly Maschine

*Beine:*
- Beinpresse
- Beinbeuger Maschine
- Beinstrecker Maschine
- Wadenmaschine
- Wadenheber stehend KH

*Core (in jeder Kraft-Session):*
- Cable Crunch
- Plank
- Russian Twist
- Dead Bug
- Reverse Crunch
- Mountain Climbers

*Cardio-Geräte:*
- Crosstrainer
- Ergometer
- Rudergerät
- Stepper
- Joggen
- Fahrrad

### 2.5 WeekPlan (1 pro Woche)

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | UUID | Auto-generiert |
| kw | Int | Kalenderwoche |
| jahr | Int | z.B. 2026 |
| start_datum | Date | Montag der Woche |
| tage | Array<WeekDay> | 7 Einträge (Mo–So) |

**WeekDay (eingebettet in WeekPlan):**

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| wochentag | Enum | Mo, Di, Mi, Do, Fr, Sa, So |
| training_typ | Enum | Push, Pull, Beine, Zone 2, HIIT, Ruhetag |
| notizen | String? | z.B. "Salzburg – kein Gym" |

**Standard-Wochenstruktur (Default-Template):**

| Tag | Training |
|-----|----------|
| Mo | Zone 2 |
| Di | Pull |
| Mi | Zone 2 |
| Do | Push |
| Fr | Zone 2 |
| Sa | Beine |
| So | Ruhetag |

### 2.6 MealPlan (1 pro Tag)

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | UUID | Auto-generiert |
| datum | Date | FK → DailyTracking.datum |
| typ | Enum | Trainingstag, Ruhetag |
| kcal_gesamt | Int | Summe aller Mahlzeiten |
| protein_gesamt_g | Int | Summe aller Mahlzeiten |
| mahlzeiten | Array<Meal> | Geordnete Liste |

**Meal (eingebettet in MealPlan):**

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| name | String | z.B. "Frühstück", "Pre-Workout", "Abendessen" |
| lebensmittel | String | Beschreibung mit Mengen |
| kcal | Int | Kalorien dieser Mahlzeit |
| protein_g | Int | Protein dieser Mahlzeit |
| gegessen | Bool | Checkbox (Default: false) |

**Standard-Mahlzeiten-Slots (Trainingstag):**
1. Pre-Workout (z.B. 1 Banane – ~80–100 kcal)
2. Frühstück (~400–450 kcal, ~25g Protein)
3. Mittagessen (~500–700 kcal, ~40g Protein)
4. Nachmittags-Snack (~200 kcal, ~24g Protein)
5. Abendessen (~400–500 kcal, ~30g Protein)
6. Abend-Snack (~150–200 kcal, ~20g Protein)

### 2.7 ShoppingList (1 pro Einkaufsperiode)

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | UUID | Auto-generiert |
| zeitraum | String | z.B. "Sa 11.04. – Mo 13.04." |
| kategorien | Array<ShoppingCategory> | Gruppierte Items |

**ShoppingCategory:**

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| name | String | z.B. "Kühlregal", "Obst & Gemüse", "Trockenwaren" |
| items | Array<ShoppingItem> | |

**ShoppingItem:**

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| name | String | z.B. "Skyr, 500g" |
| menge | String? | z.B. "2 Stück" |
| erledigt | Bool | Checkbox |
| hinweis | String? | z.B. "reicht für Sa + So" |

**Standard-Kategorien:**
- Kühlregal (Skyr, Magerquark, Hüttenkäse, Eier, Milch, Feta, Lachs, Hühnchen)
- Obst & Gemüse (Beeren, Bananen, Tomaten, Gurke, Äpfel)
- Trockenwaren / Konserven (Thunfisch, Haferflocken, Vollkornbrot, Walnüsse, Reis)
- Vermutlich vorhanden (Olivenöl, Honig, Gewürze – nur zur Erinnerung, kein Kauf)

---

## 3. Screen-Übersicht & Navigation

### Bottom Navigation (5 Tabs)

```
[ Dashboard ]  [ Training ]  [ Ernährung ]  [ Einkauf ]  [ Profil ]
```

### 3.1 Dashboard (Home)

**Zweck:** Tagesübersicht + Trends auf einen Blick

**Inhalte:**
- **Heutige Karte:** Datum, geplantes Training, kcal SOLL/IST, Protein SOLL/IST
- **Biomarker-Eingabe (Morgen):** Quick-Input für Gewicht, Bauchumfang, Schlaf, Ruhepuls, Energielevel
- **Trend-Charts (scrollbar):**
  - Gewicht (letzte 4 Wochen, Linie)
  - Bauchumfang (letzte 4 Wochen, Linie)
  - Kalorien SOLL vs. IST (letzte 7 Tage, Balken)
  - Protein SOLL vs. IST (letzte 7 Tage, Balken)
- **Quick Actions:**
  - "Training starten" → navigiert zu heutigem Workout
  - "Mahlzeit abhaken" → navigiert zum heutigen Essensplan
- **Wöchentlicher Fortschritt:** Kompakte Anzeige der Wochendurchschnitte (kcal, Protein, Gewicht)

### 3.2 Training Tab

**3.2.1 Wochenübersicht**
- Zeigt aktuelle KW mit allen 7 Tagen
- Jeder Tag: Trainingstyp + Status (geplant / erledigt / übersprungen)
- Tap auf Tag → Trainingsdetail

**3.2.2 Trainingsdetail (Kraft: Push / Pull / Beine)**
- Übungsliste in Trainingsreihenfolge
- Pro Übung:
  - Name
  - Gewicht (editierbar)
  - Reps Ziel (z.B. "3×10")
  - Reps Ist (editierbare Felder pro Set, z.B. [ 10 ] [ 10 ] [ 8 ])
  - Checkbox "Erledigt"
  - Letzte Session als Referenz anzeigen (Gewicht + Reps vom letzten Mal)
- Core-Übungen am Ende (2 Stück pro Session)
- Feedback-Feld nach Abschluss
- Button "Training abschließen" → markiert alle als erledigt, speichert Feedback, aktualisiert DailyTracking

**3.2.3 Trainingsdetail (Cardio: Zone 2 / HIIT)**
- Gerätewahl (Crosstrainer, Ergometer, Stepper, Joggen, etc.)
- Timer (optional)
- Herzfrequenz-Zielzone anzeigen:
  - Zone 2: 120–130 bpm (grüner Bereich)
  - HIIT: Intervalle anzeigen (z.B. 60s Sprint / 120s Pause, 6–8 Runden)
- Dauer eingeben
- Durchschnitts-HF eingeben
- Button "Cardio abschließen"

**3.2.4 Progressive Overload Tracker**
- Pro Übung: Gewichtsverlauf als Mini-Chart
- Empfehlung: "3×10 sauber geschafft → nächstes Mal Gewicht erhöhen"
- Hinweis wenn Maschine nur bestimmte Inkremente erlaubt (z.B. Brustpresse: 38.3 oder 40.5)

### 3.3 Ernährung Tab

**3.3.1 Tagesansicht (Essensplan)**
- Datum + Typ (Trainingstag / Ruhetag)
- Tagesziel: kcal + Protein (automatisch aus Profil)
- Mahlzeiten-Liste:
  - Pro Mahlzeit: Name, Lebensmittel-Beschreibung, kcal, Protein
  - Checkbox "Gegessen" → beim Abhaken wird Mahlzeit zur IST-Summe addiert
- Laufende Summe: "Bisher: 1.322 kcal / 71g Protein"
- Verbleibend: "Noch geplant: 745 kcal / 76g Protein"
- Tagessumme vs. Ziel mit Differenz-Anzeige

**3.3.2 Abweichungs-Modus**
- Button "Abweichung melden"
- Eingabe: "Was wurde anders gegessen?" (Freitext)
- Automatische Neuberechnung der kcal/Protein-Differenz
- Empfehlung für verbleibende Mahlzeiten bei großer Abweichung (>200 kcal oder >15g Protein)

**3.3.3 Wochenübersicht Ernährung**
- 7-Tage-Tabelle: SOLL vs. IST (kcal + Protein)
- Wochendurchschnitte
- Farbkodierung: Grün (±100 kcal), Gelb (±200), Rot (>200 Abweichung)

### 3.4 Einkauf Tab

**3.4.1 Aktuelle Einkaufsliste**
- Zeitraum (z.B. "Sa 11.04. – Mo 13.04.")
- Kategorien als Sektionen (Kühlregal, Obst & Gemüse, etc.)
- Items mit Checkbox zum Abhaken
- "Vermutlich vorhanden"-Sektion ausgegraut (nur zur Info)
- Geschätzte Kosten unten

**3.4.2 Liste generieren**
- Button "Aus Essensplänen generieren"
- Wähle Zeitraum (z.B. nächste 3 Tage)
- App aggregiert alle Zutaten aus den Essensplänen
- Gruppiert nach Kategorie
- Zusammenfassung gleicher Zutaten (z.B. 3× Skyr 200g → Skyr 600g)
- Manuelle Bearbeitung möglich

### 3.5 Profil Tab

- Persönliche Daten (editierbar)
- Zielwerte (kcal, Protein, Bauchumfang-Ziel)
- Fortschritts-Meilensteine:
  - ☐ Bauchumfang < 80 cm
  - ☐ Bauchumfang < 78 cm
  - ☐ Bauchumfang < 76 cm
  - ☐ Bauchumfang < 74 cm
- Trainings-Statistiken: Gesamte Sessions, Streak, häufigster Split
- Export-Funktion (CSV/JSON) für Backup

---

## 4. Business-Logik & Regeln

### 4.1 Tracking-Logik

```
SOLL/IST-Prinzip:
- Essenspläne = SOLL (werden nie verändert)
- Tägliches Tracking = IST (tatsächliche Werte am Tagesende)
- Der Vergleich SOLL vs. IST ermöglicht saubere Wochenanalysen
```

### 4.2 Abweichungsmanagement

```
WENN Abweichung < 200 kcal UND < 15g Protein:
  → Nur zur Kenntnis nehmen, am Tagesende ins Tracking
WENN Abweichung ≥ 200 kcal ODER ≥ 15g Protein:
  → Angepasste Empfehlung für verbleibende Mahlzeiten generieren
  → Essensplan bleibt UNVERÄNDERT
```

### 4.3 Progressive Overload Logik

```
WENN alle Sätze das Reps-Ziel sauber erreicht haben (z.B. 3×10):
  → Nächste Session: Gewicht erhöhen
  → Compound-Übungen: +2.5 kg (oder nächstes Maschinen-Inkrement)
  → Isolation: +1–2 kg
WENN dritter Satz leicht abfällt (z.B. 10/10/8):
  → Normal, Gewicht beibehalten
WENN deutlicher Abfall (z.B. 10/7/5):
  → Gewicht war zu hoch, nächstes Mal reduzieren
```

### 4.4 Kalorien-Automatik

```
training_typ ∈ {Push, Pull, Beine, Zone 2, HIIT}  → kcal_soll = 2200
training_typ ∈ {Ruhetag, Active Recovery}           → kcal_soll = 2000
protein_soll = 135 (immer)
```

### 4.5 Kalorienfloor-Regel

```
Minimum: Nie unter 1.700–1.800 kcal fallen
→ Warnung anzeigen wenn kcal_ist < 1.800 bei Tagesabschluss
→ "Achtung: Zu wenig gegessen. Das geplante Defizit ist bereits im Plan eingebaut."
```

### 4.6 Abend-Snack-Erinnerung

```
WENN 20:00 Uhr UND Abend-Snack nicht abgehakt:
  → Push-Notification: "Abend-Snack nicht vergessen – das Defizit ist bereits eingebaut!"
```

### 4.7 Zone 2 HR-Warnung

```
WENN durchschnitts_hf > 130 bpm bei Zone 2 Session:
  → Hinweis: "Durchschnitts-HF über 130. Zone 2 = 120–130 bpm. Nächstes Mal Widerstand reduzieren."
```

### 4.8 Koffein-Warnung vor Zone 2

```
WENN Training = Zone 2 UND Uhrzeit < 10:00:
  → Hinweis beim Trainingsstart: "Koffein vor Zone 2 erschwert die HR-Kontrolle.
     Falls Kaffee getrunken: Widerstand von Anfang an niedriger wählen."
```

### 4.9 Maschinen-spezifische Gewichte

```
Übungen können an VERSCHIEDENEN Maschinen/Standorten ausgeführt werden.
→ Gewichte sind NICHT direkt vergleichbar zwischen verschiedenen Maschinen.
→ ExerciseLog sollte ein optionales Feld "standort" (Berlin/Salzburg) haben.
→ Progressive Overload Vergleich NUR innerhalb desselben Standorts.
→ Manche Maschinen haben fixe Inkremente:
   - Brustpresse: 38.3 kg oder 40.5 kg (kein Zwischenwert)
   - Rudermaschine: 40 kg oder 45 kg (kein 42.5 kg)
   → Bei fixen Inkrementen: Hinweis "Nächstes Inkrement ist +X kg – größerer Sprung"
```

---

## 5. Standard-Übungspläne (Templates)

### Push-Day Template

| # | Übung | Sets × Reps | Typ |
|---|-------|-------------|-----|
| 1 | Brustpresse Maschine | 3×8–10 | Compound |
| 2 | Butterfly Maschine | 3×10–12 | Isolation |
| 3 | Schulterdrücken KH | 3×8–10 | Compound |
| 4 | Seitheben KH | 3×12–15 | Isolation |
| 5 | Trizeps Pushdown Kabel | 3×10–12 | Isolation |
| 6 | Cable Crunch | 3×12–15 | Core |
| 7 | Plank | 3×30–60s | Core |

### Pull-Day Template

| # | Übung | Sets × Reps | Typ |
|---|-------|-------------|-----|
| 1 | Latzug Maschine | 3×8–10 | Compound |
| 2 | Rudermaschine sitzend | 3×8–10 | Compound |
| 3 | Face Pulls Kabel | 3×12–15 | Isolation |
| 4 | Bizeps Curls KH | 3×10–12 | Isolation |
| 5 | Reverse Fly Maschine | 3×12–15 | Isolation |
| 6 | Russian Twist | 3×15 pro Seite | Core |
| 7 | Dead Bug | 3×10 pro Seite | Core |

### Beine-Day Template

| # | Übung | Sets × Reps | Typ |
|---|-------|-------------|-----|
| 1 | Beinpresse | 3×8–10 | Compound |
| 2 | Beinbeuger Maschine | 3×10–12 | Isolation |
| 3 | Beinstrecker Maschine | 3×10–12 | Isolation |
| 4 | Wadenmaschine | 3×12–15 | Isolation |
| 5 | Reverse Crunch | 3×12–15 | Core |
| 6 | Dead Bug | 3×10 pro Seite | Core |

---

## 6. Bevorzugte Lebensmittel & Rezeptbausteine

### Häufig verwendete Zutaten (Referenz für Essensplan-Erstellung)

| Lebensmittel | Portion | kcal | Protein |
|-------------|---------|------|---------|
| Skyr (natur) | 200g | 120 | 22g |
| Magerquark | 200g | 136 | 24g |
| Hüttenkäse | 100g | 98 | 11g |
| Haferflocken | 50g | 180 | 7g |
| Ei (Größe M) | 1 Stück | 85 | 7g |
| Hühnchenbrust | 150g | 165 | 33g |
| Thunfisch (Dose, im Saft) | 150g | 165 | 37g |
| Lachs | 150g | 280 | 30g |
| Vollkornbrot | 1 Scheibe | 80 | 3g |
| Banane (klein) | 1 Stück | 80 | 1g |
| Beeren (Heidel-/Himbeeren) | 100g | 45 | 1g |
| Leichter Feta | 50g | 90 | 7g |
| Walnüsse | 10g | 65 | 2g |
| Olivenöl | 1 EL | 120 | 0g |
| Süßkartoffel | 200g | 172 | 3g |
| Reis (gekocht) | 150g | 195 | 4g |
| Honig | 1 TL | 25 | 0g |

### Typische Mahlzeiten-Bausteine

**Frühstück-Optionen (~400–450 kcal):**
- Porridge: 50g Haferflocken + 150g Skyr + 200ml Milch + 80g Beeren + 1 TL Honig
- Rührei: 3 Eier + 100g Hüttenkäse + 1 Scheibe Vollkornbrot

**Mittagessen-Optionen (~500–700 kcal):**
- Thunfisch-Bowl: 150g Thunfisch + Tomate + Gurke + 200g Süßkartoffel + 1 EL Olivenöl
- Hühnchen-Reis: 150g Hühnchenbrust + 150g Reis + Gemüse + 1 EL Olivenöl
- Green & Protein Bowls (Restaurant-Option für unterwegs)

**Abendessen-Optionen (~400–500 kcal):**
- Rührei: 2 Eier + 100g Hüttenkäse + 1 Vollkornbrot + Tomate
- Lachs mit Gemüse: 150g Lachs + 200g Brokkoli/Zucchini

**Snack-Optionen (~150–200 kcal):**
- 200g Magerquark + 10g Walnüsse + 1 TL Honig (~200 kcal, 24g Protein)
- 200g Skyr + 50g Beeren (~155 kcal, 22g Protein)

---

## 7. Standort-Kontext

Die App sollte einen simplen Standort-Umschalter haben:

| Standort | Küchenausstattung | Besonderheiten |
|----------|-------------------|----------------|
| Berlin | Airfryer, Herd, Ofen | Volle Ausstattung, Gym vor Ort |
| Salzburg | Herd, Ofen (kein Airfryer) | Vereinfachte Essenspläne, ggf. kein Gym |

→ Essensplan-Templates passen sich automatisch an (kein Airfryer in Salzburg).

---

## 8. Notifications & Erinnerungen

| Uhrzeit | Trigger | Nachricht |
|---------|---------|-----------|
| 07:00 | Täglich | "Guten Morgen! Trage deine Morgen-Biomarker ein." |
| Pre-Training | Wenn Training geplant | "Vergiss den Pre-Workout Snack nicht (Banane)." |
| 20:00 | Abend-Snack nicht abgehakt | "Abend-Snack nicht vergessen!" |
| 21:00 | Tägliches Tracking unvollständig | "Tagesabschluss: Wie war dein Tag? Trage kcal/Protein IST ein." |
| Sonntag 10:00 | Wöchentlich | "Zeit für die Wochenanalyse & neue Planung!" |

---

## 9. Wochenanalyse-Feature

Jeden Sonntag (oder manuell auslösbar) generiert die App eine Wochenzusammenfassung:

**Enthält:**
- SOLL vs. IST Vergleich: kcal und Protein (Durchschnitt + pro Tag)
- Gewichtstrend der Woche (Δ zum Vorwoche-Durchschnitt)
- Bauchumfang-Trend
- Trainingsvolumen: Geplant vs. absolviert
- Progressive Overload: Welche Übungen wurden gesteigert?
- Biomarker-Trends: Schlaf, Ruhepuls, Energielevel
- Top-Erkenntnis (automatisch generiert):
  - z.B. "Kalorien 3× über Ziel – Hauptursache: Alkohol am Freitag"
  - z.B. "Bauchumfang -0.5 cm diese Woche – Trend stimmt!"

---

## 10. Vorgehensweise in Antigravity

### Empfohlene Reihenfolge

**Phase 1 – Datenmodell & Speicherung**
1. Erstelle die Datenmodelle (Abschnitt 2) als Basis
2. Wähle Speicherung: SQLite lokal (einfach), Firebase (wenn Cloud gewünscht), oder Supabase
3. Erstelle CRUD-Operationen für alle Entities

**Phase 2 – Kern-Screens**
4. Dashboard mit Biomarker-Eingabe
5. Training-Tab mit Übungsliste und Logging
6. Ernährung-Tab mit Essensplan und SOLL/IST

**Phase 3 – Automatisierung**
7. Einkaufslisten-Generierung aus Essensplänen
8. Progressive Overload Empfehlungen
9. Wochenanalyse

**Phase 4 – Polish**
10. Notifications
11. Charts und Trends
12. Standort-Umschalter (Berlin/Salzburg)

### Prompts für Antigravity

Du kannst in Antigravity phasenweise arbeiten. Hier sind Beispiel-Prompts:

**Starter-Prompt (Phase 1+2):**
> "Erstelle eine mobile Fitness-Tracking-App mit folgenden Features: Tägliches Biomarker-Tracking (Gewicht, Bauchumfang, Schlaf, Ruhepuls, Energielevel), Trainingslog mit Push/Pull/Beine Split und Cardio, Ernährungstracking mit SOLL/IST Kalorien und Protein. Verwende das Datenmodell aus der angehängten Spezifikation. Die App soll deutsch sein und ein dunkles, sportliches Design haben."

**Dann iterativ:**
> "Füge einen Einkaufslisten-Tab hinzu, der Zutaten aus den Essensplänen aggregiert und nach Kategorien gruppiert."

> "Erstelle eine Wochenanalyse-Ansicht mit SOLL/IST Vergleich für Kalorien und Protein sowie Gewichts- und Bauchumfang-Trend-Charts."

> "Füge Progressive Overload Logik hinzu: Wenn alle Sets das Reps-Ziel erreichen, empfehle Gewichtserhöhung in der nächsten Session."

### Wichtige Hinweise für Antigravity

1. **Dieses Dokument als Kontext hochladen** – Lade die gesamte Spec als Datei in dein Antigravity-Projekt, damit der Agent darauf zugreifen kann
2. **Iterativ arbeiten** – Nicht alles auf einmal bauen. Phase für Phase
3. **Datenmodell zuerst** – Die App steht und fällt mit sauberem Datenmodell
4. **Mobile-first** – Alle Screens für Handy-Nutzung optimieren (im Gym, beim Einkaufen)
5. **Offline-fähig** – Gym hat oft schlechten Empfang → lokale Speicherung mit optionalem Sync

---

## 11. Daten-Migration aus Notion

Falls du bestehende Daten aus Notion übernehmen willst:

1. **Tägliches Tracking** exportieren (Notion → CSV) und in die App importieren
2. **Trainingslog** exportieren (Notion → CSV) und importieren
3. Die Essenspläne und Einkaufslisten sind text-basiert und müssten manuell oder per Script übertragen werden

Die historischen Daten sind wertvoll für die Trend-Charts – besonders der Gewichts- und Bauchumfang-Verlauf seit Projektstart.

---

*Erstellt am 12.04.2026 – basierend auf 7+ Wochen Tracking-Daten und bewährten Fitness-Coaching-Prinzipien.*
