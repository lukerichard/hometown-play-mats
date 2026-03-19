import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <main className="landing" aria-labelledby="hero-title">
      <section className="hero-card" role="region" aria-label="Hero">
        <span className="hero-badge">Family-made • Premium print quality</span>
        <p className="hero-kicker">Custom Hometown Play Mats</p>
        <h1 id="hero-title">Turn your favorite streets into a play mat they’ll use every day.</h1>
        <p className="hero-copy">
          Create a personalized neighborhood map in minutes with clear roads, parks, and landmarks kids can recognize.
        </p>

        <div className="hero-actions" role="group" aria-label="Primary actions">
          <Link className="hero-btn hero-btn-primary" to="/create">Create Your Mat</Link>
          <Link className="hero-btn hero-btn-secondary" to="/signup">Start Free Account</Link>
        </div>

        <p className="hero-trust">No design skills needed • Secure checkout • Printed in 7–10 business days</p>
      </section>

      <section className="steps" aria-label="How it works">
        <article className="step-card">
          <p className="step-label">Step 1</p>
          <h2>Map It</h2>
          <p>Search your address and choose the exact area to include.</p>
        </article>
        <article className="step-card">
          <p className="step-label">Step 2</p>
          <h2>Customize</h2>
          <p>Pick your size, visual style, and neighborhood details.</p>
        </article>
        <article className="step-card">
          <p className="step-label">Step 3</p>
          <h2>Preview &amp; Order</h2>
          <p>Review your mat and check out with confidence.</p>
        </article>
      </section>
    </main>
  );
};

export default LandingPage;
