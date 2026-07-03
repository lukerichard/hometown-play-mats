import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import './LandingPage.css';
import customPinIconUrl from '../../icons/custom.png';
import schoolPinIconUrl from '../../icons/school.png';
import parkPinIconUrl from '../../icons/park.png';
import playgroundPinIconUrl from '../../icons/playground.png';
import grandparentsPinIconUrl from '../../icons/grandparents.png';
import homePinIconUrl from '../../icons/home.png';

/* Same six pins offered in the designer sidebar */
const STREET_PIN_ICONS = [
  { id: 'home', label: 'Home', src: homePinIconUrl },
  { id: 'grandparents', label: 'Family', src: grandparentsPinIconUrl },
  { id: 'school', label: 'School', src: schoolPinIconUrl },
  { id: 'park', label: 'Park', src: parkPinIconUrl },
  { id: 'playground', label: 'Playground', src: playgroundPinIconUrl },
  { id: 'custom', label: 'Custom', src: customPinIconUrl },
];

/* ── Inline icons (2px stroke, rounded — per the design system) ───── */
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const PinIcon = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const SlidersIcon = (props) => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}>
    <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
    <path d="M1 14h6M9 8h6M17 16h6" />
  </svg>
);

const TruckIcon = (props) => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}>
    <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const ShieldIcon = (props) => (
  <svg width="52" height="52" viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const LayersIcon = (props) => (
  <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}>
    <path d="m12 2 10 5-10 5L2 7l10-5Z" />
    <path d="m2 12 10 5 10-5M2 17l10 5 10-5" />
  </svg>
);

const DropIcon = (props) => (
  <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}>
    <path d="M12 2.7 6.3 9a8 8 0 1 0 11.4 0L12 2.7Z" />
  </svg>
);

const MapMarkIcon = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}>
    <path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3Z" />
    <path d="M9 3v15M15 6v15" />
  </svg>
);

/* ── Address capture form (reused in hero + final CTA) ───────────── */
const AddressForm = ({ value, onChange, onSubmit, cta, label }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  useEffect(() => {
    const query = value.trim();

    if (selectedSuggestion?.place_name === value) {
      return undefined;
    }

    if (query.length < 3) {
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const token = import.meta.env.VITE_MAPBOX_TOKEN;
        if (!token) return;

        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&autocomplete=true&limit=5`
        );
        const data = await response.json();
        const nextSuggestions = data.features || [];
        setSuggestions(nextSuggestions);
        setShowSuggestions(nextSuggestions.length > 0);
      } catch (error) {
        console.error('Landing address autocomplete error:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [selectedSuggestion, value]);

  const handleChange = (event) => {
    const nextValue = event.target.value;

    setSelectedSuggestion(null);
    if (nextValue.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    onChange(nextValue);
  };

  const handleSelectSuggestion = (suggestion) => {
    setSelectedSuggestion(suggestion);
    onChange(suggestion.place_name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <form
      className="lp-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(value, selectedSuggestion);
      }}
    >
      <label className="lp-field">
        <span className="lp-sr-only">{label}</span>
        <PinIcon />
        <span className="lp-address-input-wrap">
          <input
            type="text"
            placeholder="Enter your home address"
            value={value}
            onChange={handleChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            autoComplete="street-address"
          />
          {showSuggestions && suggestions.length > 0 && (
            <span className="lp-address-suggestions">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id || index}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleSelectSuggestion(suggestion);
                  }}
                >
                  <strong>{suggestion.text}</strong>
                  <small>{suggestion.place_name}</small>
                </button>
              ))}
            </span>
          )}
        </span>
      </label>
      <button type="submit" className="lp-btn lp-btn-amber">
        {cta}
      </button>
    </form>
  );
};

const sizeOptions = [
  {
    name: 'The Neighbourhood',
    size: '48" x 36"',
    price: '$189',
    note: 'Fits comfortably in a bedroom or beside the couch. Room for your street and a few blocks around it.',
  },
  {
    name: 'The Hometown',
    size: '60" x 48"',
    price: '$259',
    note: 'Takes up a good stretch of playroom or living room floor. Fits the school, the park, and the way to grandma’s.',
  },
];

const faqItems = [
  {
    question: 'How long does shipping take?',
    answer:
      'Every mat is printed to order in Ontario. Most orders arrive within 10 to 14 days anywhere in Canada, a little longer for remote addresses.',
  },
  {
    question: 'What if I don’t like how my map turned out?',
    answer:
      'Send it back for a full refund. If you’d rather adjust the map and reprint it, email us and we’ll help you do that instead.',
  },
  {
    question: 'Is my address stored or shared?',
    answer:
      'Your address is used to generate your map and kept with your order so we can reprint it if you ever ask us to. It is never sold or shared.',
  },
  {
    question: 'What’s the mat made of?',
    answer:
      'An 8mm cushioned core with an anti-slip rubber backing and a wipe-clean printed surface. The inks are non-toxic and child-safe.',
  },
  {
    question: 'Can I gift one if I don’t know their exact address?',
    answer:
      'A gift option is coming soon. For now, email us at hello@hometownplaymats.com and we’ll set something up.',
  },
];

const FOUNDER_PHOTO_SRC = '/images/luke-family-photo.jpg';

const LandingPage = () => {
  const navigate = useNavigate();
  const [heroAddress, setHeroAddress] = useState('');
  const [ctaAddress, setCtaAddress] = useState('');

  useEffect(() => {
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const entries = Array.from(document.querySelectorAll('.lp-map-section'))
      .map((section) => ({
        section,
        layer: section.querySelector('.lp-map-parallax-layer'),
        currentX: 0,
        currentY: 0,
        currentScale: 1,
        targetX: 0,
        targetY: 0,
        targetScale: 1,
      }))
      .filter((entry) => entry.layer);

    if (!entries.length) return undefined;

    let animationFrame = 0;
    const parallaxEase = 0.12;

    const applyMapOffset = (entry) => {
      entry.section.style.setProperty('--lp-map-shift-x', `${entry.currentX.toFixed(1)}px`);
      entry.section.style.setProperty('--lp-map-shift-y', `${entry.currentY.toFixed(1)}px`);
      entry.layer.style.transform = 'none';
    };

    const renderFrame = () => {
      animationFrame = 0;
      let needsNextFrame = false;

      entries.forEach((entry) => {
        entry.currentX += (entry.targetX - entry.currentX) * parallaxEase;
        entry.currentY += (entry.targetY - entry.currentY) * parallaxEase;
        entry.currentScale += (entry.targetScale - entry.currentScale) * parallaxEase;

        const deltaX = Math.abs(entry.targetX - entry.currentX);
        const deltaY = Math.abs(entry.targetY - entry.currentY);
        const deltaScale = Math.abs(entry.targetScale - entry.currentScale);

        if (deltaX > 0.05 || deltaY > 0.05 || deltaScale > 0.001) {
          needsNextFrame = true;
        } else {
          entry.currentX = entry.targetX;
          entry.currentY = entry.targetY;
          entry.currentScale = entry.targetScale;
        }

        applyMapOffset(entry);
      });

      if (needsNextFrame) {
        animationFrame = window.requestAnimationFrame(renderFrame);
      }
    };

    const requestRender = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(renderFrame);
    };

    const updateTargets = (immediate = false) => {
      const viewportHeight = window.innerHeight || 1;

      entries.forEach((entry) => {
        const rect = entry.section.getBoundingClientRect();
        const progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height), 0, 1);
        const centeredProgress = progress - 0.5;
        const isHero = entry.section.classList.contains('lp-map-hero');
        const isSizes = entry.section.classList.contains('lp-map-sizes');
        const yTravel = isHero ? 42 : 36;
        const xTravel = 0;
        const xDirection = isSizes ? -1 : 1;
        const scale = 1;
        const x = centeredProgress * xTravel * xDirection * -1;
        const y = centeredProgress * yTravel * -1;

        entry.targetX = x;
        entry.targetY = y;
        entry.targetScale = scale;

        if (immediate) {
          entry.currentX = x;
          entry.currentY = y;
          entry.currentScale = scale;
          applyMapOffset(entry);
        }
      });

      if (!immediate) requestRender();
    };

    const handleViewportChange = () => updateTargets();

    updateTargets(true);
    window.addEventListener('scroll', handleViewportChange, { passive: true });
    window.addEventListener('resize', handleViewportChange);

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', handleViewportChange);
      window.removeEventListener('resize', handleViewportChange);
    };
  }, []);

  const goToDesigner = (prefillAddress, suggestion) => {
    const trimmedAddress = prefillAddress.trim();

    if (!trimmedAddress) {
      navigate('/create');
      return;
    }

    navigate('/create', {
      state: {
        prefillAddress: suggestion?.place_name || trimmedAddress,
        prefillCenter: suggestion?.center || null,
      },
    });
  };

  return (
    <main className="lp">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="lp-hero lp-map-section lp-map-hero" aria-labelledby="lp-hero-title">
        <span className="lp-map-parallax-layer" aria-hidden="true" />
        <div className="lp-container lp-hero-grid">
          <div className="lp-hero-copy-panel">
            <h1 id="lp-hero-title">
              The streets they&rsquo;re growing up on.{' '}
              <span className="lp-accent">The mat they&rsquo;ll grow up playing on.</span>
            </h1>
            <p className="lp-hero-copy">
              A custom play mat of your family&rsquo;s real neighbourhood. Your street, their
              school, the park you walk to. Designed by you in two minutes, printed in Ontario.
            </p>

            <AddressForm
              label="Your home address"
              value={heroAddress}
              onChange={setHeroAddress}
              onSubmit={goToDesigner}
              cta="See your neighbourhood"
            />
          </div>
        </div>
      </section>

      {/* Steps */}
      <section id="how-it-works" className="lp-steps lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <h2>How it works</h2>
          </div>

          <div className="lp-step-grid">
            <article className="lp-step">
              <span className="lp-step-num">01</span>
              <span className="lp-chip lp-chip-blue">
                <PinIcon width="22" height="22" />
              </span>
              <h3>Enter your address</h3>
              <p>Type it in and we draw a map of the streets around your home.</p>
            </article>

            <article className="lp-step is-feature">
              <span className="lp-step-num">02</span>
              <span className="lp-chip lp-chip-amber">
                <SlidersIcon />
              </span>
              <h3>Shape the map</h3>
              <p>Shift and rotate it until it feels like home.</p>
            </article>

            <article className="lp-step">
              <span className="lp-step-num">03</span>
              <span className="lp-chip lp-chip-green">
                <TruckIcon />
              </span>
              <h3>We print and ship it</h3>
              <p>Your mat is printed in Ontario and shipped to your door.</p>
            </article>
          </div>
        </div>
      </section>

      {/* ── Made from your real streets ───────────────────────── */}
      <section className="lp-streets lp-section" aria-labelledby="lp-streets-title">
        <div className="lp-container">
          <div className="lp-section-head">
            <h2 id="lp-streets-title">Made from your real streets</h2>
            <p>
              Every mat is generated from your family&rsquo;s actual address. The roads on it are
              the ones outside your door, so no two mats are the same.
            </p>
          </div>
          <ul className="lp-streets-pins" aria-label="Pins you can add to your mat">
            {STREET_PIN_ICONS.map((pin) => (
              <li key={pin.id} className="lp-streets-pin">
                <img src={pin.src} alt="" width="56" height="56" loading="lazy" />
                <span>{pin.label}</span>
              </li>
            ))}
          </ul>
          <p className="lp-streets-frame">
            You choose what makes the frame. Shift the map so grandma&rsquo;s street or the school
            makes it on.
          </p>
        </div>
      </section>

      {/* ── Materials ─────────────────────────────────────────── */}
      <section className="lp-section" aria-labelledby="lp-features-title">
        <div className="lp-container">
          <div className="lp-section-head">
            <h2 id="lp-features-title">Built to be played on for years</h2>
            <p>
              And to still hang together when they&rsquo;ve outgrown it.
            </p>
          </div>

          <div className="lp-bento">
            <article className="lp-feature lp-feature-safety">
              <div className="lp-feature-text">
                <span className="lp-feature-pill">Child-safe</span>
                <h3 style={{ marginTop: 14 }}>Inks they can put their hands on</h3>
                <p>
                  Every mat is printed with non-toxic, child-safe inks. Fine for babies who still
                  explore the floor with their hands and their mouth.
                </p>
              </div>
              <div className="lp-shield">
                <ShieldIcon />
              </div>
            </article>

            <article className="lp-feature lp-feature-learning">
              <LayersIcon />
              <h3>8mm of cushion</h3>
              <p>Thick enough to be comfortable on hardwood. For kneeling parents as much as kids.</p>
              <span className="lp-feature-pill">Quiet underfoot</span>
            </article>

            <article className="lp-feature lp-feature-durability">
              <h3>Wipes clean</h3>
              <p>Spilled juice and muddy toy wheels come off with a damp cloth.</p>
              <DropIcon />
            </article>

            <article className="lp-feature lp-feature-material">
              <div className="lp-feature-text">
                <h3>Made to stay put and stay bright</h3>
                <p>
                  An anti-slip rubber backing keeps it flat on hardwood and tile. The colour is
                  UV-resistant, so a sunny playroom won&rsquo;t wash it out.
                </p>
              </div>
              <div className="lp-material-badge">
                <MapMarkIcon width="36" height="36" />
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Size options */}
      <section id="sizes" className="lp-size-options lp-map-section lp-map-sizes lp-section" aria-labelledby="lp-size-title">
        <span className="lp-map-parallax-layer" aria-hidden="true" />
        <div className="lp-container">
          <div className="lp-size-grid">
            <div className="lp-size-copy">
              <h2 id="lp-size-title">Two sizes. Both your streets.</h2>
              <p>
                Both use the same map of your neighbourhood, printed with the same care. The only
                question is how much floor you want to give it.
              </p>

              <div className="lp-size-list" aria-label="Available mat sizes">
                {sizeOptions.map((option) => (
                  <article className="lp-size-card" key={option.name}>
                    <strong>{option.name}</strong>
                    <span>
                      {option.size} - {option.price}
                    </span>
                    <p>{option.note}</p>
                  </article>
                ))}
              </div>

              <p className="lp-price-note">
                Shipping included. All prices CAD. Printed and shipped from Ontario.
              </p>
            </div>

            <div className="lp-size-scale" aria-label="Mat size comparison over map background">
              <div className="lp-size-scale-frame lp-size-scale-large">
                <span>60&quot; x 48&quot;</span>
              </div>
              <div className="lp-size-scale-frame lp-size-scale-medium">
                <span>48&quot; x 36&quot;</span>
              </div>
              <div className="lp-size-car-reference" aria-label="Hot Wheels car size reference">
                <img
                  src="/images/hot-wheels-car.png"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                />
                <span>Hot Wheels car size</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Gifting ───────────────────────────────────────────── */}
      <section className="lp-gift lp-section" aria-labelledby="lp-gift-title">
        <div className="lp-container">
          <div className="lp-section-head">
            <h2 id="lp-gift-title">A gift that shows you know where they live</h2>
            <p>
              For grandparents who want the grandkids to know their street too. For the family that
              just moved into their first house. A map of home means more than another toy.
            </p>
          </div>
          <p className="lp-gift-note">
            Every mat ships gift-ready, rolled in a sturdy tube with no invoice inside.
          </p>
        </div>
      </section>

      {/* ── Founder note ──────────────────────────────────────── */}
      <section className="lp-founder lp-section" aria-labelledby="lp-founder-title">
        <div className="lp-container lp-founder-inner">
          <figure className="lp-founder-photo">
            <img
              src={FOUNDER_PHOTO_SRC}
              alt="Luke with his family on the beach"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.hidden = true;
                event.currentTarget.parentElement?.classList.add('is-missing');
              }}
            />
          </figure>
          <div>
            <h2 id="lp-founder-title">A note from the founder</h2>
            <p>
              I&rsquo;m Luke, a dad in Waterdown, Ontario. I made the first one of these for my own
              kids, so the roads they pushed their cars along were the ones outside our window. Now
              I make them for other families&rsquo; streets. Each one is checked by hand before it
              ships.
            </p>
            <p className="lp-founder-sig">- Luke</p>
          </div>
        </div>
      </section>

      {/* ── Guarantee ─────────────────────────────────────────── */}
      <section className="lp-guarantee lp-section" aria-labelledby="lp-guarantee-title">
        <div className="lp-container">
          <div className="lp-guarantee-card">
            <ShieldIcon width="44" height="44" />
            <h2 id="lp-guarantee-title">
              If it isn&rsquo;t beautiful in person, send it back. Full refund.
            </h2>
            <p>We would rather take a mat back than have it sit rolled up in a closet.</p>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="lp-faq lp-section" aria-labelledby="lp-faq-title">
        <div className="lp-container">
          <div className="lp-section-head">
            <h2 id="lp-faq-title">Questions, answered honestly</h2>
          </div>
          <div className="lp-faq-list">
            {faqItems.map((item) => (
              <details className="lp-faq-item" key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="lp-cta-wrap lp-container">
        <div className="lp-cta">
          <h2>Start with your address</h2>
          <p>
            Type it in and see your streets as a mat. Designing takes about two minutes and costs
            nothing.
          </p>
          <AddressForm
            label="Your address"
            value={ctaAddress}
            onChange={setCtaAddress}
            onSubmit={goToDesigner}
            cta="See your neighbourhood"
          />
          <p className="lp-cta-note">All prices CAD. Printed and shipped from Ontario.</p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <div className="lp-footer-brand">
            <Logo size={30} />
          </div>
          <nav aria-label="Footer">
            <a href="#how-it-works">How it Works</a>
            <a href="mailto:hello@hometownplaymats.com">Contact Us</a>
            <a href="mailto:hello@hometownplaymats.com">hello@hometownplaymats.com</a>
          </nav>
        </div>
        <div className="lp-copyright">
          © 2026 <Logo size={16} gap={4} />. Printed in Ontario,
          Canada.
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
