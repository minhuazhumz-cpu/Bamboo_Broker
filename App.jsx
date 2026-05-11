import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  HelpCircle,
  Leaf,
  RotateCcw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

const SEASON_TARGET = 1000
const ANNUAL_TARGET = 4000
const TARGET = SEASON_TARGET
const TIME_CREDITS = 3
const PRESSURE_MS = 5000

const customerProfiles = [
  { id: 'bistro', name: 'Bamboo Bistro', panda: 'Chef Bao', icon: '👨‍🍳🐼' },
  { id: 'mart', name: 'GroveMart', panda: 'Buyer Mei', icon: '🛒🐼' },
  { id: 'zoo', name: 'Jade Export', panda: 'Trader Tao', icon: '🚢📦🐼' },
]

const seasons = [
  {
    name: 'Spring',
    emoji: '🌱',
    note: 'A clean start. Learn the customer signals and decide what management needs to know.',
    customers: [
      { id: 'bistro', type: 'Opportunity', amount: 100, likelihood: 80, happens: true, vague: 'A banquet may create extra bamboo demand.' },
      { id: 'mart', type: 'Opportunity', amount: 80, likelihood: 60, happens: true, vague: 'A display expansion is possible, but traffic is uncertain.' },
      { id: 'zoo', type: 'Risk', amount: 45, likelihood: 45, happens: true, vague: 'A small export paperwork delay could reduce orders.' },
    ],
  },
  {
    name: 'Summer',
    emoji: '🔥',
    note: 'Risk season. Heat stress creates pressure and the quiz recovery will follow this close.',
    customers: [
      { id: 'bistro', type: 'Risk', amount: 240, likelihood: 85, happens: true, vague: 'Kitchen traffic may collapse during the heat wave.' },
      { id: 'mart', type: 'Risk', amount: 210, likelihood: 75, happens: true, vague: 'Retail buyers are considering an inventory pullback.' },
      { id: 'zoo', type: 'Opportunity', amount: 90, likelihood: 60, happens: true, vague: 'A summer shipping window could lift export demand.' },
    ],
  },
  {
    name: 'Fall',
    emoji: '🍂',
    note: 'Recovery season. A Heart can convert one Risk into an Opportunity before you decide.',
    customers: [
      { id: 'bistro', type: 'Opportunity', amount: 140, likelihood: 70, happens: true, vague: 'A harvest tasting menu may need extra bamboo.' },
      { id: 'mart', type: 'Risk', amount: 220, likelihood: 75, happens: true, vague: 'Margin pressure may force a major seasonal cut.' },
      { id: 'zoo', type: 'Risk', amount: 180, likelihood: 70, happens: true, vague: 'A port clearance delay is likely to hit orders.' },
    ],
  },
  {
    name: 'Winter',
    emoji: '❄️',
    note: 'Final review season. Clean reporting protects trust and unlocks the best landing.',
    customers: [
      { id: 'bistro', type: 'Opportunity', amount: 220, likelihood: 85, happens: true, vague: 'Holiday banquets could become a major win.' },
      { id: 'mart', type: 'Opportunity', amount: 130, likelihood: 50, happens: false, vague: 'A holiday endcap is possible but shoppers are unpredictable.' },
      { id: 'zoo', type: 'Opportunity', amount: 160, likelihood: 75, happens: true, vague: 'Winter export buyers may drive a strong order.' },
    ],
  },
]

const quizQuestions = [
  {
    question: 'Why are triploid watermelons seedless?',
    answer: 'B) 3n chromosomes',
    options: ['A) GMOs', 'B) 3n chromosomes', 'C) Dark growth'],
  },
  {
    question: 'What is the primary benefit of "Pelleted" seeds?',
    answer: 'B) Easier planting',
    options: ['A) Faster growth', 'B) Easier planting', 'C) Pest resistance'],
  },
  {
    question: 'Which part of the plant becomes the "Seed"?',
    answer: 'A) Ovule',
    options: ['A) Ovule', 'B) Stigma', 'C) Pollen'],
  },
  {
    question: 'What is "Vernalization"?',
    answer: 'B) Cold treatment',
    options: ['A) Sun exposure', 'B) Cold treatment', 'C) Water absorption'],
  },
]

function randomQuizQuestion() {
  return quizQuestions[Math.floor(Math.random() * quizQuestions.length)]
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function stalks(value) {
  return `${Math.round(value).toLocaleString()} stalks`
}

function signedStalks(value) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${Math.abs(Math.round(value)).toLocaleString()} stalks`
}

function makeSeasonCustomers(index) {
  const season = seasons[index]
  return customerProfiles.map((profile) => {
    const script = season.customers.find((customer) => customer.id === profile.id)
    return {
      ...profile,
      ...script,
      visited: false,
      teaShared: false,
      decision: null,
      reportedPercent: 0,
      reportedAmount: 0,
      hearted: false,
    }
  })
}

function forecastFrom(customers) {
  return TARGET + customers.reduce((sum, customer) => sum + customer.reportedAmount, 0)
}

function calculateFinalOutcome({ totalStalksSold, totalTrust, totalWaste, totalStockouts }) {
  if (totalStalksSold > ANNUAL_TARGET && totalTrust === 100 && totalWaste === 0 && totalStockouts === 0) {
    return {
      title: 'The Bamboo Oracle',
      emoji: '🔮🎋🐼',
      tone: 'emerald',
      feedback: "Total harmony achieved. You didn't just manage the forest; you mastered it. With perfect foresight, you aligned every customer need with the supply chain's heartbeat. By delivering above-target growth with zero waste and unbreakable trust, you have become the ultimate bridge between the field and the harvest. All Pandas bow to your wisdom.",
    }
  }

  if (totalStalksSold >= ANNUAL_TARGET && totalTrust >= 80) {
    return {
      title: 'The Strategic Partner',
      emoji: '🌲🤝🐼',
      tone: 'emerald',
      feedback: 'You are a master of the forest. I always knew exactly what to expect. Because you warned me early, we survived the drought and capitalized on the harvest.',
    }
  }
  if (totalStalksSold < ANNUAL_TARGET * 0.9 && totalTrust < 50) {
    return {
      title: 'The Silent Failure',
      emoji: '🔥🐼',
      tone: 'red',
      feedback: 'Total disaster. You watched the forest burn and told me it was fine. We missed our target because you lacked the courage to report the truth.',
    }
  }
  if (totalStalksSold >= ANNUAL_TARGET && totalTrust < 50) {
    return {
      title: 'The Lucky Gambler',
      emoji: '🎲🐼',
      tone: 'amber',
      feedback: 'We hit the target, but at what cost? My warehouse is full of rotting bamboo because you promised sales that never happened.',
    }
  }
  if (totalStalksSold < ANNUAL_TARGET && totalStockouts > 100) {
    return {
      title: 'The Sandbagger',
      emoji: '📉🐼',
      tone: 'orange',
      feedback: "You were so afraid of failing that you forgot to win. The customers wanted our bamboo, but we weren't ready because you kept the upside a secret.",
    }
  }
  return totalStalksSold >= ANNUAL_TARGET
    ? {
      title: 'The Lucky Gambler',
      emoji: '🎲🐼',
      tone: 'amber',
      feedback: 'We hit the target, but at what cost? My warehouse is full of rotting bamboo because you promised sales that never happened.',
    }
    : {
      title: 'The Sandbagger',
      emoji: '📉🐼',
      tone: 'orange',
      feedback: "You were so afraid of failing that you forgot to win. The customers wanted our bamboo, but we weren't ready because you kept the upside a secret.",
    }
}

function reportImpact(customer, percent) {
  const amount = Math.round(customer.amount * (percent / 100))
  return customer.type === 'Opportunity' ? amount : -amount
}

function pressureText(forecast) {
  return `GAP CLOSURE PLAN REQUIRED — forecast is ${stalks(forecast)}, below the 1,000 Stalk target.`
}

function shouldTriggerGapClosure(result) {
  if (!result) return false
  const reportedAnySignal = result.customers.some((customer) => customer.reportedAmount !== 0)
  if (!reportedAnySignal) return false

  const unreportedRealizedRisk = result.customers.some((customer) => (
    customer.type === 'Risk' && customer.actualAmount > 0 && customer.reportedAmount === 0
  ))

  return result.sold < SEASON_TARGET || unreportedRealizedRisk
}

function calculateRelationshipEquity(currentTrust, resolvedCustomers) {
  const seasonTrustBudget = 100 / seasons.length
  const customerTrustBudget = seasonTrustBudget / Math.max(resolvedCustomers.length, 1)
  const allHidden = resolvedCustomers.every((customer) => customer.decision === 'hidden')
  if (allHidden) {
    const nextTrust = clamp(currentTrust - seasonTrustBudget, 0, 100)
    return { nextTrust, trustDelta: nextTrust - currentTrust }
  }

  const penalty = resolvedCustomers.reduce((sum, customer) => {
    if (customer.decision === 'hidden') {
      return sum + customerTrustBudget
    }

    if (customer.decision === 'tea') {
      const likelihoodChange = Math.abs(customer.likelihood - customer.reportedPercent) / 100
      const riskPanicMultiplier = customer.type === 'Risk' && customer.reportedPercent > customer.likelihood ? 1.1 : 0.6
      return sum + customerTrustBudget * riskPanicMultiplier * likelihoodChange
    }

    if (customer.decision === 'full') {
      const likelihoodChange = Math.abs(100 - customer.likelihood) / 100
      return sum + customerTrustBudget * 0.45 * likelihoodChange
    }

    return sum
  }, 0)

  const nextTrust = clamp(currentTrust - penalty, 0, 100)
  return { nextTrust, trustDelta: nextTrust - currentTrust }
}

export default function App() {
  const [seasonIndex, setSeasonIndex] = useState(0)
  const [customers, setCustomers] = useState(() => makeSeasonCustomers(0))
  const [forecast, setForecast] = useState(TARGET)
  const [timeCredits, setTimeCredits] = useState(TIME_CREDITS)
  const [decisionCustomerId, setDecisionCustomerId] = useState(null)
  const [deepDiveId, setDeepDiveId] = useState(null)
  const [pressure, setPressure] = useState(null)
  const [seasonResult, setSeasonResult] = useState(null)
  const [managerPromptOpen, setManagerPromptOpen] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizMessage, setQuizMessage] = useState('')
  const [currentQuiz, setCurrentQuiz] = useState(() => randomQuizQuestion())
  const [quizAwarded, setQuizAwarded] = useState(false)
  const [hearts, setHearts] = useState(0)
  const [history, setHistory] = useState([])
  const [performance, setPerformance] = useState({ totalStalksSold: 0, totalTrust: 100, totalWaste: 0, totalStockouts: 0 })
  const [reviewOpen, setReviewOpen] = useState(false)

  const season = seasons[seasonIndex]
  const decisionCustomer = customers.find((customer) => customer.id === decisionCustomerId)
  const deepDiveCustomer = customers.find((customer) => customer.id === deepDiveId)
  const decidedCount = customers.filter((customer) => customer.decision).length
  const canClose = decidedCount === customers.length && !seasonResult

  const reportedOpportunities = useMemo(
    () => customers.reduce((sum, customer) => sum + Math.max(customer.reportedAmount, 0), 0),
    [customers],
  )
  const reportedRisks = useMemo(
    () => customers.reduce((sum, customer) => sum + Math.abs(Math.min(customer.reportedAmount, 0)), 0),
    [customers],
  )

  useEffect(() => {
    if (!pressure) return undefined
    const timer = window.setTimeout(() => setPressure(null), PRESSURE_MS)
    return () => window.clearTimeout(timer)
  }, [pressure])

  function applyForecast(nextCustomers, label, triggerPressure = false) {
    const nextForecast = forecastFrom(nextCustomers)
    setForecast(nextForecast)
    if (triggerPressure && nextForecast < TARGET) {
      setPressure({ id: Date.now(), message: pressureText(nextForecast) })
    }
  }

  function visitCustomer(id) {
    setCustomers((current) => current.map((customer) => customer.id === id ? { ...customer, visited: true } : customer))
    setDecisionCustomerId(id)
    setDeepDiveId(null)
  }

  function reportFull(customer) {
    const reportedAmount = reportImpact(customer, 100)
    const nextCustomers = customers.map((item) => item.id === customer.id
      ? { ...item, decision: 'full', reportedPercent: 100, reportedAmount }
      : item)
    setCustomers(nextCustomers)
    setDecisionCustomerId(null)
    setDeepDiveId(null)
    applyForecast(nextCustomers, `${customer.name}: reported in full`, customer.type === 'Risk')
  }

  function dontReport(customer) {
    const nextCustomers = customers.map((item) => item.id === customer.id
      ? { ...item, decision: 'hidden', reportedPercent: 0, reportedAmount: 0 }
      : item)
    setCustomers(nextCustomers)
    setDecisionCustomerId(null)
    setDeepDiveId(null)
    applyForecast(nextCustomers, `${customer.name}: not reported`, false)
  }

  function shareTea(customer) {
    setTimeCredits((value) => Math.max(value - 1, 0))
    setCustomers((current) => current.map((item) => item.id === customer.id ? { ...item, teaShared: true } : item))
    setDeepDiveId(customer.id)
  }

  function reportLikelihood(customer, percent) {
    const reportedAmount = reportImpact(customer, percent)
    const nextCustomers = customers.map((item) => item.id === customer.id
      ? { ...item, decision: 'tea', teaShared: true, reportedPercent: percent, reportedAmount }
      : item)
    setCustomers(nextCustomers)
    setDecisionCustomerId(null)
    setDeepDiveId(null)
    applyForecast(nextCustomers, `${customer.name}: reported ${percent}% likelihood after Tea`, customer.type === 'Risk')
  }

  function useHeart(id) {
    if (hearts <= 0) return
    const target = customers.find((customer) => customer.id === id)
    if (!target || !target.visited || target.decision || target.type !== 'Risk') return
    setCustomers((current) => current.map((customer) => customer.id === id
      ? {
        ...customer,
        type: 'Opportunity',
        likelihood: Math.max(customer.likelihood, 70),
        happens: true,
        vague: 'Recovery Heart repaired the relationship. This is now a potential Opportunity.',
        hearted: true,
      }
      : customer))
    setHearts((value) => value - 1)
  }

  function closeSeason() {
    let sold = 0
    let riskLoss = 0
    let waste = 0
    let stockouts = 0
    let trustDelta = 0

    const resolved = customers.map((customer) => {
      const actualAmount = customer.decision === 'tea'
        ? Math.round(customer.amount * (customer.likelihood / 100))
        : customer.happens ? customer.amount : 0
      const reportedAbs = Math.abs(customer.reportedAmount)
      const markedUpTeaReport = customer.decision === 'tea' && customer.reportedPercent > customer.likelihood
      const accurateTeaReport = customer.decision === 'tea' && customer.reportedPercent === customer.likelihood
      let outcome = 'Happy Panda'
      let feedback = 'Clean execution. Management understood the signal and the customer outcome.'
      let customerSold = 0
      let customerWaste = 0
      let customerStockout = 0

      if (customer.type === 'Opportunity') {
        if (customer.decision === 'hidden') {
          outcome = 'Supply Panda'
          feedback = "NO STOCK! You didn't request harvest, so I have nothing to ship. (0 stalks gained)."
          customerStockout = customer.happens ? customer.amount : 0
          trustDelta -= customer.happens ? 22 : 4
        } else if (customer.decision === 'full' && !customer.happens) {
          outcome = 'Skeptical Elder Panda'
          feedback = "Skeptical! You promised me a win that didn't happen."
          customerWaste = customer.amount
          trustDelta -= 18
        } else if (actualAmount > 0) {
          customerSold = Math.min(actualAmount, reportedAbs)
          customerStockout = Math.max(actualAmount - reportedAbs, 0)
          customerWaste = Math.max(reportedAbs - actualAmount, 0)
          if (!accurateTeaReport) {
            trustDelta -= customerStockout === 0 && customerWaste === 0 ? 4 : 8
          }
          if (customerStockout > 0) {
            outcome = 'Supply Panda'
            feedback = `Partial stock-out. Demand was ${stalks(actualAmount)}, but harvest was planned for ${stalks(reportedAbs)}.`
          } else if (customerWaste > 0) {
            outcome = 'Excess Inventory Panda'
            feedback = `You secured too much inventory. Demand was ${stalks(actualAmount)}, but harvest was planned for ${stalks(reportedAbs)}, leaving ${stalks(customerWaste)} of excess inventory.`
          }
        } else {
          customerWaste = reportedAbs
          trustDelta -= customerWaste > 0 ? 10 : 0
        }
      }

      if (customer.type === 'Risk') {
        riskLoss += actualAmount
        if (customer.decision === 'hidden' && actualAmount > 0) {
          outcome = 'Skeptical Elder Panda'
          feedback = 'DISASTER! Why was I not warned of this risk? (Major Trust Penalty).'
          trustDelta -= 28
        } else if (customer.decision === 'full' && actualAmount === 0) {
          outcome = 'Skeptical Elder Panda'
          feedback = "Skeptical! You promised me a win that didn't happen."
          customerWaste = customer.amount
          trustDelta -= 14
        } else if (actualAmount > 0) {
          if (!accurateTeaReport) {
            trustDelta -= customer.decision === 'tea' ? 10 : 8
          }
        } else {
          customerWaste = reportedAbs
          trustDelta -= reportedAbs > 0 ? 6 : 0
        }
      }

      if (markedUpTeaReport && feedback === 'Clean execution. Management understood the signal and the customer outcome.') {
        outcome = 'Excess Inventory Panda'
        feedback = `The extra 5% markup built excess inventory into the plan. Actual signal was ${stalks(actualAmount)}, but the forecast carried ${stalks(reportedAbs)}.`
      }

      sold += customerSold
      waste += customerWaste
      stockouts += customerStockout

      return { ...customer, outcome, feedback, sold: customerSold, waste: customerWaste, stockout: customerStockout, actualAmount }
    })

    const seasonSold = Math.max(SEASON_TARGET + sold - riskLoss, 0)
    const relationshipEquity = calculateRelationshipEquity(performance.totalTrust, resolved)
    trustDelta = relationshipEquity.trustDelta

    const nextPerformance = {
      totalStalksSold: performance.totalStalksSold + seasonSold,
      totalTrust: relationshipEquity.nextTrust,
      totalWaste: performance.totalWaste + waste,
      totalStockouts: performance.totalStockouts + stockouts,
    }
    const snapshot = {
      season: season.name,
      emoji: season.emoji,
      forecast,
      sold: seasonSold,
      upsideSold: sold,
      riskLoss,
      waste,
      stockouts,
      trustDelta,
      customers: resolved,
    }

    setCustomers(resolved)
    setPerformance(nextPerformance)
    setHistory((current) => [...current, snapshot])
    setSeasonResult(snapshot)
  }

  function continueAfterSeason() {
    const gapClosureEligibleSeason = season.name === 'Summer' || season.name === 'Fall'
    const needsGapClosure = gapClosureEligibleSeason && shouldTriggerGapClosure(seasonResult)
    setSeasonResult(null)
    if (seasonIndex === seasons.length - 1) {
      setReviewOpen(true)
      return
    }

    const nextIndex = seasonIndex + 1
    setSeasonIndex(nextIndex)
    setCustomers(makeSeasonCustomers(nextIndex))
    setForecast(TARGET)
    setTimeCredits(TIME_CREDITS)
    setDecisionCustomerId(null)
    setDeepDiveId(null)

    if (needsGapClosure && !quizAwarded) {
      setCurrentQuiz(randomQuizQuestion())
      setManagerPromptOpen(true)
      setQuizMessage('Manager Panda needs a gap-closure plan. Work hard on the quiz to find one recovery opportunity.')
    }
  }

  function answerQuiz(answer) {
    if (answer === currentQuiz.answer) {
      setHearts((value) => value + 1)
      setQuizAwarded(true)
      setQuizMessage('Correct! You earned 1 Heart to convert a Risk into an Opportunity.')
      window.setTimeout(() => {
        setQuizOpen(false)
        setQuizMessage('')
      }, 850)
    } else {
      setQuizMessage('Not quite. Keep clicking until you get it right.')
    }
  }

  function resetYear() {
    setSeasonIndex(0)
    setCustomers(makeSeasonCustomers(0))
    setForecast(TARGET)
    setTimeCredits(TIME_CREDITS)
    setDecisionCustomerId(null)
    setDeepDiveId(null)
    setPressure(null)
    setSeasonResult(null)
    setManagerPromptOpen(false)
    setQuizOpen(false)
    setQuizMessage('')
    setCurrentQuiz(randomQuizQuestion())
    setQuizAwarded(false)
    setHearts(0)
    setHistory([])
    setPerformance({ totalStalksSold: 0, totalTrust: 100, totalWaste: 0, totalStockouts: 0 })
    setReviewOpen(false)
  }

  return (
    <main className="min-h-screen bg-white text-slate-950 botanical-bg">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="rounded-[1.5rem] border border-emerald-100 bg-white/90 p-3 shadow-soft backdrop-blur sm:p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_22rem] lg:items-start">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950 text-2xl shadow-lg">🐼</div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-emerald-700">Strategic Forecast Simulator</p>
                <h1 className="text-3xl font-black leading-none sm:text-4xl">Bamboo Broker</h1>
                <p className="mt-1 max-w-2xl text-sm font-semibold text-slate-600 sm:text-base">Master the harvest as a Bamboo Broker. Communicate risks and opportunities, secure your stock, and achieve your sales target!</p>
              </div>
            </div>
            <GuideCard compact />
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1fr_22rem]">
          <div className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-soft">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-slate-400">Season {seasonIndex + 1} of 4</p>
                <h2 className="mt-1 text-4xl font-black">{season.emoji} {season.name}</h2>
                <p className="mt-1 max-w-3xl font-semibold text-slate-600">{season.note}</p>
              </div>
              <button onClick={closeSeason} disabled={!canClose} className="rounded-2xl bg-slate-950 px-6 py-4 font-black text-white transition hover:bg-emerald-700 disabled:bg-slate-300">
                Close Season
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {customers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  hearts={hearts}
                  onVisit={() => visitCustomer(customer.id)}
                />
              ))}
            </div>
          </div>

          <aside className="space-y-5">
            <Ledger history={history} performance={performance} forecast={forecast} opportunities={reportedOpportunities} risks={reportedRisks} />
          </aside>
        </section>
      </div>

      {decisionCustomer && (
        <DecisionModal
          customer={decisionCustomer}
          timeCredits={timeCredits}
          hearts={hearts}
          onFull={() => reportFull(decisionCustomer)}
          onHide={() => dontReport(decisionCustomer)}
          onTea={() => shareTea(decisionCustomer)}
          onHeart={() => useHeart(decisionCustomer.id)}
          onClose={() => { setDecisionCustomerId(null); setDeepDiveId(null) }}
        />
      )}
      {deepDiveCustomer && (
        <DeepDiveModal
          customer={deepDiveCustomer}
          onReport={(percent) => reportLikelihood(deepDiveCustomer, percent)}
          onBack={() => setDeepDiveId(null)}
        />
      )}
      {pressure && <PressurePanda key={pressure.id} message={pressure.message} />}
      {seasonResult && <SeasonResult result={seasonResult} final={seasonIndex === seasons.length - 1} onContinue={continueAfterSeason} />}
      {managerPromptOpen && <ManagerPrompt onWorkHard={() => { setManagerPromptOpen(false); setQuizOpen(true) }} />}
      {quizOpen && <QuizModal quiz={currentQuiz} message={quizMessage} onAnswer={answerQuiz} />}
      {reviewOpen && <YearEndReview performance={performance} history={history} onReset={resetYear} />}
    </main>
  )
}

function ForecastPanel({ forecast, opportunities, risks }) {
  const low = forecast < TARGET
  const maxScale = Math.max(TARGET, forecast, 1)
  return (
    <section className="rounded-3xl bg-slate-950 p-5 text-white shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <span className="font-black uppercase tracking-widest text-emerald-200">Live Forecast</span>
        <span className={`rounded-2xl px-4 py-2 text-2xl font-black ${low ? 'bg-red-500' : 'bg-emerald-500'}`}>{stalks(forecast)}</span>
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-xs font-black uppercase tracking-widest text-white/70"><span>Current forecast</span><span>{stalks(forecast)}</span></div>
          <div className="h-5 overflow-hidden rounded-full bg-white/15">
            <div className={`h-full rounded-full transition-all duration-500 ${low ? 'bg-red-500' : 'bg-emerald-400'}`} style={{ width: `${clamp((forecast / maxScale) * 100, 0, 100)}%` }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs font-black uppercase tracking-widest text-white/70"><span>Season target</span><span>{stalks(SEASON_TARGET)}</span></div>
          <div className="h-5 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-white" style={{ width: `${clamp((TARGET / maxScale) * 100, 0, 100)}%` }} />
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm font-bold text-emerald-100">Season target: {stalks(SEASON_TARGET)} · +{stalks(opportunities)} opportunities · -{stalks(risks)} risks</p>
    </section>
  )
}

function CustomerCard({ customer, hearts, onVisit }) {
  const canUseHeart = hearts > 0 && customer.visited && customer.type === 'Risk' && !customer.decision
  const visitButtonLabel = customer.decision ? 'Decision Complete' : customer.visited ? 'Continue Visit' : 'Visit'
  return (
    <article className={`overflow-hidden rounded-3xl border bg-white p-5 shadow-lg transition ${customer.visited ? 'border-emerald-200' : 'border-slate-100'} ${canUseHeart ? 'drop-heart-zone' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-4xl">{customer.icon}</p>
          <h3 className="mt-2 text-2xl font-black">{customer.name}</h3>
          <p className="font-bold text-slate-500">{customer.panda}</p>
        </div>
        {customer.visited && <SignalBadge type={customer.type} />}
      </div>
      <p className="mt-4 min-h-20 font-semibold text-slate-600">{customer.visited ? customer.vague : 'Visit to reveal a potential Risk or Opportunity.'}</p>
      {customer.hearted && <p className="mt-3 rounded-2xl bg-pink-100 p-3 font-black text-pink-900">💚 Heart converted this Risk into an Opportunity.</p>}
      {customer.decision && (
        <div className="mt-3 rounded-2xl bg-emerald-50 p-3 font-black text-emerald-900">
          Decision: {customer.decision === 'full' ? 'Reported in Full' : customer.decision === 'hidden' ? "Didn't Report" : `Tea Report (${customer.reportedPercent}%)`}
          <br />Forecast impact: {signedStalks(customer.reportedAmount)}
        </div>
      )}
      <div className="mt-5 grid gap-2">
        <button onClick={onVisit} disabled={Boolean(customer.decision)} className="rounded-2xl bg-slate-950 px-4 py-3 font-black text-white hover:bg-emerald-700 disabled:bg-slate-300">{visitButtonLabel}</button>
        {canUseHeart && <p className="rounded-2xl bg-pink-50 px-4 py-3 text-center font-black text-pink-800 ring-1 ring-pink-100">Heart available in the visit window</p>}
      </div>
    </article>
  )
}

function DecisionModal({ customer, timeCredits, hearts, onFull, onHide, onTea, onHeart, onClose }) {
  const canUseHeart = hearts > 0 && customer.type === 'Risk' && !customer.decision
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <section className="animate-modal-in w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-emerald-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-700">Customer Visit</p>
            <h2 className="mt-1 text-4xl font-black">{customer.icon} {customer.name}</h2>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 px-4 py-2 font-black text-slate-700">✕</button>
        </div>
        <div className="mt-5 rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
          <SignalBadge type={customer.type} />
          <p className="mt-3 text-xl font-bold text-slate-800">{customer.vague}</p>
          <p className="mt-2 font-semibold text-slate-600">Potential impact: {customer.type === 'Opportunity' ? '+' : '-'}{stalks(customer.amount)}</p>
        </div>
        <div className="mt-5 grid gap-3">
          <button onClick={onFull} className="rounded-2xl bg-slate-950 px-5 py-4 text-left font-black text-white hover:bg-emerald-700">
            Report in Full
            <span className="block text-sm font-bold text-white/75">Commit the full {stalks(customer.amount)} to the forecast immediately.</span>
          </button>
          <button onClick={onHide} className="rounded-2xl bg-white px-5 py-4 text-left font-black text-slate-950 ring-2 ring-slate-200 hover:bg-slate-50">
            Don&apos;t Report
            <span className="block text-sm font-bold text-slate-500">{customer.type === 'Opportunity' ? "Hide this—I'll sell it quietly and be a hero at year-end!" : "Hide this—I'll handle it myself to avoid management panic."}</span>
          </button>
          <button onClick={onTea} className="rounded-2xl bg-amber-500 px-5 py-4 text-left font-black text-white hover:bg-amber-600">
            Share Tea / Deep Dive
            <span className="block text-sm font-bold text-white/80">Build trust through drinking tea and deeper conversation to uncover the exact truth behind your client&apos;s needs.</span>
          </button>
          <button onClick={onHeart} disabled={!canUseHeart} className="rounded-2xl bg-pink-500 px-5 py-4 text-left font-black text-white hover:bg-pink-600 disabled:bg-pink-200">
            Use Heart: Turn Risk into Opportunity
            <span className="block text-sm font-bold text-white/80">One Heart action is available here after visiting a revealed Risk. Hearts left: {hearts}</span>
          </button>
        </div>
      </section>
    </div>
  )
}

function DeepDiveModal({ customer, onReport, onBack }) {
  const markedUpLikelihood = Math.min(customer.likelihood + 5, 100)
  const [percent, setPercent] = useState(markedUpLikelihood)
  const markupMessage = customer.type === 'Risk'
    ? 'Marking up additional 5% to protect from further uncertainty.'
    : 'Marking up additional 5% to secure my inventory for sales.'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
      <section className="animate-modal-in w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-soft ring-4 ring-amber-200">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-700">Deep Dive Complete</p>
        <h2 className="mt-1 text-3xl font-black">Likelihood: {customer.likelihood}%</h2>
        <p className="mt-3 font-bold text-slate-600">This likelihood is deterministic: if you report it, that becomes the final realized upside/risk. Choose how much of it to report for {customer.name}.</p>
        <p className="mt-3 rounded-2xl bg-amber-100 p-3 font-black text-amber-950">{markupMessage}</p>
        <div className="mt-5 rounded-3xl bg-amber-50 p-5">
          <p className="text-xl font-black text-amber-950">Report {percent}% · Forecast impact {signedStalks(reportImpact(customer, percent))}</p>
          <input className="mt-4 w-full accent-emerald-600" type="range" min="0" max={markedUpLikelihood} value={percent} onChange={(event) => setPercent(Number(event.target.value))} />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button onClick={onBack} className="rounded-2xl bg-slate-100 px-5 py-4 font-black text-slate-700">Back</button>
          <button onClick={() => onReport(percent)} className="rounded-2xl bg-emerald-600 px-5 py-4 font-black text-white hover:bg-emerald-700">Report {percent}%</button>
        </div>
      </section>
    </div>
  )
}

function PressurePanda({ message }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      <div className="absolute left-0 top-20 animate-[pressurepanda_5s_linear_forwards] rounded-full bg-red-100 px-6 py-4 shadow-soft ring-4 ring-red-400">
        <AlertTriangle size={64} className="text-red-600" />
      </div>
      <div className="absolute bottom-8 left-1/2 max-w-4xl -translate-x-1/2 rounded-3xl bg-red-600 px-6 py-4 text-center text-xl font-black text-white shadow-soft ring-4 ring-white">
        <AlertTriangle className="mr-2 inline" />{message}
      </div>
    </div>
  )
}

function SeasonResult({ result, final, onContinue }) {
  const roundedTrustDelta = Math.round(result.trustDelta)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
      <section className="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-emerald-100">
        <h2 className="text-4xl font-black">{result.emoji} {result.season} Close</h2>
        <p className="mt-2 text-lg font-bold text-slate-600">Sold {stalks(result.sold)} · Excess Inventory {stalks(result.waste)} · Stockouts {stalks(result.stockouts)} · Trust {roundedTrustDelta >= 0 ? '+' : ''}{roundedTrustDelta}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {result.customers.map((customer) => (
            <div key={customer.id} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <p className="text-sm font-black uppercase text-slate-400">{customer.outcome}</p>
              <h3 className="text-xl font-black">{customer.name}</h3>
              <p className="mt-2 font-bold text-slate-700">{customer.feedback}</p>
            </div>
          ))}
        </div>
        <button onClick={onContinue} className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-4 font-black text-white hover:bg-emerald-700">{final ? 'Year-End Performance Review' : 'Continue'}</button>
      </section>
    </div>
  )
}

function QuizModal({ quiz, message, onAnswer }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <section className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-soft ring-4 ring-pink-200">
        <HelpCircle className="text-pink-600" size={42} />
        <h2 className="mt-2 text-3xl font-black">Seed Knowledge Quiz</h2>
        <p className="mt-2 font-bold text-slate-600">Click until correct to win one Heart.</p>
        <p className="mt-4 rounded-2xl bg-slate-100 p-4 text-lg font-black">{quiz.question}</p>
        <div className="mt-4 grid gap-2">
          {quiz.options.map((option) => <button key={option} onClick={() => onAnswer(option)} className="rounded-2xl bg-slate-100 px-4 py-3 text-left font-black hover:bg-emerald-100">{option}</button>)}
        </div>
        {message && <p className="mt-4 rounded-2xl bg-pink-100 p-3 font-black text-pink-950">{message}</p>}
      </section>
    </div>
  )
}

function YearEndReview({ performance, history, onReset }) {
  const outcome = calculateFinalOutcome(performance)
  const inefficiency = performance.totalStockouts
  const roundedTrust = Math.round(performance.totalTrust)
  const tone = {
    emerald: 'bg-emerald-50 ring-emerald-300',
    amber: 'bg-amber-50 ring-amber-300',
    orange: 'bg-orange-50 ring-orange-300',
    red: 'bg-red-50 ring-red-300',
  }[outcome.tone]
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <section className={`max-h-[94vh] w-full max-w-5xl overflow-auto rounded-[2rem] p-6 shadow-soft ring-8 ${tone}`}>
        <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Year-End Performance Review</p>
        <h2 className="mt-2 text-5xl font-black">{outcome.emoji} {outcome.title}</h2>
        <p className="mt-4 rounded-3xl bg-white/75 p-5 text-xl font-bold leading-relaxed text-slate-800">{outcome.feedback}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <SummaryCard label="Actual Revenue" value={stalks(performance.totalStalksSold)} helper="Total Stalks Sold" tone="emerald" />
          <SummaryCard label="Relationship Equity" value={`${roundedTrust}/100`} helper="Final Trust Score" tone="violet" />
          <SummaryCard label="Excess Inventory" value={stalks(performance.totalWaste)} helper="Unsold bamboo from over-forecasted opportunity demand" tone="amber" />
          <SummaryCard label="Inefficiency Cost" value={stalks(inefficiency)} helper="Lost opportunities from stockouts" tone="red" />
        </div>
        <div className="mt-6 grid gap-2">
          {history.map((item) => <p key={item.season} className="rounded-2xl bg-white/80 p-3 font-bold text-slate-700">{item.emoji} {item.season}: sold {stalks(item.sold)}, stockouts {stalks(item.stockouts)}</p>)}
        </div>
        <button onClick={onReset} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 text-xl font-black text-white hover:bg-emerald-700"><RotateCcw /> Restart Year</button>
      </section>
    </div>
  )
}

function GuideCard({ compact = false }) {
  return (
    <section className={`${compact ? 'rounded-[1.25rem] p-3' : 'rounded-[2rem] p-5'} border border-emerald-100 bg-white/90 shadow-soft lg:self-start`}>
      <div className="flex items-center gap-2 text-emerald-700"><Leaf size={compact ? 20 : 24} /><h3 className={`${compact ? 'text-xl' : 'text-2xl'} font-black text-slate-950`}>How to Play</h3></div>
      <ul className={`${compact ? 'mt-2 space-y-1 text-xs leading-snug' : 'mt-3 space-y-2 text-sm'} font-bold text-slate-600`}>
        <li>1. Visit customers to scout risks and upsides.</li>
        <li>2. Choose your action for your customers.</li>
        <li>3. Close the season to trigger the harvest.</li>
        <li>4. Review your performance at year-end.</li>
      </ul>
    </section>
  )
}

function ManagerPrompt({ onWorkHard }) {
  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
      <section className="animate-modal-in w-full max-w-2xl rounded-[2rem] bg-white p-6 text-center shadow-soft ring-4 ring-red-200">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-5xl">🐼</div>
        <p className="mt-4 text-sm font-black uppercase tracking-[0.28em] text-red-600">Manager Panda Gap Closure Plan</p>
        <h2 className="mt-2 text-4xl font-black text-slate-950">We need to find opportunity.</h2>
        <p className="mt-3 text-lg font-bold text-slate-600">The risk season created a gap. Work hard, answer the Triploid Watermelon quiz, and earn one Heart to convert a customer Risk into upside opportunity.</p>
        <button onClick={onWorkHard} className="mt-6 w-full rounded-2xl bg-red-600 px-6 py-4 text-xl font-black text-white hover:bg-red-700">Work Hard: Find Opportunity</button>
      </section>
    </div>
  )
}

function Ledger({ history, performance, forecast, opportunities, risks }) {
  const roundedTrust = Math.round(performance.totalTrust)
  return (
    <section className="rounded-[2rem] border border-emerald-100 bg-white/90 p-5 shadow-soft">
      <h3 className="text-2xl font-black">Scoreboard</h3>
      <div className="mt-3 rounded-2xl bg-emerald-50 p-3 font-black text-emerald-950 ring-1 ring-emerald-100">
        Annual target: {stalks(ANNUAL_TARGET)} · Season target: {stalks(SEASON_TARGET)} each season
      </div>
      <div className="mt-3">
        <ForecastPanel forecast={forecast} opportunities={opportunities} risks={risks} />
      </div>
      <div className="mt-3 grid gap-2">
        <Metric label="YTD Sold" value={stalks(performance.totalStalksSold)} helper="Actual bamboo sold from previous seasons" />
        <Metric label="Trust" value={`${roundedTrust}/100`} />
        <Metric label="Excess Inventory" value={stalks(performance.totalWaste)} helper="Unsold bamboo from over-forecasted opportunity demand" />
        <Metric label="Stockouts" value={stalks(performance.totalStockouts)} />
      </div>
      <div className="mt-4 space-y-2">
        {history.map((item) => <p key={item.season} className="rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-600">{item.emoji} {item.season}: sold {stalks(item.sold)}</p>)}
      </div>
    </section>
  )
}

function SignalBadge({ type }) {
  const risk = type === 'Risk'
  return <span className={`inline-flex max-w-full shrink-0 items-center gap-1 whitespace-normal rounded-full px-3 py-1 text-xs font-black leading-tight sm:text-sm ${risk ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>{risk ? <TrendingDown size={16} className="shrink-0" /> : <TrendingUp size={16} className="shrink-0" />}<span>Potential {type}</span></span>
}

function Metric({ label, value, helper }) {
  return <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-emerald-100"><p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p><p className="text-2xl font-black text-slate-950">{value}</p>{helper && <p className="text-sm font-bold leading-tight text-slate-500">{helper}</p>}</div>
}

function SummaryCard({ label, value, helper, tone }) {
  const tones = { emerald: 'text-emerald-700', violet: 'text-violet-700', amber: 'text-amber-700', red: 'text-red-700' }
  return <div className="rounded-3xl bg-white/85 p-5 shadow-lg"><p className="text-sm font-black uppercase tracking-widest text-slate-500">{label}</p><p className={`mt-2 text-4xl font-black ${tones[tone]}`}>{value}</p><p className="mt-1 font-bold text-slate-600">{helper}</p></div>
}

function Mini({ label, value, tone }) {
  const tones = { emerald: 'bg-emerald-100 text-emerald-900', amber: 'bg-amber-100 text-amber-900', pink: 'bg-pink-100 text-pink-900' }
  return <div className={`rounded-2xl p-3 ${tones[tone] || tones.emerald}`}><p className="text-xs font-black uppercase opacity-70">{label}</p><p className="text-2xl font-black">{value}</p></div>
}
