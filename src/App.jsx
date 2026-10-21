import { useEffect, useState } from 'react'
import './App.css'

const memoryDevices = {
  ram: { name: 'RAM DDR4', type: 'DRAM · volátil', latency: 100, latencyLabel: 'decenas de ns', speed: 25.6, speedLabel: '25,6 GB/s', color: 'blue', icon: '▤', use: 'Datos que la CPU está usando' },
  sata: { name: 'SSD SATA', type: 'Flash NAND · persistente', latency: 100000, latencyLabel: '10–100 µs', speed: 0.55, speedLabel: '550 MB/s', color: 'cyan', icon: '▣', use: 'Arranque y archivos' },
  nvme: { name: 'SSD NVMe', type: 'Flash NAND · persistente', latency: 50000, latencyLabel: 'decenas de µs', speed: 3.5, speedLabel: '3,5 GB/s', color: 'cyan', icon: '▣', use: 'Archivos grandes y rápidos' },
  hdd: { name: 'HDD', type: 'Platos magnéticos · persistente', latency: 10000000, latencyLabel: 'varios ms', speed: 0.15, speedLabel: '100–200 MB/s', color: 'orange', icon: '◉', use: 'Gran capacidad a bajo coste' },
}

const moduleItems = [
  ['memory', '01', 'Memoria', 'RAM · SSD · HDD'],
  ['io', '02', 'CPU ↔ E/S', 'Polling · IRQ · DMA'],
  ['compare', '03', 'Experimento', 'Polling vs. interrupciones'],
  ['dma', '04', 'DMA', 'Bus y transferencias'],
  ['mmio', '05', 'MMIO / PMIO', 'Registros y puertos'],
  ['quiz', '06', 'Reto final', 'Comprueba lo aprendido'],
]

const mechanisms = {
  polling: { name: 'Polling', glyph: '↻', tint: 'orange', cpu: 92, tagline: 'La CPU pregunta: ¿ya llegó?' },
  interrupt: { name: 'Interrupciones', glyph: '⚡', tint: 'blue', cpu: 28, tagline: 'El dispositivo avisa con una IRQ.' },
  dma: { name: 'DMA', glyph: '⇄', tint: 'cyan', cpu: 8, tagline: 'El controlador mueve el bloque.' },
}

const flowPhases = {
  polling: ['CPU pide datos', 'Lee READY', 'Busy-wait', 'CPU copia el dato'],
  interrupt: ['CPU hace otra tarea', 'Dispositivo lanza IRQ', 'ISR atiende el evento', 'CPU reanuda'],
  dma: ['CPU configura DMA', 'BREQ / BGNT', 'DMA mueve el bloque', 'IRQ de finalización'],
}

function formatTime(value) {
  if (value < 1) return `${(value * 1000).toFixed(1)} ms`
  return `${value.toFixed(1)} s`
}

function App() {
  const [module, setModule] = useState('home')
  const [visited, setVisited] = useState([])
  const [showHelp, setShowHelp] = useState(false)
  const openModule = (key) => {
    setModule(key)
    if (!visited.includes(key)) setVisited((items) => [...items, key])
  }
  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">OS</span><span>Sistemas Operativos <small>LABORATORIO INTERACTIVO</small></span></div>
        <button className="help-button" onClick={() => setShowHelp((value) => !value)}>?</button>
      </header>
      {showHelp && <div className="notice help-notice"><strong>Cómo usar el laboratorio</strong><span>Elige un módulo, cambia los parámetros y pulsa los controles. Todo está simulado con valores didácticos, no mide tu hardware real.</span></div>}
      <section className="hero"><div><p className="eyebrow">Bloque 2 · Memoria y entrada / salida</p><h1>Laboratorio interactivo<br /><em>de Sistemas Operativos</em></h1><p>Explora cómo viajan los datos y cómo el sistema operativo decide quién trabaja mientras espera.</p></div><div className="hero-chip"><span>CPU</span><i /><i /><i /><small>laboratorio listo</small></div></section>
      <nav className="module-nav"><button className={module === 'home' ? 'module-tab selected home-tab' : 'module-tab home-tab'} onClick={() => setModule('home')}><b>⌂</b><span><strong>Inicio</strong><small>Mapa del laboratorio</small></span></button>{moduleItems.map(([key, number, title, subtitle]) => <button key={key} className={module === key ? 'module-tab selected' : 'module-tab'} onClick={() => openModule(key)}><b>{number}</b><span><strong>{title}</strong><small>{subtitle}</small></span></button>)}</nav>
      <div className="module-stage">
        {module === 'home' && <HomeModule visited={visited} onOpen={openModule} />}
        {module === 'memory' && <MemoryModule />}
        {module === 'io' && <IOModule />}
        {module === 'compare' && <CompareModule />}
        {module === 'dma' && <DmaModule />}
        {module === 'mmio' && <MmioModule />}
        {module === 'quiz' && <QuizModule />}
      </div>
      <div className="notice disclaimer">Simulador educativo. Los tiempos y porcentajes representan un modelo simplificado y no sustituyen mediciones reales de hardware.</div>
      <footer><span>Sistemas Operativos · Equipo 2</span><span>Aprender haciendo <b>●</b></span></footer>
    </main>
  )
}

function HomeModule({ visited, onOpen }) {
  const cards = [
    ['memory', '01', 'RAM vs. SSD vs. HDD', 'Compara velocidad, latencia y tamaño de transferencia.', '▤'],
    ['io', '02', '¿Cómo se comunica la CPU?', 'Genera un dato y observa sus registros y señales.', '↔'],
    ['compare', '03', 'Polling vs. interrupciones', 'Mismo evento, dos formas de esperar.', '⚡'],
    ['dma', '04', 'DMA: transferencia directa', 'Configura un bloque y libera a la CPU.', '⇄'],
    ['dma', '05', 'Cycle stealing vs. burst', 'Mira quién controla el bus compartido.', '▥'],
    ['mmio', '06', 'MMIO vs. PMIO', 'Explora registros, direcciones y puertos.', '⌘'],
  ]
  return <section className="home-module"><div className="home-heading"><div><p className="eyebrow">LABORATORIO VIRTUAL</p><h2>Elige un experimento</h2><p>Toca una tarjeta, cambia los controles y mira cómo se mueve la información.</p></div><div className="completion"><strong>{visited.length}/6</strong><span>módulos explorados</span><i><b style={{ width: `${(visited.length / 6) * 100}%` }} /></i></div></div><div className="home-cards">{cards.map(([key, number, title, description, icon]) => <article className={`home-card ${key}`} key={`${number}-${title}`}><div className="card-icon">{icon}</div><span className="card-number">{number}</span><h3>{title}</h3><p>{description}</p><button onClick={() => onOpen(key)}>Explorar <span>→</span></button></article>)}</div><div className="home-prompt"><span>⌁</span><div><strong>Empieza por el experimento de Polling</strong><p>Es el ejemplo más fácil para ver por qué una CPU puede perder tiempo esperando.</p></div><button onClick={() => onOpen('compare')}>Abrir comparador</button></div></section>
}

function ModuleHeader({ eyebrow, title, description }) {
  return <div className="module-header"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{description}</p></div></div>
}

function MemoryModule() {
  const [selected, setSelected] = useState(['ram', 'hdd'])
  const [size, setSize] = useState(256)
  const [unit, setUnit] = useState('KB')
  const [active, setActive] = useState('ram')
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showWhy, setShowWhy] = useState(false)
  const bytes = size * (unit === 'KB' ? 1024 : unit === 'MB' ? 1024 * 1024 : 1024 * 1024 * 1024)
  const selectedDevices = selected.map((key) => memoryDevices[key])
  const transferRows = selectedDevices.map((item) => {
    const gb = bytes / (1024 ** 3)
    const seconds = gb / item.speed + item.latency / 1e9
    return { ...item, seconds }
  })
  const toggle = (key) => setSelected((items) => items.includes(key) ? items.filter((item) => item !== key) : items.length < 3 ? [...items, key] : items)
  useEffect(() => {
    if (!running) return undefined
    const timer = window.setInterval(() => setProgress((value) => {
      const next = value + 2.4
      if (next >= 100) { setRunning(false); return 100 }
      return next
    }), 60)
    return () => window.clearInterval(timer)
  }, [running])
  const startComparison = () => { setProgress(0); setRunning(true) }
  return <section><ModuleHeader eyebrow="01 · Rendimiento" title="Memoria y almacenamiento" description="Compara la espera inicial y la velocidad de entrega. Cambia el tamaño para ver cuándo pesa la latencia y cuándo manda el throughput." />
    <div className="memory-layout"><div className="memory-selector panel"><div className="section-kicker">ELIGE HASTA 3 TECNOLOGÍAS</div>{Object.entries(memoryDevices).map(([key, item]) => <button className={`memory-choice ${selected.includes(key) ? 'selected' : ''}`} key={key} onClick={() => { toggle(key); setActive(key) }}><span className={`big-icon ${item.color}`}>{item.icon}</span><span><strong>{item.name}</strong><small>{item.type}</small></span><i>{selected.includes(key) ? '✓' : '+'}</i></button>)}<div className="active-detail"><span className={`device-orb ${memoryDevices[active].color}`}>{memoryDevices[active].icon}</span><div><strong>{memoryDevices[active].name}</strong><p>{memoryDevices[active].use}. Latencia de referencia: {memoryDevices[active].latencyLabel}.</p></div></div></div><div className="memory-main"><div className="experiment-controls panel"><label>Tamaño de transferencia<input type="number" min="1" value={size} onChange={(event) => setSize(Number(event.target.value) || 1)} /></label><select value={unit} onChange={(event) => setUnit(event.target.value)}><option>KB</option><option>MB</option><option>GB</option></select><div className="formula"><span>tiempo ≈ latencia + datos ÷ velocidad</span><strong>modelo didáctico</strong></div></div><div className="bar-panel panel"><div className="panel-title"><span>VELOCIDAD ORIENTATIVA</span><small>barra logarítmica para apreciar la escala</small></div>{transferRows.map((item) => <div className="bar-row" key={item.name}><div><strong>{item.name}</strong><span>{item.speedLabel}</span></div><div className="bar-track"><i className={item.color} style={{ width: `${Math.max(5, Math.min(100, Math.log10(item.speed * 100 + 1) * 42))}%` }} /></div></div>)}<div className="transfer-results"><strong>{size} {unit}</strong><span>tiempo teórico</span>{transferRows.map((item) => <div key={item.name}><b>{item.name}</b><em>{formatTime(item.seconds)}</em></div>)}</div></div><div className="warning-box">Las latencias son rangos de referencia. En hardware real cambian según la carga, el patrón de acceso, la interfaz y el controlador.</div></div></div>
    <div className="memory-flight panel"><div className="flight-title"><div><span className="section-kicker">COMPARACIÓN EN VIVO</span><strong>El mismo bloque viaja a tres velocidades</strong></div><button className="primary-button" onClick={startComparison}>{running ? 'Transfiriendo...' : progress === 100 ? 'Repetir comparación' : '▶ Iniciar comparación'}</button></div>{Object.entries(memoryDevices).filter(([key]) => selected.includes(key)).map(([key, item]) => <div className="flight-lane" key={key}><span className={`big-icon ${item.color}`}>{item.icon}</span><strong>{item.name}</strong><div className="flight-track"><i className={`flight-packet ${item.color} ${running ? 'flying' : ''}`} style={{ left: `${Math.min(94, progress * (item.speed > 10 ? 1.45 : item.speed > 1 ? 1.05 : .68))}%` }}>▰</i></div><small>{progress === 100 ? 'completado' : item.latencyLabel}</small></div>)}<button className="why-button" onClick={() => setShowWhy((value) => !value)}>¿Por qué sucede esto? <span>{showWhy ? '−' : '+'}</span></button>{showWhy && <div className="why-copy">La RAM está conectada directamente al controlador de memoria y no tiene partes mecánicas. El SSD trabaja con páginas y una interfaz; el HDD además debe mover cabezal y platos. Por eso la latencia y el throughput son tan diferentes.</div>}</div><div className="memory-layout"><div className="memory-selector panel"><div className="section-kicker">ELIGE HASTA 3 TECNOLOGÍAS</div>{Object.entries(memoryDevices).map(([key, item]) => <button className={`memory-choice ${selected.includes(key) ? 'selected' : ''}`} key={key} onClick={() => { toggle(key); setActive(key) }}><span className={`big-icon ${item.color}`}>{item.icon}</span><span><strong>{item.name}</strong><small>{item.type}</small></span><i>{selected.includes(key) ? '✓' : '+'}</i></button>)}<div className="active-detail"><span className={`device-orb ${memoryDevices[active].color}`}>{memoryDevices[active].icon}</span><div><strong>{memoryDevices[active].name}</strong><p>{memoryDevices[active].use}. Latencia de referencia: {memoryDevices[active].latencyLabel}.</p></div></div></div><div className="memory-main"><div className="experiment-controls panel"><label>Tamaño de transferencia<input type="number" min="1" value={size} onChange={(event) => setSize(Number(event.target.value) || 1)} /></label><select value={unit} onChange={(event) => setUnit(event.target.value)}><option>KB</option><option>MB</option><option>GB</option></select><div className="formula"><span>tiempo ≈ latencia + datos ÷ velocidad</span><strong>modelo didáctico</strong></div></div><div className="bar-panel panel"><div className="panel-title"><span>VELOCIDAD ORIENTATIVA</span><small>barra logarítmica para apreciar la escala</small></div>{transferRows.map((item) => <div className="bar-row" key={item.name}><div><strong>{item.name}</strong><span>{item.speedLabel}</span></div><div className="bar-track"><i className={item.color} style={{ width: `${Math.max(5, Math.min(100, Math.log10(item.speed * 100 + 1) * 42))}%` }} /></div></div>)}<div className="transfer-results"><strong>{size} {unit}</strong><span>tiempo teórico</span>{transferRows.map((item) => <div key={item.name}><b>{item.name}</b><em>{formatTime(item.seconds)}</em></div>)}</div></div><div className="warning-box">Las latencias son rangos de referencia. En hardware real cambian según la carga, el patrón de acceso, la interfaz y el controlador.</div></div></div>
  </section>
}

function IOModule() {
  const [mechanism, setMechanism] = useState('polling')
  const [running, setRunning] = useState(false)
  const [event, setEvent] = useState(false)
  const [progress, setProgress] = useState(0)
  const [queries, setQueries] = useState(0)
  const [events, setEvents] = useState(0)
  const [speed, setSpeed] = useState(1)
  const phase = Math.min(3, Math.floor(progress / 25))
  useEffect(() => {
    if (!running) return undefined
    const timer = window.setInterval(() => {
      setProgress((value) => {
        const next = value + speed * 1.8
        if (next >= 100) { setRunning(false); setEvent(false); return 100 }
        if (mechanism === 'polling') setQueries((count) => count + 1)
        return next
      })
    }, 100)
    return () => window.clearInterval(timer)
  }, [running, speed, mechanism])
  const start = () => { setProgress(0); setQueries(0); setEvent(false); setRunning(true) }
  const generate = () => { setEvent(true); setEvents((value) => value + 1); if (!running) setRunning(true) }
  const status = event ? 'DATO DISPONIBLE' : running ? flowPhases[mechanism][phase] : 'PAUSADO'
  return <section><ModuleHeader eyebrow="02 · Comunicación CPU-dispositivo" title="¿Cómo sabe la CPU que llegó un dato?" description="Genera un evento y observa el mismo dispositivo comportarse con polling, interrupciones o DMA." /><div className="io-toolbar"><div className="segmented">{Object.entries(mechanisms).map(([key, item]) => <button className={mechanism === key ? `active ${item.tint}` : ''} key={key} onClick={() => { setMechanism(key); setRunning(false); setProgress(0) }}>{item.glyph} {item.name}</button>)}</div><div className="toolbar-actions"><button className="secondary-button" onClick={generate}>⚡ Generar evento</button><button className="primary-button" onClick={running ? () => setRunning(false) : start}>{running ? '❚❚ Pausar' : '▶ Iniciar'}</button><button className="reset-button" onClick={() => { setRunning(false); setProgress(0); setQueries(0); setEvent(false) }}>↺</button></div></div><div className="io-layout"><div className="io-board panel"><div className={`io-packet ${running ? 'moving' : ''} ${event ? 'event-ready' : ''}`} /><div className="io-node device-node"><span>⌨</span><strong>Dispositivo</strong><small>dato / carácter</small></div><div className="io-arrow">→</div><div className="controller"><strong>CONTROLADOR</strong><div className={event ? 'register ready' : 'register'}><span>Registro de estado</span><b>{event ? 'READY = 1' : 'READY = 0'}</b></div><div className="register"><span>Registro de datos</span><b>{event ? '0x41 · A' : 'vacío'}</b></div></div><div className="io-arrow">→</div><div className={`io-node cpu-node ${mechanism === 'polling' && running ? 'busy' : ''}`}><span>CPU</span><strong>{mechanism === 'dma' ? 'DMA + RAM' : mechanism === 'interrupt' && event ? 'ISR' : 'CPU'}</strong><small>{status}</small></div><div className="io-explain">{mechanism === 'polling' ? 'La CPU lee READY una y otra vez. Cada consulta cuenta, aunque no haya datos.' : mechanism === 'interrupt' ? 'La CPU trabaja en otra tarea. Al llegar IRQ, guarda contexto, ejecuta la ISR y vuelve.' : 'La CPU configura origen, destino y tamaño. DMA transfiere el bloque y avisa al final.'}</div></div><div className="io-side"><div className="metric-card"><span className="metric-label">CONSULTAS</span><strong>{queries}</strong><p>{mechanism === 'polling' ? 'busy-wait acumulado' : 'no aplica: espera por evento'}</p></div><div className="metric-card"><span className="metric-label">EVENTOS</span><strong>{events}</strong><p>datos generados por ti</p></div><div className="metric-card"><span className="metric-label">CPU</span><strong className={mechanism === 'polling' ? 'warning' : ''}>{mechanism === 'polling' ? '92' : mechanism === 'interrupt' ? '28' : '8'}<small>%</small></strong><p>{mechanism === 'polling' ? 'ocupada preguntando' : 'libre durante la espera'}</p></div><label className="speed-control">Velocidad <output>{speed.toFixed(1)}x</output><input type="range" min="0.5" max="2.5" step="0.1" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} /></label></div></div><div className="timeline panel">{flowPhases[mechanism].map((item, index) => <div className={phase >= index ? 'timeline-step done' : 'timeline-step'} key={item}><b>{index + 1}</b><span>{item}</span></div>)}</div><SelectExperiment /></section>
}

function SelectExperiment() {
  return <details className="select-experiment"><summary>Experimento real en Linux: polling frente a select()</summary><p><code>select()</code> bloquea el proceso hasta que un descriptor está listo. La web no puede medir el uso real de CPU del sistema operativo.</p><pre>{`# guarda como experimento.py y ejecuta: python3 experimento.py\nimport os, select, time\n\nr, w = os.pipe()\nfor modo in ("polling", "select"):\n    inicio = time.perf_counter(); cpu = time.process_time()\n    if modo == "polling":\n        while not os.read(r, 0):\n            if time.perf_counter() - inicio > 0.2: break\n    else:\n        select.select([r], [], [], 0.2)\n    print(modo, "pared=", time.perf_counter()-inicio, "cpu=", time.process_time()-cpu)`}</pre></details>
}

function CompareModule() {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [events, setEvents] = useState(0)
  const [queries, setQueries] = useState(0)
  const [frequency, setFrequency] = useState(3)
  const [cost, setCost] = useState(15)
  useEffect(() => { if (!running) return undefined; const timer = window.setInterval(() => { setElapsed((value) => value + 0.1); setQueries((value) => value + 10); }, 100); return () => window.clearInterval(timer) }, [running])
  const generate = () => setEvents((value) => value + 1)
  const reset = () => { setRunning(false); setElapsed(0); setEvents(0); setQueries(0) }
  const pollingCpu = Math.min(99, 35 + frequency * 12)
  const interruptCpu = Math.min(90, events * cost / 2)
  return <section><ModuleHeader eyebrow="03 · Actividad transversal" title="Polling vs. interrupciones" description="Mismo dispositivo, misma pantalla y dos formas de esperar. Genera datos y observa cómo cambia el trabajo de la CPU." /><div className="compare-controls panel"><button className="primary-button" onClick={() => setRunning((value) => !value)}>{running ? '❚❚ Pausar' : '▶ Iniciar simulación'}</button><button className="secondary-button" onClick={generate}>⚡ Generar dato</button><button className="reset-button" onClick={reset}>↺ Reiniciar</button><label>frecuencia de eventos <input type="range" min="1" max="6" value={frequency} onChange={(e) => setFrequency(Number(e.target.value))} /></label><label>coste ISR <input type="range" min="5" max="40" value={cost} onChange={(e) => setCost(Number(e.target.value))} /></label></div><div className="dual-sim"><ComparisonLane title="Polling" color="orange" active={running} cpu={pollingCpu} event={events} queries={queries} description="Consulta continuamente el estado." /><ComparisonLane title="Interrupciones" color="blue" active={running && events > 0} cpu={interruptCpu} event={events} queries={0} description="Hace otra tarea y atiende IRQ." /></div><div className="comparison-summary panel"><strong>{events === 0 ? 'Genera un dato para comparar.' : events > 3 && cost > 25 ? 'Con muchos eventos y una ISR cara, la ventaja de interrupciones se reduce.' : 'En este escenario, las interrupciones evitan la espera activa.'}</strong><span>tiempo: {elapsed.toFixed(1)} s · eventos: {events} · consultas polling: {queries}</span><div className="metric-bars"><i style={{ width: `${pollingCpu}%` }}><b>Polling {pollingCpu}% CPU</b></i><i style={{ width: `${Math.max(3, interruptCpu)}%` }}><b>IRQ {interruptCpu.toFixed(0)}% CPU</b></i></div></div></section>
}

function ComparisonLane({ title, color, active, cpu, event, queries, description }) { return <article className={`comparison-lane ${color}`}><div className="lane-heading"><h3>{title}</h3><span className={active ? 'live' : ''}>{active ? '● ejecutando' : '○ en espera'}</span></div><div className="lane-screen"><div className="lane-cpu"><span>CPU</span><strong>{active ? (event ? 'atiende' : 'trabaja') : 'lista'}</strong></div><div className="lane-device"><span>▣</span><small>{event ? 'dato listo' : 'sin dato'}</small></div><div className="lane-line"><i className={active ? 'lane-packet' : ''} /></div></div><p>{description}</p><div className="lane-stats"><span>CPU <b>{cpu.toFixed(0)}%</b></span><span>consultas <b>{queries}</b></span><span>eventos <b>{event}</b></span></div></article> }

function DmaModule() {
  const [variant, setVariant] = useState('cycle')
  const [mastering, setMastering] = useState(true)
  const [size, setSize] = useState(64)
  const [speed, setSpeed] = useState(2)
  const [busTime, setBusTime] = useState(20)
  const [pending, setPending] = useState(1)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  useEffect(() => { if (!running) return undefined; const timer = window.setInterval(() => setProgress((value) => { const next = value + speed * (variant === 'burst' ? 2 : 1) * (mastering ? 1 : .7); if (next >= 100) { setRunning(false); return 100 } return next }), 90); return () => window.clearInterval(timer) }, [running, speed, variant, mastering])
  const transferred = Math.round(size * progress / 100)
  return <section><ModuleHeader eyebrow="04 · Direct Memory Access" title="DMA: mueve datos sin copiar palabra a palabra" description="Configura el controlador, elige cómo usa el bus y observa qué queda libre para la CPU." /><div className="dma-controls panel"><div className="segmented"><button className={variant === 'cycle' ? 'active cyan' : ''} onClick={() => { setVariant('cycle'); setProgress(0) }}>Cycle stealing</button><button className={variant === 'burst' ? 'active cyan' : ''} onClick={() => { setVariant('burst'); setProgress(0) }}>Burst mode</button></div><label>bloque <input type="range" min="16" max="256" step="16" value={size} onChange={(e) => setSize(Number(e.target.value))} /><b>{size} KB</b></label><label>velocidad <input type="range" min="1" max="5" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} /><b>{speed}x</b></label><label>acceso al bus <input type="range" min="5" max="50" value={busTime} onChange={(e) => setBusTime(Number(e.target.value))} /><b>{busTime} ms</b></label><label className="toggle"><input type="checkbox" checked={mastering} onChange={(e) => setMastering(e.target.checked)} /><span /> bus mastering</label><label>datos pendientes <input type="number" min="1" max="9" value={pending} onChange={(e) => setPending(Number(e.target.value) || 1)} /></label><button className="primary-button" onClick={() => { setProgress(progress >= 100 ? 0 : progress); setRunning(true) }}>{running ? 'Transfiriendo...' : progress >= 100 ? 'Repetir bloque' : 'Iniciar DMA'}</button></div><div className="dma-stage panel"><div className="dma-flow"><DmaBox title="Dispositivo" icon="▣" /><span className="flow-arrow">→</span><DmaBox title="Controlador DMA" icon="⇄" active={running || progress === 100} /><span className="flow-arrow">→</span><DmaBox title="RAM" icon="▤" active={progress === 100} /></div><div className="dma-progress"><div><span>{variant === 'cycle' ? 'Ciclos intercalados' : 'Ráfaga continua'}</span><strong>{Math.round(progress)}%</strong></div><div className="progress-track"><i style={{ width: `${progress}%` }} /></div><small>{transferred} de {size} KB · {mastering ? 'bus concedido al dispositivo' : 'DMA espera arbitraje'} · {pending} cola(s) pendiente(s)</small></div><div className="cycle-visual">{Array.from({ length: 16 }, (_, index) => <i key={index} className={variant === 'burst' ? index > 2 && index < 13 && progress > 10 ? 'dma' : '' : index % 3 === 2 && progress > index * 5 ? 'dma' : ''} />)}</div></div><div className="two-columns"><div className="info-card"><h3>CPU durante la transferencia</h3><p>{progress > 0 && progress < 100 ? 'Puede ejecutar otras tareas, aunque comparte memoria y ancho de banda.' : 'Configura y recibe una interrupción final.'}</p></div><div className="info-card"><h3>Idea clave</h3><p>{variant === 'cycle' ? 'Cycle stealing reduce el bloqueo de la CPU, pero tarda más en completar el bloque.' : 'Burst mode acelera el bloque, pero puede dejar a la CPU sin bus durante la ráfaga.'}</p></div></div></section>
}

function DmaBox({ title, icon, active }) { return <div className={`dma-box ${active ? 'active' : ''}`}><span>{icon}</span><strong>{title}</strong><small>{active ? 'activo' : 'esperando'}</small></div> }

function MmioModule() {
  const [mode, setMode] = useState('mmio')
  const [selected, setSelected] = useState(0)
  const [answer, setAnswer] = useState(null)
  const registers = [{ name: 'Registro de estado', address: '0xF000_0020', purpose: 'Indica READY / BUSY', operation: 'lectura' }, { name: 'Registro de control', address: '0xF000_0024', purpose: 'Inicia o configura el dispositivo', operation: 'escritura' }, { name: 'Registro de datos', address: '0xF000_0028', purpose: 'Contiene el carácter recibido', operation: 'lectura / escritura' }]
  const isMmio = mode === 'mmio'
  return <section><ModuleHeader eyebrow="05 · Registros de E/S" title="MMIO frente a PMIO" description="Haz clic en los registros y cambia el mapa para ver cómo la CPU accede al mismo controlador de dos formas conceptuales." /><div className="mode-switch"><button className={isMmio ? 'selected blue' : ''} onClick={() => setMode('mmio')}>MMIO · dirección de memoria</button><button className={!isMmio ? 'selected orange' : ''} onClick={() => setMode('pmio')}>PMIO · puerto de E/S</button></div><div className="mmio-layout"><div className="address-map panel"><div className="map-caption">{isMmio ? 'ESPACIO DE MEMORIA' : 'ESPACIO DE PUERTOS'}</div><div className="cpu-label">CPU <span>lee / escribe</span></div><div className="address-line" />{registers.map((register, index) => <button key={register.name} className={selected === index ? 'register-card selected' : 'register-card'} onClick={() => setSelected(index)}><b>{isMmio ? register.address : `0x${index + 3}F8`}</b><span>{register.name}</span></button>)}<div className="map-footer">{isMmio ? 'load / store' : 'IN / OUT'}</div></div><div className="register-detail panel"><span className={`big-icon ${isMmio ? 'blue' : 'orange'}`}>{isMmio ? '↔' : '⇥'}</span><p className="eyebrow">REGISTRO SELECCIONADO</p><h3>{registers[selected].name}</h3><strong>{isMmio ? registers[selected].address : `Puerto ${selected + 3}F8`}</strong><p>{registers[selected].purpose}. Operación ilustrativa: <b>{registers[selected].operation}</b>.</p><div className="detail-note">Las direcciones son ejemplos visuales, no direcciones reales de hardware.</div></div></div><div className="mini-exercise panel"><div><p className="eyebrow">EJERCICIO RÁPIDO</p><h3>Un controlador moderno asigna sus registros dentro del mapa de memoria. ¿MMIO o PMIO?</h3></div><div className="exercise-actions"><button onClick={() => setAnswer('MMIO')}>MMIO</button><button onClick={() => setAnswer('PMIO')}>PMIO</button>{answer && <strong className={answer === 'MMIO' ? 'correct' : 'wrong'}>{answer === 'MMIO' ? '✓ Correcto' : '✕ Revisa: usa direcciones de memoria'}</strong>}</div></div></section>
}

function QuizModule() {
  const questions = [{ q: '¿Qué mide principalmente la latencia?', options: ['Datos por segundo', 'Tiempo hasta que llega el primer dato', 'Capacidad total'], correct: 1, why: 'Latencia es el tiempo de espera inicial.' }, { q: '¿Qué mecanismo deja libre a la CPU durante un bloque grande?', options: ['Polling', 'Interrupción por palabra', 'DMA'], correct: 2, why: 'DMA transfiere el bloque con una intervención mínima de la CPU.' }, { q: '¿Qué ocurre en un busy-wait?', options: ['La CPU duerme', 'La CPU comprueba repetidamente el estado', 'El DMA toma el bus'], correct: 1, why: 'Polling mantiene a la CPU preguntando mientras espera.' }, { q: '¿Qué es una ISR?', options: ['Una rutina que atiende una interrupción', 'Una memoria rápida', 'Un tipo de puerto'], correct: 0, why: 'ISR significa Interrupt Service Routine.' }]
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answer, setAnswer] = useState(null)
  const question = questions[index]
  const choose = (option) => { if (answer !== null) return; setAnswer(option); if (option === question.correct) setScore((value) => value + 1) }
  const next = () => { setAnswer(null); setIndex((value) => (value + 1) % questions.length) }
  return <section><ModuleHeader eyebrow="06 · Pon a prueba tus conocimientos" title="Reto final" description="Responde, recibe una explicación inmediata y vuelve a intentarlo. La puntuación acompaña el aprendizaje, no lo sustituye." /><div className="quiz-card panel"><div className="quiz-top"><span>Pregunta {index + 1} de {questions.length}</span><strong>{score} aciertos</strong></div><div className="quiz-progress"><i style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div><h3>{question.q}</h3><div className="quiz-options">{question.options.map((option, optionIndex) => <button key={option} className={answer === optionIndex ? optionIndex === question.correct ? 'correct' : 'wrong' : ''} onClick={() => choose(optionIndex)}>{option}</button>)}</div>{answer !== null && <div className={answer === question.correct ? 'answer-note correct' : 'answer-note wrong'}>{answer === question.correct ? 'Correcto. ' : 'No exactamente. '}{question.why}</div>}<button className="primary-button quiz-next" onClick={next}>{index === questions.length - 1 ? 'Repetir cuestionario' : 'Siguiente pregunta →'}</button></div></section>
}

export default App
