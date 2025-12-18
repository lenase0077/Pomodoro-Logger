import { useState, useCallback } from 'react'
import Layout from './components/Layout/Layout'
import Timer from './components/Timer/Timer'
import Logger from './components/Logger/Logger'
import CommitGraph from './components/Visuals/CommitGraph'
import FocusGalaxy from './components/Visuals/FocusGalaxy'
import TaskList from './components/Tasks/TaskList'
import TransparencyCard from './components/Export/TransparencyCard'
import { useTimer } from './hooks/useTimer'
import { useWorkLog } from './hooks/useWorkLog'
import { Share2 } from 'lucide-react'
import './App.css'

function App() {
  const {
    timeLeft,
    isRunning,
    isCompleted,
    mode,
    progress,
    startTimer,
    pauseTimer,
    resetTimer,
    switchMode,
    formatTime,
    MODES,
    debugFastForward
  } = useTimer();

  const { addLog, logs } = useWorkLog();
  const [showExport, setShowExport] = useState(false);

  const handleLog = useCallback((note) => {
    // Log the session (using default duration for the mode)
    addLog(note, mode.time, mode.id);
    // Reset timer to be ready for next
    resetTimer();
  }, [addLog, mode.time, mode.id, resetTimer]);

  const handleSkipLog = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Auto-log for tasks
  const handleTaskComplete = useCallback((taskText) => {
    // Add log with "task" focus type logic. 
    // For now using 'focus' so it appears as a star/square.
    // 0 duration to not mess up total hours too much? Or 15 min assumption? 
    // User said: "registrar checklist, y automaticamente se agreguen al grafico"
    // Let's count it as a "Small Win" -> maybe 10 mins or just 0.
    addLog(`Task Completed: ${taskText}`, 0, 'focus');
  }, [addLog]);

  return (
    <Layout>
      <div className="area-timer">
        <Timer
          timerState={{ timeLeft, isRunning, mode, progress, formatTime, MODES }}
          onStart={startTimer}
          onPause={pauseTimer}
          onReset={resetTimer}
          onSwitchMode={switchMode}
        />

        {/* Break Overlay inside Timer Area */}
        {isCompleted && mode.id !== 'focus' && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h3>Break is over! Time to focus. ⚡</h3>
            <button onClick={resetTimer} className="control-btn primary" style={{ width: 'auto', padding: '10px 20px', borderRadius: '12px', height: 'auto', margin: '20px auto' }}>
              Back to Work
            </button>
          </div>
        )}
      </div>

      {/* Galaxy Section */}
      <div className="area-galaxy">
        {/* Always show galaxy for coolness factor */}
        <FocusGalaxy logs={logs} />
      </div>

      {/* Stats Section */}
      <div className="area-stats">
        {!isRunning && logs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Stats</h3>
              <button
                onClick={() => setShowExport(true)}
                className="control-btn"
                style={{ width: 'auto', height: 'auto', padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem', gap: '8px' }}
              >
                <Share2 size={16} /> Share
              </button>
            </div>
            <CommitGraph logs={logs} />
          </div>
        )}
      </div>

      {/* Task List Section - Always visible */}
      <div className="area-tasks">
        <TaskList onTaskComplete={handleTaskComplete} />
      </div>

      {/* Show Logger Modal when timer completes and it was a Focus session */}
      {isCompleted && mode.id === 'focus' && (
        <Logger
          onLog={handleLog}
          onCancel={handleSkipLog}
        />
      )}

      {/* Export Modal */}
      {showExport && (
        <TransparencyCard
          logs={logs}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* Debug Control */}
      <div style={{ position: 'fixed', bottom: '10px', right: '10px', opacity: 0.2, transition: 'opacity 0.3s', zIndex: 9999 }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.2'}>
        <button onClick={debugFastForward} style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid currentColor', background: 'var(--color-surface)', color: 'var(--color-text-main)', cursor: 'pointer' }}>
          ⚡ Debug: 5s
        </button>
      </div>

    </Layout>
  )
}

export default App
