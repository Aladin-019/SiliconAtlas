import type { BoardModelKey, BoardModelOption } from './models'

type PCBSelectionPageProps = {
  selectedModelKey: BoardModelKey
  models: BoardModelOption[]
  onChangeModel: (key: BoardModelKey) => void
  onStartExploring: () => void
}

function PCBSelectionPage({
  selectedModelKey,
  models,
  onChangeModel,
  onStartExploring,
}: PCBSelectionPageProps) {
  return (
    <div>
      <h1>PCB Explorer (3D)</h1>
      <p>Select the PCB model you want to explore, then start directly in first-person mode.</p>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <label htmlFor="pcb-model-select" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          PCB model
          <select
            id="pcb-model-select"
            value={selectedModelKey}
            onChange={(event) => onChangeModel(event.target.value as BoardModelKey)}
          >
            {models.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button type="button" onClick={onStartExploring}>
          Start exploring
        </button>
      </div>
    </div>
  )
}

export default PCBSelectionPage