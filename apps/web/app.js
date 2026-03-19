const app = document.getElementById('app');
const road = '<div class="page-road"></div>';

function link(href, text, cls='btn') { return `<a class="${cls}" href="${href}">${text}</a>`; }

function home() {
  return `
    <header class="home-hero-wrap" aria-labelledby="home-hero-title">
      ${road}
      <section class="card hero home-hero">
        <span class="badge">Family-made • Premium print quality</span>
        <p class="kicker">Custom Hometown Play Mats</p>
        <h1 id="home-hero-title">Turn your favorite streets into a play mat they'll use every day.</h1>
        <p>Create a personalized neighborhood map in minutes with clear roads, parks, and landmarks kids can recognize.</p>
        <div class="hero-cta-row" role="group" aria-label="Primary actions">
          ${link('/create/map','Create Your Mat')}
          ${link('/style-guide','See Design Style','btn secondary')}
        </div>
        <p class="hero-trust">No design skills needed • Secure checkout • Printed in 7–10 business days</p>
      </section>
    </header>

    ${road}
    <section class="home-support" aria-label="How it works">
      <div class="grid home-steps">
        <article class="card step-card">
          <p class="step-eyebrow">Step 1</p>
          <h3>Map It</h3>
          <p class="muted">Search your address and choose the exact area to include.</p>
        </article>
        <article class="card step-card">
          <p class="step-eyebrow">Step 2</p>
          <h3>Customize</h3>
          <p class="muted">Pick your size, visual style, and the details your family loves.</p>
        </article>
        <article class="card step-card">
          <p class="step-eyebrow">Step 3</p>
          <h3>Preview & Order</h3>
          <p class="muted">Review your mat, personalize if needed, then check out securely.</p>
        </article>
      </div>
    </section>

    ${road}
    <section class="card" aria-label="Starter pricing">
      <h2 class="section-title">Starter pricing</h2>
      <div class="grid">
        <article class="card nested-card">
          <h3>Small</h3>
          <div class="price">$79</div>
          <p class="muted">4x3 play mat</p>
          <ul class="clean"><li>Neighborhood map style</li><li>Illustrated landmarks</li><li>Gift-ready packaging</li></ul>
        </article>
        <article class="card nested-card">
          <h3>Best Seller</h3>
          <div class="price">$149</div>
          <p class="muted">8x5 family size</p>
          <ul class="clean"><li>Larger play surface</li><li>More map detail</li><li>Great for siblings</li></ul>
        </article>
      </div>
    </section>
  `;
}

function createMap() {
  return `
    ${road}
    <section class="card">
      <p class="kicker">Map Builder</p>
      <h2>Create • Map It</h2>
      <div class="builder-layout">
        <aside class="tool-panel">
          <h3 style="margin-top:0">Map Tools</h3>
          <p class="muted" style="margin:0 0 8px">Zoom</p>
          <div class="inline" style="margin-bottom:10px">
            <button class="tool-chip">+</button>
            <button class="tool-chip">−</button>
          </div>

          <p class="muted" style="margin:0 0 6px">Mat Size</p>
          <div>
            <span class="tool-chip">4x3</span>
            <span class="tool-chip">5x4</span>
            <span class="tool-chip">6x5</span>
            <span class="tool-chip active">Custom [8 x 5 ft]</span>
          </div>
        </aside>

        <div class="map-canvas">
          <div class="map-badge">MAT BOUNDARY: Drag to size & position</div>
          <div class="map-inner">Map canvas placeholder<br/>Address: 2417 Shattuck Ave, Berkeley, CA (sample)</div>
        </div>

        <aside class="summary-panel">
          <h3 style="margin-top:0">Selected Area</h3>
          <div class="notice" style="margin-bottom:10px">Total size: <strong>8 ft x 5 ft</strong><br/>Price: <strong>$149.99</strong></div>
          <p class="muted" style="margin:0 0 6px">Base Theme</p>
          <div style="margin-bottom:12px">
            <span class="theme-tile active">🏡</span>
            <span class="theme-tile">🛑</span>
            <span class="theme-tile">🌳</span>
            <span class="theme-tile">🚗</span>
          </div>
          <p class="muted" style="margin:0 0 6px">Add Details</p>
          <div>
            <label><input type="checkbox" checked /> Stop Signs</label>
            <label><input type="checkbox" checked /> Traffic Lights</label>
            <label><input type="checkbox" checked /> Trees</label>
            <label><input type="checkbox" checked /> Parks</label>
          </div>
          <div style="margin-top:12px">
            ${link('/create/preview','Save & Preview')}
          </div>
        </aside>
      </div>
      <div style="margin-top:14px" class="stepper">1. Map It ✓ &nbsp;|&nbsp; 2. Customize ✓ &nbsp;|&nbsp; 3. Preview & Order &nbsp;|&nbsp; 4. Checkout</div>
    </section>
  `;
}

function preview() {
  return `
    ${road}
    <section class="card">
      <p class="kicker">Create Flow</p>
      <h2>Create • Preview & Order</h2>
      <div class="map-canvas" style="min-height:280px">
        <div class="map-inner">Preview placeholder for generated hometown mat</div>
      </div>
      <div class="inline" style="margin-top:12px;align-items:center;flex-wrap:wrap">
        <input placeholder="Add personalization text (e.g., 'Ethan's Hometown')" style="max-width:420px" />
        ${link('/create/checkout','Next Step')}
      </div>
    </section>
  `;
}

function checkout() {
  return `
    ${road}
    <section class="card">
      <p class="kicker">Create Flow</p>
      <h2>Create • Checkout</h2>
      <p class="muted">Secure checkout scaffold is ready for Shopify bridge integration.</p>
      <div class="grid">
        <div>
          <label>Email</label>
          <input placeholder="you@example.com" />
        </div>
        <div>
          <label>Shipping address</label>
          <input placeholder="Street, City, State" />
        </div>
      </div>
      <p><strong>Order total: $149.99</strong> <span class="muted">(sample)</span></p>
      ${link('/order/success/DEMO123','Place Order')}
    </section>
  `;
}

function styleGuide() {
  return `
    ${road}
    <section class="card">
      <p class="kicker">Visual System</p>
      <h2>Hometown Play Mats Style Tokens</h2>
      <p class="muted">Implemented from the TinyTown-style template: warm paper background, map-blue canvas, green primary CTA, and rounded builder panels.</p>
      <div class="swatch-grid">
        <div class="swatch" style="background:#f4eadb">Paper Background<br>#f4eadb</div>
        <div class="swatch" style="background:#68b26b">Primary Green<br>#68b26b</div>
        <div class="swatch" style="background:#bfe3f0">Map Water Blue<br>#bfe3f0</div>
        <div class="swatch" style="background:#accbe0">Road Blue<br>#accbe0</div>
        <div class="swatch" style="background:#bfe5a9">Park Green<br>#bfe5a9</div>
        <div class="swatch" style="background:#e28a5b">Accent Orange<br>#e28a5b</div>
      </div>
      <p class="notice" style="margin-top:12px">See docs/style-guide.md for full brand spec and docs/ui-kit-checklist.md for implementation QA gates.</p>
    </section>
  `;
}

function success(orderId) {
  return `
    ${road}
    <section class="card">
      <h2>Order Confirmed</h2>
      <p>Thanks! Your order <strong>${orderId}</strong> is confirmed.</p>
      <p class="muted">Estimated delivery: 7–10 business days.</p>
      ${link('/','Back Home')}
    </section>
  `;
}

function render() {
  const p = window.location.pathname;
  if (p === '/') app.innerHTML = home();
  else if (p === '/create/map') app.innerHTML = createMap();
  else if (p === '/create/preview') app.innerHTML = preview();
  else if (p === '/create/checkout') app.innerHTML = checkout();
  else if (p === '/style-guide') app.innerHTML = styleGuide();
  else if (p.startsWith('/order/success/')) app.innerHTML = success(p.split('/').pop());
  else app.innerHTML = `${road}<section class="card"><h2>Not found</h2>${link('/','Go home')}</section>`;

  document.querySelectorAll('a[href^="/"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      history.pushState({}, '', a.getAttribute('href'));
      render();
    });
  });
}

window.addEventListener('popstate', render);
render();
