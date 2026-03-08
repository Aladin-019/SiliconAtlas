import { useState } from 'react'
import HomePage from './pages/HomePage'
import ParallelCoordinates from './pages/ParallelCoordinates'
import PCAPlot from './pages/PCAPlot'
import './App.css'

type View = 'home' | 'parallel-coordinates' | 'pca'

function App() {
  const [view, setView] = useState<View>('home')

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-title">SiliconAtlas</div>
        <ul className="sidebar-menu">
          <li>
            <button
              type="button"
              className={view === 'home' ? 'active' : ''}
              onClick={() => setView('home')}
            >
              Home
            </button>
          </li>
          <li>
            <button
              type="button"
              className={view === 'parallel-coordinates' ? 'active' : ''}
              onClick={() => setView('parallel-coordinates')}
            >
              Parallel Coordinates
            </button>
          </li>
          <li>
            <button
              type="button"
              className={view === 'pca' ? 'active' : ''}
              onClick={() => setView('pca')}
            >
              PCA Plot
            </button>
          </li>
        </ul>
      </nav>
      <main className="main-content">
        {view === 'home' && <HomePage />}
        {view === 'parallel-coordinates' && <ParallelCoordinates />}
        {view === 'pca' && <PCAPlot />}
      </main>
    </div>
  )
}

export default App