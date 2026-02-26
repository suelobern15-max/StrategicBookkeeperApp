const monthlyData = {
  'Jan 2026': {
    revenue: 80000,
    cogs: 40000,
    marketing: 18000,
    shipping: 9500,
    fees: 3200,
    opex: 6800,
    netIncome: 2500,
    cash: 22000,
    ar: 10000,
    inventory: 35000,
    refundRate: 6.5,
    cashRunway: 2.3,
    operatingCashFlow: 3200,
    liabilities: 18000
  },
  'Feb 2026': {
    revenue: 84000,
    cogs: 43000,
    marketing: 20500,
    shipping: 9800,
    fees: 3400,
    opex: 7000,
    netIncome: 300,
    cash: 19500,
    ar: 11200,
    inventory: 36500,
    refundRate: 6.8,
    cashRunway: 2.0,
    operatingCashFlow: 1400,
    liabilities: 19200
  },
  'Mar 2026': {
    revenue: 86000,
    cogs: 45000,
    marketing: 22500,
    shipping: 10200,
    fees: 3600,
    opex: 7200,
    netIncome: -2500,
    cash: 16500,
    ar: 12500,
    inventory: 38000,
    refundRate: 7.1,
    cashRunway: 1.7,
    operatingCashFlow: -900,
    liabilities: 20500
  }
};

const transactions = [
  { date: '2026-01-04', description: 'Shopify payout batch', type: 'Revenue', amount: 28500, account: 'Cash / Sales Revenue', why: 'Drives top-line cash generation and revenue trend.' },
  { date: '2026-01-08', description: 'Meta ad spend', type: 'Expense', amount: -9200, account: 'Marketing Expense / Cash', why: 'Tests paid growth efficiency against contribution margin.' },
  { date: '2026-01-12', description: '3PL monthly invoice', type: 'Expense', amount: -4800, account: 'Fulfillment Expense / Accounts Payable', why: 'High fixed logistics costs constrain margin flexibility.' },
  { date: '2026-01-18', description: 'Customer refunds', type: 'Refund', amount: -3400, account: 'Sales Returns / Cash', why: 'Refund volatility directly erodes gross profit and confidence in scale.' },
  { date: '2026-02-03', description: 'Inventory restock', type: 'Inventory', amount: -14500, account: 'Inventory / Cash', why: 'Working capital tied in stock reduces immediate liquidity.' },
  { date: '2026-02-14', description: 'Stripe payout', type: 'Revenue', amount: 22100, account: 'Cash / Sales Revenue', why: 'Represents collection timing and receivable conversion speed.' },
  { date: '2026-03-09', description: 'Google ads ramp', type: 'Expense', amount: -11600, account: 'Marketing Expense / Cash', why: 'Marketing scaling pressure can outpace realized sales lift.' },
  { date: '2026-03-17', description: 'Refund cluster campaign', type: 'Refund', amount: -4700, account: 'Sales Returns / Cash', why: 'Elevated refunds are a leading risk signal for no-go decisions.' }
];

const money = (n) => `$${Math.round(n).toLocaleString()}`;
const pct = (n) => `${n.toFixed(1)}%`;

const monthSelector = document.getElementById('month-selector');
const summaryCards = document.getElementById('summary-cards');
const redFlags = document.getElementById('red-flags');
const transactionBody = document.getElementById('transaction-table-body');
const ledgerGrid = document.getElementById('ledger-grid');
const kpiGrid = document.getElementById('kpi-grid');
const analysisQuestion = document.getElementById('analysis-question');
const comparisonTable = document.getElementById('comparison-table');
const verdictBadge = document.getElementById('verdict-badge');
const scoreChip = document.getElementById('score-chip');

const searchInput = document.getElementById('transaction-search');
const typeFilter = document.getElementById('type-filter');

const adSlider = document.getElementById('ad-spend-slider');
const revSlider = document.getElementById('revenue-lift-slider');
const refundSlider = document.getElementById('refund-change-slider');

const adValue = document.getElementById('ad-spend-value');
const revValue = document.getElementById('revenue-lift-value');
const refundValue = document.getElementById('refund-change-value');

const plTable = document.getElementById('pl-table');
const bsTable = document.getElementById('bs-table');
const cfTable = document.getElementById('cf-table');
const driverImpactList = document.getElementById('driver-impact-list');
const coachingList = document.getElementById('coaching-list');

Object.keys(monthlyData).forEach(month => {
  const option = document.createElement('option');
  option.value = month;
  option.textContent = month;
  monthSelector.appendChild(option);
});
monthSelector.value = 'Jan 2026';

function renderOverview(month) {
  const d = monthlyData[month];
  const gm = ((d.revenue - d.cogs) / d.revenue) * 100;
  const marketingRate = (d.marketing / d.revenue) * 100;
  const cards = [
    ['Revenue', money(d.revenue), false],
    ['COGS', money(d.cogs), false],
    ['Gross Margin', pct(gm), gm < 30],
    ['Marketing Spend', money(d.marketing), marketingRate > 35],
    ['Net Income', money(d.netIncome), d.netIncome < 0],
    ['Cash Balance', money(d.cash), d.cash <= 0],
    ['Refund Rate', pct(d.refundRate), d.refundRate > 7],
    ['Cash Runway', `${d.cashRunway.toFixed(1)} months`, d.cashRunway < 3]
  ];

  summaryCards.innerHTML = cards.map(([label, value, risky]) => `
    <article class="summary-card ${risky ? 'risky' : ''}">
      <div>${label}</div>
      <strong>${value}</strong>
    </article>
  `).join('');

  const flags = [
    'Refund rate exceeds safe threshold (5%).',
    'Marketing spend growing faster than revenue.',
    'Cash runway under 3 months.',
    'Gross margin trending downward month over month.'
  ];
  redFlags.innerHTML = flags.map(flag => `<li>${flag}</li>`).join('');
}

function renderTransactions() {
  const term = searchInput.value.toLowerCase();
  const filter = typeFilter.value;
  const shown = transactions.filter(t => {
    const matchTerm = [t.description, t.account].join(' ').toLowerCase().includes(term);
    const matchType = filter === 'all' || filter === t.type;
    return matchTerm && matchType;
  });

  transactionBody.innerHTML = shown.map(t => `
    <tr>
      <td>${t.date}</td>
      <td>${t.description}</td>
      <td>${t.type}</td>
      <td>${money(t.amount)}</td>
      <td><span class="tooltip" title="Why this transaction matters">${t.why}</span></td>
      <td><span class="account-line">Debit/Credit: ${t.account}</span></td>
    </tr>
  `).join('');

  const ledger = shown.reduce((acc, t) => {
    const keys = t.account.split('/').map(s => s.trim());
    keys.forEach(k => { acc[k] = (acc[k] || 0) + t.amount; });
    return acc;
  }, {});

  ledgerGrid.innerHTML = Object.entries(ledger).map(([account, balance]) => `
    <article class="ledger-item">
      <div>${account}</div>
      <strong>${money(balance)}</strong>
    </article>
  `).join('');
}

function renderReports(month) {
  const d = monthlyData[month];
  const grossProfit = d.revenue - d.cogs;
  const contribution = d.revenue - d.cogs - d.marketing - d.shipping - d.fees;
  const marketingPct = (d.marketing / d.revenue) * 100;
  const gmPct = (grossProfit / d.revenue) * 100;

  plTable.innerHTML = `
    <tr><td>Revenue</td><td>${money(d.revenue)}</td></tr>
    <tr><td>Cost of Goods Sold</td><td>${money(d.cogs)}</td></tr>
    <tr><td>Gross Profit</td><td>${money(grossProfit)}</td></tr>
    <tr><td>Marketing Spend</td><td>${money(d.marketing)}</td></tr>
    <tr><td>Shipping & Fulfillment</td><td>${money(d.shipping)}</td></tr>
    <tr><td>Platform & Payment Fees</td><td>${money(d.fees)}</td></tr>
    <tr><td>Operating Expenses</td><td>${money(d.opex)}</td></tr>
    <tr><td><strong>Net Income</strong></td><td><strong>${money(d.netIncome)}</strong></td></tr>
  `;

  bsTable.innerHTML = `
    <tr><td>Cash</td><td>${money(d.cash)}</td></tr>
    <tr><td>Accounts Receivable</td><td>${money(d.ar)}</td></tr>
    <tr><td>Inventory</td><td>${money(d.inventory)}</td></tr>
    <tr><td>Total Assets</td><td>${money(d.cash + d.ar + d.inventory)}</td></tr>
    <tr><td>Total Liabilities</td><td>${money(d.liabilities)}</td></tr>
    <tr><td>Equity (balancing)</td><td>${money(d.cash + d.ar + d.inventory - d.liabilities)}</td></tr>
  `;

  cfTable.innerHTML = `
    <tr><td>Operating Cash Flow</td><td>${money(d.operatingCashFlow)}</td></tr>
    <tr><td>Inventory Investment</td><td>${money(-(d.inventory * 0.09))}</td></tr>
    <tr><td>Net Cash Movement</td><td>${money(d.operatingCashFlow - d.inventory * 0.09)}</td></tr>
    <tr><td>Ending Cash</td><td>${money(d.cash)}</td></tr>
  `;

  const kpis = [
    ['Gross Margin %', pct(gmPct), gmPct < 30],
    ['Contribution Margin', money(contribution), contribution < 0],
    ['Refund Rate %', pct(d.refundRate), d.refundRate > 7],
    ['Marketing % of Revenue', pct(marketingPct), marketingPct > 35],
    ['Cash Runway (months)', d.cashRunway.toFixed(1), d.cashRunway < 2]
  ];
  kpiGrid.innerHTML = kpis.map(([label, value, risky]) => `
    <article class="kpi-item ${risky ? 'risky' : ''}">
      <div>${label}</div>
      <strong>${value}</strong>
    </article>
  `).join('');
}

function runSimulation() {
  const month = monthSelector.value;
  const before = monthlyData[month];
  const adIncrease = Number(adSlider.value) / 100;
  const revLift = Number(revSlider.value) / 100;
  const refundDelta = Number(refundSlider.value);

  const afterRevenue = before.revenue * (1 + revLift);
  const afterCogs = afterRevenue * (before.cogs / before.revenue);
  const afterMarketing = before.marketing * (1 + adIncrease);
  const afterRefund = before.refundRate + refundDelta;
  const refundPenalty = afterRevenue * (afterRefund / 100) - before.revenue * (before.refundRate / 100);
  const afterNet = afterRevenue - afterCogs - afterMarketing - before.shipping - before.fees - before.opex - refundPenalty;

  const collectionLagPenalty = afterRevenue * (10 / 30) * 0.1;
  const afterCash = before.cash + afterNet - collectionLagPenalty;
  const burnRate = Math.max(1, Math.abs(afterNet) + before.opex);
  const afterRunway = afterCash / burnRate;
  const afterGM = ((afterRevenue - afterCogs) / afterRevenue) * 100;
  const afterMarketingRate = (afterMarketing / afterRevenue) * 100;

  const metrics = [
    ['Revenue', money(before.revenue), money(afterRevenue)],
    ['Gross Margin %', pct((before.revenue - before.cogs) / before.revenue * 100), pct(afterGM)],
    ['Net Income', money(before.netIncome), money(afterNet)],
    ['Cash Balance', money(before.cash), money(afterCash)],
    ['Cash Runway', `${before.cashRunway.toFixed(2)} months`, `${afterRunway.toFixed(2)} months`],
    ['Refund Rate', pct(before.refundRate), pct(afterRefund)]
  ];

  comparisonTable.innerHTML = `
    <tr><th>Metric</th><th>Before</th><th>After</th></tr>
    ${metrics.map(([m, b, a]) => `<tr><td>${m}</td><td>${b}</td><td>${a}</td></tr>`).join('')}
  `;

  const checks = {
    positiveCash: afterCash > 0,
    runway: afterRunway >= 2,
    grossMargin: afterGM >= 30,
    refund: afterRefund <= 7,
    marketingRate: afterMarketingRate <= 35
  };

  const failCount = Object.values(checks).filter(Boolean).length;
  let verdict = { label: '❌ Not Feasible', className: 'bad' };
  if (failCount === 5) verdict = { label: '✅ Feasible', className: 'good' };
  else if (failCount >= 3) verdict = { label: '⚠️ Feasible with Risk', className: 'warn' };

  verdictBadge.textContent = verdict.label;
  verdictBadge.className = `badge ${verdict.className}`;

  const score = (
    (checks.positiveCash ? 35 : 10) +
    (checks.runway ? 25 : 0) +
    (checks.grossMargin ? 20 : 5) +
    (checks.refund ? 10 : 0) +
    (checks.marketingRate ? 10 : 0)
  );
  scoreChip.textContent = `Score: ${score}/100`;

  const lines = [
    ['Cash balance', checks.positiveCash ? 'stays positive' : 'turns negative', checks.positiveCash ? 'Maintain reserve discipline.' : 'Reduce ad ramp and tighten collections.'],
    ['Cash runway', checks.runway ? 'stays above 2 months' : 'drops below 2 months', checks.runway ? 'Proceed with weekly cash forecast checks.' : 'Secure liquidity before scaling spend.'],
    ['Gross margin', checks.grossMargin ? 'stays above 30%' : 'falls below 30%', checks.grossMargin ? 'Protect pricing and product mix.' : 'Reprice or reduce COGS before growth push.'],
    ['Refund pressure', checks.refund ? 'is contained' : 'exceeds 7% risk threshold', checks.refund ? 'Continue QA and customer expectation management.' : 'Fix product/fulfillment quality before adding demand.'],
    ['Marketing intensity', checks.marketingRate ? 'is controlled' : 'exceeds 35% of revenue', checks.marketingRate ? 'Scale efficiently with ROAS guardrails.' : 'Cap spend until conversion and retention improve.']
  ];

  driverImpactList.innerHTML = lines.map(([driver, impact, action]) =>
    `<li><strong>${driver}</strong> → ${impact} → ${action}</li>`).join('');

  coachingList.innerHTML = [
    `<li><strong>What worked:</strong> Scenario modeling ties transactions and statements into one decision lens.</li>`,
    `<li><strong>What broke:</strong> Margin and cash resilience are insufficient for aggressive ad expansion.</li>`,
    `<li><strong>Strategic bookkeeper recommendation:</strong> Treat this as NO-GO unless refunds and working capital are stabilized first.</li>`
  ].join('');
}

function updateSliderLabels() {
  adValue.textContent = `${adSlider.value}%`;
  revValue.textContent = `${revSlider.value}%`;
  const v = Number(refundSlider.value);
  refundValue.textContent = `${v >= 0 ? '+' : ''}${v}%`;
}

analysisQuestion.textContent = 'Use real bookkeeping-informed drivers (cash timing, margin, refunds) to test if a 30% marketing increase is feasible.';

monthSelector.addEventListener('change', () => {
  renderOverview(monthSelector.value);
  renderReports(monthSelector.value);
  runSimulation();
});
searchInput.addEventListener('input', renderTransactions);
typeFilter.addEventListener('change', renderTransactions);
[adSlider, revSlider, refundSlider].forEach(slider => slider.addEventListener('input', updateSliderLabels));
document.getElementById('run-simulation').addEventListener('click', runSimulation);

updateSliderLabels();
renderOverview(monthSelector.value);
renderTransactions();
renderReports(monthSelector.value);
runSimulation();
