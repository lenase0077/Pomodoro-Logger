import { useState, useCallback } from 'react'
import Layout from './components/Layout/Layout'
import Timer from './components/Timer/Timer'
import Logger from './components/Logger/Logger'
import CommitGraph from './components/Visuals/CommitGraph'
import FocusGalaxy from './components/Visuals/FocusGalaxy'
import TaskList from './components/Tasks/TaskList'
import TransparencyCard from './components/Export/TransparencyCard'
import SettingsModal from './components/Settings/SettingsModal'
import { useTimer } from './hooks/useTimer'
import { useWorkLog } from './hooks/useWorkLog'
import { Share2, Settings } from 'lucide-react'
import AmbientBackground from './components/Visuals/AmbientBackground'
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
    debugFastForward,
    finishSession,
    updateSettings
  } = useTimer();

  const { addLog, logs } = useWorkLog();
  const [showExport, setShowExport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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

    // Removed confetti trigger here as it should be in TaskList? 
    // Actually TaskList handles the animation, App handles the logging.
    // But we can trigger global confetti here if we want!
    // But the previous edit tried to put it in TaskList. Let's stick to putting it in TaskList for immediate feedback on click.

    addLog(`Task Completed: ${taskText}`, 0, 'focus');
  }, [addLog]);

  return (
    <Layout headerActions={
      <div style={{ position: 'relative' }}>
        <button
          onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
            e.currentTarget.style.color = 'var(--color-text-main)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-muted)';
          }}
          aria-label="Settings"
          title="Settings"
        >
          <Settings size={20} />
        </button>

        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSave={updateSettings}
        />
      </div>
    }>
      <AmbientBackground mode={mode.id} />

      <div className="area-timer">
        <Timer
          timerState={{ timeLeft, isRunning, mode, progress, formatTime, MODES, finishSession }}
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
