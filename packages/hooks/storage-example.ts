import { initStorage, postgres, turso, local, getAdapter } from './src/storage'

async function examplePostgres() {
  await initStorage(postgres(process.env.DATABASE_URL!))
  
  const adapter = getAdapter()
  
  await adapter.insertEvent({
    id: '1',
    timestamp: Date.now(),
    sessionId: 'sess-123',
    url: '/home',
    event: 'pageview'
  })
  
  const metrics = await adapter.queryMetrics(
    new Date('2025-01-01'),
    new Date('2025-12-31')
  )
  
  console.log(metrics)
}

async function exampleTurso() {
  await initStorage(turso(
    process.env.TURSO_URL!,
    process.env.TURSO_TOKEN!
  ))
  
  const adapter = getAdapter()
  
  await adapter.insertEvent({
    id: '2',
    timestamp: Date.now(),
    sessionId: 'sess-456',
    url: '/about',
    event: 'pageview'
  })
}

async function exampleLocal() {
  await initStorage(local())
  
  const adapter = getAdapter()
  
  await adapter.insertEvent({
    id: '3',
    timestamp: Date.now(),
    sessionId: 'sess-789',
    url: '/contact',
    event: 'pageview',
    meta: { source: 'google' }
  })
  
  const events = await adapter.queryEvents({
    start: new Date('2025-01-01'),
    end: new Date('2025-12-31'),
    event: 'pageview'
  })
  
  console.log(events)
}
