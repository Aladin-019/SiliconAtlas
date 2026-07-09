import { useState } from 'react'
import { useGLTF } from '@react-three/drei'

import PCBExplorationScene from './pcb-explorer/PCBExplorationScene'
import PCBSelectionPage from './pcb-explorer/PCBSelectionPage'
import { boardModelOptions, defaultBoardModelKey, getBoardModelByKey } from './pcb-explorer/models'
import type { BoardModelKey } from './pcb-explorer/models'

type ExplorerStep = 'select' | 'explore'

function PCBExplorer() {
  const [step, setStep] = useState<ExplorerStep>('select')
  const [selectedModelKey, setSelectedModelKey] = useState<BoardModelKey>(defaultBoardModelKey)

  const selectedModel = getBoardModelByKey(selectedModelKey)

  if (step === 'select') {
    return (
      <PCBSelectionPage
        selectedModelKey={selectedModelKey}
        models={boardModelOptions}
        onChangeModel={setSelectedModelKey}
        onStartExploring={() => setStep('explore')}
      />
    )
  }

  return (
    <PCBExplorationScene
      model={selectedModel}
      onChooseDifferentModel={() => setStep('select')}
    />
  )
}

boardModelOptions.forEach((model) => {
  useGLTF.preload(model.url)
})

export default PCBExplorer