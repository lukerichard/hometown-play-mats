import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

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

const CapIcon = (props) => (
  <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}>
    <path d="M22 9 12 5 2 9l10 4 10-4Z" />
    <path d="M6 11v5c0 1 2.7 3 6 3s6-2 6-3v-5" />
  </svg>
);

const DropIcon = (props) => (
  <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}>
    <path d="M12 2.7 6.3 9a8 8 0 1 0 11.4 0L12 2.7Z" />
  </svg>
);

const CheckIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12 2.5 2.5 4.5-5" />
  </svg>
);

const MapMarkIcon = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" {...stroke} {...props}>
    <path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3Z" />
    <path d="M9 3v15M15 6v15" />
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="m12 2 2.9 6 6.6.6-5 4.4 1.5 6.5L12 16.9 5.9 19.4 7.4 13l-5-4.4 6.6-.6L12 2Z" />
  </svg>
);

const Stars = () => (
  <div className="lp-stars" aria-label="Rated 5 out of 5 stars">
    {Array.from({ length: 5 }).map((_, i) => (
      <StarIcon key={i} />
    ))}
  </div>
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

const testimonials = [
  {
    quote:
      "Leo absolutely loves seeing 'our house' on the mat. He drives his wooden car to the playground we visit every Saturday. It's so special.",
    name: 'Sarah M.',
    location: 'Portland, OR',
    color: '#f5a623',
    initial: 'S',
  },
  {
    quote:
      "The quality is beyond what I expected. Thick, durable, and easy to clean. Best gift we've ever bought for our playroom.",
    name: 'David K.',
    location: 'Brooklyn, NY',
    color: '#2f6fe0',
    initial: 'D',
  },
  {
    quote:
      'We used it to teach our 4-year-old our address and the way to Grandma’s house. Educational and fun at the same time!',
    name: 'Elena R.',
    location: 'Austin, TX',
    color: '#22c55e',
    initial: 'E',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [heroAddress, setHeroAddress] = useState('');
  const [ctaAddress, setCtaAddress] = useState('');

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
      <section className="lp-hero lp-container" aria-labelledby="lp-hero-title">
        <div className="lp-hero-grid">
          <div>
            <span className="lp-badge">New Concept</span>
            <h1 id="lp-hero-title">
              Turn your neighborhood into a <span className="lp-accent">toy</span>
            </h1>
            <p className="lp-hero-copy">
              Imagine your child’s favorite park, their school, and your own street turned into a
              beautiful, durable playmat. Simply enter your address to generate a custom-mapped
              world for endless adventures.
            </p>

            <AddressForm
              label="Your home address"
              value={heroAddress}
              onChange={setHeroAddress}
              onSubmit={goToDesigner}
              cta="Create Your Mat"
            />

            <div className="lp-trust">
              <div className="lp-avatars" aria-hidden="true">
                <span style={{ background: '#f5a623' }}>JO</span>
                <span style={{ background: '#22c55e' }}>MS</span>
                <span style={{ background: '#2f6fe0' }}>AK</span>
              </div>
              <p>Joined by 2,000+ happy parents</p>
            </div>
          </div>

          <div className="lp-hero-visual">
            <img
              className="lp-hero-product-image"
              src="/images/play-mat-hero.png"
              alt="Custom neighborhood play mat with its corner rolled up to show the textured backing"
            />
          </div>
        </div>
      </section>

      {/* ── Steps ─────────────────────────────────────────────── */}
      <section id="how-it-works" className="lp-steps lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <h2>Your Adventure, 3 Steps Away</h2>
            <p>
              Creating a world for your child shouldn’t be hard. Our simple process handles the
              cartography, while you handle the fun.
            </p>
          </div>

          <div className="lp-step-grid">
            <article className="lp-step">
              <span className="lp-step-num">01</span>
              <span className="lp-chip lp-chip-blue">
                <PinIcon width="22" height="22" />
              </span>
              <h3>Pin Your World</h3>
              <p>Enter your address and we’ll pull real street layouts from your local neighborhood.</p>
            </article>

            <article className="lp-step is-feature">
              <span className="lp-step-num">02</span>
              <span className="lp-chip lp-chip-amber">
                <SlidersIcon />
              </span>
              <h3>Make it Playful</h3>
              <p>Add a customized playground, choose your colors, and label your favorite local spots.</p>
            </article>

            <article className="lp-step">
              <span className="lp-step-num">03</span>
              <span className="lp-chip lp-chip-green">
                <TruckIcon />
              </span>
              <h3>Shipped with Love</h3>
              <p>We print your custom mat on premium material and ship it straight to your playroom.</p>
            </article>
          </div>
        </div>
      </section>

      {/* ── Feature bento ─────────────────────────────────────── */}
      <section className="lp-section" aria-labelledby="lp-features-title">
        <div className="lp-container">
          <div className="lp-section-head">
            <h2 id="lp-features-title">Designed for Real Play</h2>
          </div>

          <div className="lp-bento">
            <article className="lp-feature lp-feature-safety">
              <div className="lp-feature-text">
                <span className="lp-feature-pill">Safety First</span>
                <h3 style={{ marginTop: 14 }}>100% Non-Toxic &amp; Safe</h3>
                <p>
                  Every mat is BPA-free, hypoallergenic, and crafted with child-safe vegetable inks.
                  Soft enough for crawlers, tough enough for toddlers.
                </p>
              </div>
              <div className="lp-shield">
                <ShieldIcon />
              </div>
            </article>

            <article className="lp-feature lp-feature-learning">
              <CapIcon />
              <h3>Learning through Map Play</h3>
              <p>Develop spatial awareness and community recognition from a young age.</p>
              <span className="lp-feature-pill">Curriculum Inspired</span>
            </article>

            <article className="lp-feature lp-feature-durability">
              <h3>Wipe-Clean Durability</h3>
              <p>Accidents happen. Our mats are waterproof and scrub-ready for any spill.</p>
              <DropIcon />
            </article>

            <article className="lp-feature lp-feature-material">
              <div className="lp-feature-text">
                <h3>High-Quality Material</h3>
                <ul className="lp-check-list">
                  <li><CheckIcon /> 8mm thickness for comfort</li>
                  <li><CheckIcon /> Anti-slip rubber backing</li>
                  <li><CheckIcon /> UV-resistant colors</li>
                </ul>
              </div>
              <div className="lp-material-badge">
                <MapMarkIcon width="36" height="36" />
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────── */}
      <section className="lp-testimonials lp-section" aria-labelledby="lp-quotes-title">
        <div className="lp-container">
          <div className="lp-section-head">
            <h2 id="lp-quotes-title">What Parents are Saying</h2>
          </div>

          <div className="lp-quote-grid">
            {testimonials.map((t) => (
              <article className="lp-quote" key={t.name}>
                <Stars />
                <blockquote>“{t.quote}”</blockquote>
                <div className="lp-quote-author">
                  <span style={{ background: t.color }}>{t.initial}</span>
                  <div>
                    <strong>{t.name}</strong>
                    <small>{t.location}</small>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="lp-cta-wrap lp-container">
        <div className="lp-cta">
          <h2>Ready to Map Your Neighborhood?</h2>
          <p>Join thousands of families turning their corners of the world into a playground.</p>
          <AddressForm
            label="Your address"
            value={ctaAddress}
            onChange={setCtaAddress}
            onSubmit={goToDesigner}
            cta="Get Started"
          />
          <p className="lp-cta-note">No credit card required to design. Starting at $89.</p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <div className="lp-footer-brand">
            <span className="lp-footer-mark">
              <MapMarkIcon />
            </span>
            Hometown Play Mats
          </div>
          <nav aria-label="Footer">
            <a href="#how-it-works">How it Works</a>
            <a href="/cart">Contact Us</a>
            <a href="/cart">Privacy Policy</a>
            <a href="/cart">Terms of Service</a>
            <a href="/cart">Shipping Info</a>
          </nav>
        </div>
        <div className="lp-copyright">
          © 2026 Hometown Play Mats. Handcrafted with love for your little explorers.
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
