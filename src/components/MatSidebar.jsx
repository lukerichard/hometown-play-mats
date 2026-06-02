const MatSidebar = ({
  matSize,
  setMatSize,
  matName,
  setMatName,
  matSizes,
  showStreetNames,
  setShowStreetNames
}) => {
  const sizeOptions = Object.entries(matSizes);

  return (
    <aside className="flex flex-col gap-3">
      <section className="builder-card">
        <h2 className="builder-card-title">
          <span className="builder-card-icon icon-edit" aria-hidden="true" />
          Personalize
        </h2>

        <label className="builder-label" htmlFor="mat-title">
          Child's Name or Title
        </label>
        <input
          id="mat-title"
          type="text"
          value={matName}
          onChange={(event) => setMatName(event.target.value)}
          placeholder="Leo's Little London"
          className="builder-input"
        />

        <label className="street-toggle">
          <span>
            <strong>Show Street Names</strong>
            <small>Recommended for discovery play</small>
          </span>
          <input
            type="checkbox"
            checked={showStreetNames}
            onChange={(event) => setShowStreetNames(event.target.checked)}
          />
        </label>
      </section>

      <section className="builder-card">
        <h2 className="builder-card-title">
          <span className="builder-card-icon icon-size" aria-hidden="true" />
          Select Size
        </h2>

        <div className="flex flex-col gap-2">
          {sizeOptions.map(([key, size]) => {
            const isActive = matSize === key;

            return (
              <button
                key={key}
                type="button"
                className={`size-row ${isActive ? 'is-active' : ''}`}
                onClick={() => setMatSize(key)}
              >
                <span>
                  <strong>{size.label}</strong>
                  <small>{size.description}</small>
                </span>
                <strong>${size.price.toFixed(2)}</strong>
              </button>
            );
          })}
        </div>
      </section>
    </aside>
  );
};

export default MatSidebar;
