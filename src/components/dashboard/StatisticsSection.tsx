import { useMemo, useState } from 'react'
import type { DashboardStatsDoublyLinkedList } from '../../lib/dashboardStats'

type StatisticsSectionProps = {
  statsLinkedList: DashboardStatsDoublyLinkedList
}

type ChartView = 'bar' | 'pie'

function getFriendlySummary(label: string) {
  if (label === 'Sesiones de estudio completadas') {
    return 'Aqui ves cuantas sesiones de estudio terminaste de principio a fin.'
  }

  if (label === 'Entrevistas realizadas') {
    return 'Este numero te muestra cuantas entrevistas ya completaste en la plataforma.'
  }

  if (label === 'Inicios de sesion y practica') {
    return 'Este dato refleja los dias en los que entraste a tu cuenta para practicar.'
  }

  return 'Este valor resume tu actividad reciente en esta seccion.'
}

function StatisticsSection({ statsLinkedList }: StatisticsSectionProps) {
  const [chartView, setChartView] = useState<ChartView>('bar')

  const stats = useMemo(() => statsLinkedList.toArray(), [statsLinkedList])
  const linkedStats = useMemo(() => statsLinkedList.toLinkedArray(), [statsLinkedList])

  const highestValue = useMemo(
    () => stats.reduce((maxValue, stat) => Math.max(maxValue, stat.value), 0),
    [stats],
  )

  const totalValue = useMemo(
    () => stats.reduce((accumulator, stat) => accumulator + stat.value, 0),
    [stats],
  )

  const pieBackground = useMemo(() => {
    if (!stats.length || totalValue <= 0) {
      return 'conic-gradient(#e5e7eb 0deg 360deg)'
    }

    let angleAccumulator = 0
    const slices = stats.map((stat) => {
      const angle = (stat.value / totalValue) * 360
      const startAngle = angleAccumulator
      const endAngle = startAngle + angle
      angleAccumulator = endAngle
      return `${stat.color} ${startAngle}deg ${endAngle}deg`
    })

    return `conic-gradient(${slices.join(', ')})`
  }, [stats, totalValue])

  return (
    <section className="mt-10 rounded-2xl border border-zinc-300 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Estadisticas</p>
          <h2 className="mt-1 font-serif text-3xl font-normal tracking-[-0.02em] text-zinc-900">
            Rendimiento personal
          </h2>
        </div>

        <div className="inline-flex rounded-full border border-zinc-300 bg-zinc-100 p-1">
          <button
            type="button"
            onClick={() => setChartView('bar')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              chartView === 'bar' ? 'bg-blue-600 text-white' : 'text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Barras
          </button>
          <button
            type="button"
            onClick={() => setChartView('pie')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              chartView === 'pie' ? 'bg-red-600 text-white' : 'text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Pastel
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          {chartView === 'bar' ? (
            <div className="h-72">
              <div className="flex h-60 items-end justify-around gap-3">
                {stats.map((stat) => {
                  const heightPercentage = highestValue > 0 ? Math.max(10, (stat.value / highestValue) * 100) : 10

                  return (
                    <div key={stat.key} className="flex w-full max-w-32 flex-col items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-700">{stat.value}</span>
                      <div className="flex h-44 w-full items-end justify-center rounded-xl bg-zinc-100 p-2">
                        <div
                          className="w-10 rounded-md transition-all"
                          style={{
                            height: `${heightPercentage}%`,
                            backgroundColor: stat.color,
                          }}
                        />
                      </div>
                      <p className="text-center text-xs text-zinc-600">{stat.label}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center">
              <div className="relative">
                <div
                  className="h-52 w-52 rounded-full border border-zinc-200"
                  style={{ background: pieBackground }}
                />
                <div className="absolute inset-0 m-auto flex h-24 w-24 items-center justify-center rounded-full border border-zinc-200 bg-white text-center">
                  <span className="text-sm font-semibold text-zinc-700">{totalValue}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-2">
            {stats.map((stat) => (
              <div key={`legend-${stat.key}`} className="flex items-center gap-2 text-sm text-zinc-700">
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: stat.color }} />
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-xl border border-zinc-200 bg-white p-4">
          <h3 className="font-serif text-2xl text-zinc-900">Resumen</h3>
          <p className="mt-1 text-sm text-zinc-600">
            Aqui tienes una explicacion simple de cada estadistica para entender tu avance rapido.
          </p>

          <div className="mt-4 space-y-3">
            {linkedStats.map((node) => (
              <article key={`node-${node.key}`} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm">
                <p className="font-semibold text-zinc-800">{node.label}</p>
                <p className="text-zinc-600">{getFriendlySummary(node.label)}</p>
                <p className="mt-1 text-zinc-700">Total actual: {node.value}</p>
                <p className="text-zinc-500">Antes de esta metrica: {node.previousLabel ?? 'No aplica'}</p>
                <p className="text-zinc-500">Despues de esta metrica: {node.nextLabel ?? 'No aplica'}</p>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}

export default StatisticsSection