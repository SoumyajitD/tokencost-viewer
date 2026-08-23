// TokenCost client logic

let activeCurrency = 'INR';
let timer = null;
let currentSymbol = '₹';

// provider logos
const ICONS = {
  'Google': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/></svg>`,
  'OpenAI': `<svg width="14" height="14" viewBox="0 0 24 24" fill="#10A37F"><path d="M22.28 10.42a6.04 6.04 0 0 0-.52-4.97 6.12 6.12 0 0 0-4.9-3.07 6.06 6.06 0 0 0-4.3 1.3 6.04 6.04 0 0 0-5.2-1.04 6.12 6.12 0 0 0-4.32 3.82 6.07 6.07 0 0 0 .88 5.75 6.04 6.04 0 0 0 .52 4.97 6.12 6.12 0 0 0 4.9 3.07 6.06 6.06 0 0 0 4.3-1.3 6.04 6.04 0 0 0 5.2 1.04 6.12 6.12 0 0 0 4.32-3.82 6.07 6.07 0 0 0-.88-5.75zM12 14.8a2.8 2.8 0 1 1 0-5.6 2.8 2.8 0 0 1 0 5.6z"/></svg>`,
  'Anthropic': `<svg width="14" height="14" viewBox="0 0 24 24" fill="#CC785C"><path d="M13.8 3.5L19.5 20.5H15.8L14.4 16.2H9.6L8.2 20.5H4.5L10.2 3.5H13.8ZM12 8.7L10.6 13.2H13.4L12 8.7Z"/></svg>`,
  'DeepSeek': `<svg width="14" height="14" viewBox="0 0 24 24" fill="#1D9BF0"><circle cx="12" cy="12" r="10"/><path d="M7 11.5a5 5 0 0 1 9.9-1M9 16a3 3 0 0 0 6 0" stroke="#FFF" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  'Meta / Groq': `<svg width="14" height="14" viewBox="0 0 24 24" fill="#0668E1"><path d="M12 7.2c-2.3 0-4.3 1.3-5.2 3.3C5.7 8.3 3.9 7.2 1.8 7.2 0.8 7.2 0 8 0 9c0 4.2 3.6 7.8 7.8 7.8 2.3 0 4.3-1.3 5.2-3.3 1.1 2.2 2.9 3.3 5 3.3 4.2 0 7.8-3.6 7.8-7.8 0-1-.8-1.8-1.8-1.8-2.1 0-3.9 1.1-5 3.3-.9-2-2.9-3.3-5-3.3z"/></svg>`,
  'Mistral AI': `<svg width="14" height="14" viewBox="0 0 24 24" fill="#FD5A24"><rect x="2" y="3" width="5.5" height="5.5" rx="1"/><rect x="16.5" y="3" width="5.5" height="5.5" rx="1"/><rect x="2" y="10" width="5.5" height="5.5" rx="1"/><rect x="9.25" y="10" width="5.5" height="5.5" rx="1"/><rect x="16.5" y="10" width="5.5" height="5.5" rx="1"/><rect x="2" y="17" width="5.5" height="5.5" rx="1"/><rect x="16.5" y="17" width="5.5" height="5.5" rx="1"/></svg>`,
  'Alibaba / Groq': `<svg width="14" height="14" viewBox="0 0 24 24" fill="#FF6000"><path d="M12 2L2 7.5v9L12 22l10-5.5v-9L12 2zm0 3.3l7 3.85-7 3.85-7-3.85 7-3.85z"/></svg>`
};

const DEFAULT_MODELS = [
  { name: 'Gemini 2.5 Flash', provider: 'Google' },
  { name: 'Gemini 2.5 Pro', provider: 'Google' },
  { name: 'GPT-4o mini', provider: 'OpenAI' },
  { name: 'GPT-4o', provider: 'OpenAI' },
  { name: 'o3-mini', provider: 'OpenAI' },
  { name: 'o1', provider: 'OpenAI' },
  { name: 'GPT-4.5 Preview', provider: 'OpenAI' },
  { name: 'Claude 3.5 Haiku', provider: 'Anthropic' },
  { name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { name: 'Claude 3.7 Sonnet', provider: 'Anthropic' },
  { name: 'DeepSeek-V3', provider: 'DeepSeek' },
  { name: 'DeepSeek-R1', provider: 'DeepSeek' },
  { name: 'Llama 3.3 70B (Groq)', provider: 'Meta / Groq' },
  { name: 'Mistral Large 2', provider: 'Mistral AI' },
  { name: 'Qwen 2.5 72B (Groq)', provider: 'Alibaba / Groq' },
];

const $ = id => document.getElementById(id);
const promptInput = $('promptInput');
const promptMeta = $('promptMeta');
const currencySelect = $('currencySelect');
const outputTokensInput = $('outputTokensInput');
const matrixBody = $('matrixBody');
const modelTally = $('modelTally');
const exchangeRateLabel = $('exchangeRateLabel');
const metricCheapest = $('metricCheapest');
const metricCheapestName = $('metricCheapestName');
const metricCheapestSub = $('metricCheapestSub');
const metricFlagship = $('metricFlagship');
const metricFlagshipName = $('metricFlagshipName');
const metricFlagshipSub = $('metricFlagshipSub');
const insightHeading = $('insightHeading');
const insightText = $('insightText');
const pricingVerified = $('pricingVerified');
const tableMainTitle = $('tableMainTitle');

// currency dropdown
currencySelect.addEventListener('change', e => {
  activeCurrency = e.target.value;
  recalc();
});

// sample prompt clicks
document.querySelectorAll('.sample-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    promptInput.value = btn.dataset.text;
    updateMeta();
    recalc();
  });
});

// preset token pills
document.querySelectorAll('.preset-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    const target = $(pill.dataset.target);
    if (target) target.value = pill.dataset.value;
    pill.closest('.preset-pills').querySelectorAll('.preset-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    if (promptInput.value.trim()) recalc();
  });
});

// debounce prompt input with typing grow animation
promptInput.addEventListener('input', () => {
  updateMeta();
  clearTimeout(timer);
  timer = setTimeout(recalc, 180);
});

// custom output token field
outputTokensInput.addEventListener('change', () => {
  const val = parseInt(outputTokensInput.value, 10);
  outputTokensInput.closest('.param-group').querySelectorAll('.preset-pill').forEach(p =>
    p.classList.toggle('active', parseInt(p.dataset.value, 10) === val)
  );
  if (promptInput.value.trim()) recalc();
});

function updateMeta() {
  const len = promptInput.value.length;
  promptMeta.textContent = len > 0 ? `${len.toLocaleString()} characters` : '0 characters · 0 tokens';
}

function fmt(amount, sym = currentSymbol) {
  if (!amount || amount <= 0) return `${sym}0.00`;
  if (amount >= 1000) return `${sym}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (amount >= 1) return `${sym}${amount.toFixed(2)}`;
  if (amount >= 0.001) return `${sym}${amount.toFixed(4)}`;
  return `${sym}${amount.toFixed(6)}`;
}

// smooth number animation helper with grow pulse
function animateValue(elem, targetVal, formatFn, duration = 300) {
  if (!elem) return;
  const startVal = elem._currentVal != null ? elem._currentVal : 0;
  elem._currentVal = targetVal;

  // trigger grow animation pulse if value increased or changed meaningfully
  if (Math.abs(targetVal - startVal) > 0.00001) {
    elem.classList.remove('grow-pulse');
    void elem.offsetWidth; // trigger reflow
    elem.classList.add('grow-pulse');
  }

  if (startVal === targetVal) {
    elem.textContent = formatFn(targetVal);
    return;
  }

  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // ease out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = startVal + (targetVal - startVal) * ease;
    elem.textContent = formatFn(current);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      elem.textContent = formatFn(targetVal);
    }
  }
  requestAnimationFrame(update);
}

// initial 0 state when no prompt is entered
function renderZeroState() {
  updateMeta();

  animateValue(metricCheapest, 0, v => fmt(v, currentSymbol));
  metricCheapestName.textContent = 'Gemini 2.5 Flash';
  metricCheapestSub.textContent = `1,000 requests = ${fmt(0, currentSymbol)}`;

  animateValue(metricFlagship, 0, v => fmt(v, currentSymbol));
  metricFlagshipName.textContent = 'GPT-4o';
  metricFlagshipSub.textContent = `1,000 requests = ${fmt(0, currentSymbol)}`;

  insightHeading.textContent = 'Type any prompt to calculate real-time inference costs.';
  insightText.textContent = 'Paste a prompt, code snippet, or select a sample above to watch token costs calculate and scale live across 15 models.';

  if (tableMainTitle) tableMainTitle.textContent = `Full Pricing Breakdown (${activeCurrency})`;
  if (modelTally) modelTally.textContent = `${DEFAULT_MODELS.length} Models`;

  matrixBody.innerHTML = '';
  DEFAULT_MODELS.forEach(m => {
    const tr = document.createElement('tr');
    const icon = ICONS[m.provider] || '';
    tr.innerHTML = `
      <td class="td-model">
        <div class="model-cell">
          <span class="model-name">${m.name}</span>
          <span class="model-provider-sub">${icon} ${m.provider}</span>
        </div>
      </td>
      <td class="td-provider"><span class="provider-pill">${icon}<span>${m.provider}</span></span></td>
      <td class="col-right td-cost-1">
        <div class="cost-primary">${fmt(0, currentSymbol)}</div>
        <div class="cost-sub-mobile">${fmt(0, currentSymbol)} / 1k</div>
      </td>
      <td class="col-right td-cost-1k"><div class="cost-secondary">${fmt(0, currentSymbol)}</div></td>
      <td class="col-center td-savings"><span class="savings-pill neutral">0%</span></td>
    `;
    matrixBody.appendChild(tr);
  });
}

// fetch live rates for header badge
async function loadRates() {
  try {
    const res = await fetch('/api/rates');
    if (!res.ok) return;
    const data = await res.json();
    if (exchangeRateLabel && data.inr_rate) {
      exchangeRateLabel.textContent = `1 USD = ₹${data.inr_rate.toFixed(2)}`;
    }
  } catch (e) {
    // fallback
  }
}

async function recalc() {
  const text = promptInput.value.trim();

  // If blank, animate smoothly back to 0 state
  if (!text) {
    renderZeroState();
    return;
  }

  const estOutput = parseInt(outputTokensInput.value, 10) || 500;

  try {
    const res = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        estimated_output_tokens: estOutput,
        currency_code: activeCurrency,
      }),
    });
    if (!res.ok) return;
    const data = await res.json();
    render(data);
  } catch (err) {
    console.error('Calculation failed:', err);
  }
}

function render(data) {
  const models = data.models || [];
  const cheapest = data.highlights.cheapest;
  const flagship = data.highlights.flagship;
  const sym = data.currency.symbol;
  currentSymbol = sym;
  const code = data.currency.code;
  const rate = data.currency.rate_vs_usd;
  const refTokens = data.text_stats.reference_input_tokens;
  const charCount = data.text_stats.char_count;

  // token stats in header with grow pulse
  promptMeta.textContent = charCount > 0
    ? `${charCount.toLocaleString()} chars · ${refTokens.toLocaleString()} tokens`
    : '0 characters · 0 tokens';
  promptMeta.classList.remove('grow-pulse');
  void promptMeta.offsetWidth;
  promptMeta.classList.add('grow-pulse');

  // live exchange rate badge
  if (exchangeRateLabel) {
    exchangeRateLabel.textContent = code === 'USD' ? 'Base currency' : `1 USD = ${sym}${rate.toFixed(2)}`;
  }

  // table header info
  if (tableMainTitle) tableMainTitle.textContent = `Full Pricing Breakdown (${code})`;
  if (modelTally) modelTally.textContent = `${models.length} Models`;

  if (pricingVerified && data.pricing_last_verified) {
    const d = new Date(data.pricing_last_verified + 'T00:00:00');
    pricingVerified.textContent = `Pricing last verified: ${d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
  }

  // animate KPI numbers with grow pulse
  if (cheapest) {
    animateValue(metricCheapest, cheapest.cost_1_run, v => fmt(v, sym));
    metricCheapestName.textContent = cheapest.name;
    metricCheapestSub.textContent = `1,000 requests = ${fmt(cheapest.cost_1k_runs, sym)}`;
  }

  if (flagship) {
    animateValue(metricFlagship, flagship.cost_1_run, v => fmt(v, sym));
    metricFlagshipName.textContent = flagship.name;
    metricFlagshipSub.textContent = `1,000 requests = ${fmt(flagship.cost_1k_runs, sym)}`;
  }

  // takeaway note
  if (cheapest && flagship && flagship.cost_1k_runs > 0) {
    const saved = flagship.cost_1k_runs - cheapest.cost_1k_runs;
    const mult = Math.floor(flagship.cost_1_run / cheapest.cost_1_run);
    insightHeading.textContent = `Route to ${cheapest.name} and save ${fmt(saved, sym)} per 1,000 requests.`;
    insightText.textContent = `At ${fmt(cheapest.cost_1_run, sym)} per request versus ${fmt(flagship.cost_1_run, sym)} for ${flagship.name}, you get ${mult}× more throughput at the same budget.`;
  }

  // populate rows with animated numbers
  matrixBody.innerHTML = '';
  models.forEach(m => {
    const tr = document.createElement('tr');

    let savingsClass = 'neutral';
    let savingsLabel = 'Baseline';
    if (m.vs_gpt4o_pct > 0) {
      savingsClass = 'green';
      savingsLabel = `${m.vs_gpt4o_pct}% cheaper`;
    } else if (m.vs_gpt4o_pct < 0) {
      savingsClass = 'red';
      savingsLabel = `${Math.abs(m.vs_gpt4o_pct)}% more`;
    }

    const icon = ICONS[m.provider] || '';

    tr.innerHTML = `
      <td class="td-model">
        <div class="model-cell">
          <span class="model-name">${m.name}</span>
          <span class="model-provider-sub">${icon} ${m.provider}</span>
        </div>
      </td>
      <td class="td-provider"><span class="provider-pill">${icon}<span>${m.provider}</span></span></td>
      <td class="col-right td-cost-1">
        <div class="cost-primary grow-pulse">${fmt(m.cost_1_run, sym)}</div>
        <div class="cost-sub-mobile">${fmt(m.cost_1k_runs, sym)} / 1k</div>
      </td>
      <td class="col-right td-cost-1k"><div class="cost-secondary grow-pulse">${fmt(m.cost_1k_runs, sym)}</div></td>
      <td class="col-center td-savings"><span class="savings-pill ${savingsClass}">${savingsLabel}</span></td>
    `;
    matrixBody.appendChild(tr);
  });
}

// start in clean 0 state
renderZeroState();
loadRates();
