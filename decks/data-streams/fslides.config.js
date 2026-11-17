module.exports = {
  style: 'elastic-web',
  name: 'data-streams',
  title: 'Elastic data streams',
  slidesDir: '.',

  // Slide filenames in order, relative to the slides/ directory
  slides: [
    '01-rail.html',
    '02-iso.html',
    '03-metro.html',
    '04-pipe-dark.html',
    '05-hero-stream.html',
  ],

  // Human-readable labels for the overview panel (must match slides array length)
  labels: [
    'Data stream end to end · v1 rail',
    'Data stream end to end · v2 isometric',
    'Data stream end to end · v3 metro line',
    'Data stream end to end · v4 dark pipe',
    'Data stream end to end · v5 hero stream',
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
