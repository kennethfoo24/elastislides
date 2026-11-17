module.exports = {
  style: 'elastic-web',
  name: 'observability-deck',
  title: 'Elastic Observability',
  slidesDir: '.',
  port: 3023,

  // Slide filenames in order, relative to the slides/ directory
  slides: [
    '01-cover.html',
    '02-platform-outcomes.html',
    '03-agentic-platform.html',
    '04-signals-answers.html',
    '05-one-click.html',
    '06-three-ways-in.html',
    '07-break-down-silos.html',
    '08-log-analytics.html',
    '09-apm.html',
    '10-infrastructure-monitoring.html',
    '11-simplify-ingest.html',
    '12-llm-observability.html',
    '13-universal-profiling.html',
    '14-digital-experience.html',
    '15-slo-management.html',
    '16-zero-config-ml.html',
    '17-ai-assistant.html',
    '18-agents-incident-flow.html',
  ],

  // Human-readable labels for the overview panel (must match slides array length)
  labels: [
    'Cover',
    'Elastic Observability platform',
    'Agentic observability platform',
    'You need signals to get answers',
    'One click, every signal',
    'Three ways in',
    'Break down silos',
    'Log analytics',
    'Application performance monitoring',
    'Infrastructure monitoring',
    'Simplify data ingest',
    'LLM observability',
    'Universal profiling',
    'Digital experience',
    'SLO management',
    'Zero config machine learning',
    'AI Assistant',
    'Agents on every step',
  ],

  // density: { default: 3 },  // content-density dial (1–5), on by default; `false` hides it. Author with data-d / data-dmax

  // liveReload: false,  // fslides serve: disable SSE reload (or open with ?noreload=1)

  // Optional: per-slide PDF overrides
  // pdfOverrides: {
  //   'my-animated-slide.html': {
  //     wait: 5000,   // extra ms to wait before capturing
  //     extra: `document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));`
  //   }
  // },
};
