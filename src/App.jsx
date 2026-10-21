import { useEffect, useState } from 'react'
import './App.css'

const devices = {
  teclado: { name: 'Teclado', icon: '⌨', color: 'blue', latency: 1.2, throughput: 8, message: 'Llega una tecla' },
  ssd: { name: 'SSD', icon: '▣', color: 'cyan', latency: 2.8, throughput: 72, message: 'Termina un bloque de archivo' },
  hdd: { name: 'HDD', icon: '◉', color: 'orange', latency: 6.5, throughput: 24, message: 'El disco encuentra tus datos' },
}

const methods = {
  polling: { name: 'Polling', icon: '↻', cpu: 94, speed: 1.15, color: 'orange', description: 'La CPU pregunta una y otra vez.' },
  interrupt: { name: 'Interrupciones', icon: '◒', cpu: 28, speed: 1, color: 'blue', description: 'El dispositivo avisa cuando está listo.' },
  dma: { name: 'DMA', icon: '⇄', cpu: 8, speed: 0.82, color: 'cyan', description: 'Un controlador mueve el bloque por la CPU.' },
}

function App() {
  const [device, setDevice] = useState('ssd')
  const [method, setMethod] = useState('polling')
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(0)
  const [activeTab, setActiveTab] = useState('simulator')
  const [speed, setSpeed] = useState(1)
  const currentDevice = devices[device]
  const currentMethod = methods[method]

  useEffect(() => {
    if (!running) return undefined
    const timer = window.setInterval(() => {
      setProgress((value) => {
        const next = value + 4 * speed * currentMethod.speed
        if (next >= 100) {
          setRunning(false)
          setCompleted((count) => count + 1)
          return 100
        }
        return next
      })
    }, 120)
    return () => window.clearInterval(timer)
  }, [running, speed, currentMethod.speed])

  const startSimulation = () => { setProgress(0); setRunning(true) }
  const resetSimulation = () => { setRunning(false); setProgress(0); setCompleted(0) }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">OS</span><span>Sistemas Operativos <small>LAB 02 / E-S</small></span></div>
        <div className="live-status"><span className="status-dot" /> simulador en vivo <span className="divider" /> ronda {String(completed + 1).padStart(2, '0')}</div>
      </header>

      <section className="intro-row">
        <div><p className="eyebrow">Rendimiento y comunicación CPU-dispositivo</p><h1>Haz que la CPU<br /><em>trabaje más inteligente.</em></h1><p className="intro-copy">Elige un dispositivo y descubre qué pasa cuando la CPU espera datos. Sin fórmulas largas: solo señales, tiempo y decisiones.</p></div>
        <div className="intro-badge"><span>OBJETIVO</span><strong>liberar la CPU</strong><small>y mover los datos a tiempo</small></div>
      </section>

      <nav className="tabs" aria-label="Secciones del laboratorio">
        <button className={activeTab === 'simulator' ? 'tab active' : 'tab'} onClick={() => setActiveTab('simulator')}>01 · Simulador</button>
        <button className={activeTab === 'compare' ? 'tab active' : 'tab'} onClick={() => setActiveTab('compare')}>02 · Comparar</button>
        <span className="tab-hint">Interactúa con los controles para ver la diferencia</span>
      </nav>

      {activeTab === 'simulator' ? (
        <section className="workspace">
          <aside className="control-panel panel">
            <div className="panel-heading"><span>CONFIGURACIÓN</span><span className="step">paso 1/3</span></div>
            <h2>¿Qué está esperando?</h2>
            <div className="device-list">{Object.entries(devices).map(([key, item]) => <button key={key} className={`device-option ${device === key ? 'selected' : ''}`} onClick={() => { setDevice(key); setProgress(0) }}><span className={`device-icon ${item.color}`}>{item.icon}</span><span><strong>{item.name}</strong><small>{item.message}</small></span><span className="radio">{device === key ? '●' : '○'}</span></button>)}</div>
            <div className="control-divider" />
            <div className="panel-heading"><span>ESTRATEGIA</span><span className="step">paso 2/3</span></div>
            <h2>¿Cómo se entera la CPU?</h2>
            <div className="method-list">{Object.entries(methods).map(([key, item]) => <button key={key} className={`method-option ${method === key ? `selected ${item.color}` : ''}`} onClick={() => { setMethod(key); setProgress(0) }}><span className="method-icon">{item.icon}</span><span><strong>{item.name}</strong><small>{item.description}</small></span></button>)}</div>
            <div className="speed-control"><div><label htmlFor="speed">Velocidad de la simulación</label><output>{speed.toFixed(1)}x</output></div><input id="speed" type="range" min="0.5" max="2" step="0.1" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} /></div>
            <div className="action-row"><button className="primary-button" onClick={startSimulation} disabled={running}>{running ? 'Transfiriendo...' : '▶ Iniciar simulación'}</button><button className="reset-button" onClick={resetSimulation} aria-label="Reiniciar simulación">↺</button></div>
          </aside>

          <div className="simulation-column">
            <div className="simulation-card panel">
              <div className="simulation-top"><div><p className="eyebrow">SIMULACIÓN ACTIVA</p><h2>{currentDevice.name} → memoria RAM</h2></div><div className={`signal-pill ${currentMethod.color}`}><span className="pulse" /> {running ? 'EN EJECUCIÓN' : progress === 100 ? 'COMPLETADO' : 'LISTO'}</div></div>
              <div className="flow-diagram"><div className="flow-node"><span className="node-icon">{currentDevice.icon}</span><strong>{currentDevice.name}</strong><small>dispositivo</small></div><div className={`flow-line ${running ? 'moving' : ''}`} /><div className="flow-node highlight"><span className="node-icon">{method === 'dma' ? '⇄' : '▦'}</span><strong>{method === 'dma' ? 'DMA' : 'CPU'}</strong><small>{method === 'dma' ? 'controlador' : 'espera'}</small></div><div className={`flow-line ${progress === 100 ? 'complete' : ''}`} /><div className="flow-node"><span className="node-icon">▤</span><strong>RAM</strong><small>memoria</small></div></div>
              <div className="progress-area"><div className="progress-label"><span>Transferencia del bloque</span><strong>{Math.round(progress)}%</strong></div><div className="progress-track"><div className={`progress-fill ${currentMethod.color}`} style={{ width: `${progress}%` }} /></div><div className="time-label"><span>0 ms</span><span>{progress === 100 ? '¡Datos listos!' : currentMethod.description}</span><span>{currentDevice.latency} ms aprox.</span></div></div>
            </div>
            <div className="metrics-grid"><div className="metric-card"><span className="metric-label">USO DE CPU</span><strong className={currentMethod.cpu > 70 ? 'warning' : ''}>{progress === 100 ? 0 : currentMethod.cpu}<small>%</small></strong><div className="mini-bars">{[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => <i key={bar} className={bar <= Math.ceil((progress === 100 ? 0 : currentMethod.cpu) / 12.5) ? 'filled' : ''} />)}</div></div><div className="metric-card"><span className="metric-label">LATENCIA</span><strong>{currentDevice.latency}<small> ms</small></strong><p>Tiempo hasta el primer dato</p></div><div className="metric-card"><span className="metric-label">THROUGHPUT</span><strong>{currentDevice.throughput}<small> MB/s</small></strong><p>Datos que llegan por segundo</p></div></div>
            <div className="insight"><span className="insight-icon">✦</span><div><strong>{progress === 100 ? '¡Misión cumplida!' : method === 'polling' ? 'La CPU está ocupada preguntando.' : method === 'interrupt' ? 'La CPU puede hacer otra tarea.' : 'El DMA mueve el bloque mientras la CPU sigue libre.'}</strong><p>{progress === 100 ? 'Acabas de ver cómo el dispositivo entrega sus datos a la memoria.' : 'Mira cómo cambia el uso de CPU al cambiar de estrategia.'}</p></div></div>
          </div>
        </section>
      ) : (
        <section className="compare-view"><div className="compare-heading"><div><p className="eyebrow">LECTURA RÁPIDA</p><h2>Una espera no siempre es igual.</h2></div><p>La latencia es cuánto tarda en comenzar. El throughput es cuánto entrega después.</p></div><div className="compare-cards">{Object.entries(methods).map(([key, item]) => <article className={`compare-card ${item.color}`} key={key}><div className="compare-icon">{item.icon}</div><h3>{item.name}</h3><p>{item.description}</p><div className="compare-stat"><span>CPU ocupada</span><strong>{item.cpu}%</strong></div><div className="compare-bar"><i style={{ width: `${item.cpu}%` }} /></div><small>{key === 'polling' ? 'Útil en esperas muy cortas' : key === 'interrupt' ? 'Ideal para eventos impredecibles' : 'Ideal para bloques grandes'}</small></article>)}</div><div className="memory-strip"><span>Rendimiento de memoria</span><strong>RAM</strong><i /><strong>SSD</strong><i /><strong>HDD</strong><small>decenas de ns · 10–100s de µs · varios ms</small></div></section>
      )}
      <footer><span>Bloque 2 · E/S y rendimiento</span><span>Aprende haciendo <b>●</b></span></footer>
    </main>
  )
}

export default App
