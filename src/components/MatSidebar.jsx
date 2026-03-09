const MatSidebar = ({
  matSize,
  setMatSize,
  rotation,
  setRotation,
  rotateLeft,
  rotateRight,
  matSizes,
  onGenerate
}) => {
  const sizeOptions = Object.entries(matSizes);

  return (
    <div
      className="w-[340px] bg-white/70 backdrop-blur-sm border-r-2 border-border overflow-y-auto"
      style={{
        maxHeight: 'calc(100vh - 82px)',
        fontFamily: "'DM Sans', 'Poppins', sans-serif",
      }}
    >
      <div className="p-5">
        <h2 className="text-lg font-bold tracking-tight text-text mb-5"
          style={{ fontFamily: "'Poppins', 'DM Sans', sans-serif" }}>
          Customize Your Mat
        </h2>

        {/* Mat Size Section */}
        <div className="mb-6">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">
            Mat Size
          </div>
          <div className="flex flex-col gap-2.5">
            {sizeOptions.map(([key, size]) => {
              const isActive = matSize === key;
              return (
                <div
                  key={key}
                  onClick={() => setMatSize(key)}
                  className={`
                    flex items-center p-3.5 rounded-xl cursor-pointer transition-all duration-200
                    border-2
                    ${isActive
                      ? 'border-primary bg-sky-light/40'
                      : 'border-border bg-white hover:border-primary/40 hover:translate-x-1'
                    }
                  `}
                  style={{
                    boxShadow: isActive
                      ? '0 0 0 4px rgba(61, 174, 245, 0.15)'
                      : '0 1px 3px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  {/* Radio circle */}
                  <div className={`
                    w-[18px] h-[18px] rounded-full border-2 mr-3 flex items-center justify-center shrink-0 transition-all duration-200
                    ${isActive ? 'border-primary' : 'border-border-dark'}
                  `}>
                    {isActive && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-text mb-0.5">
                      {size.name}
                    </div>
                    <div className="text-[11px] text-text-light font-medium">
                      {size.dimensions}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rotation Section */}
        <div className="mb-6">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">
            Rotation
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={rotateLeft}
              className="flex-1 py-3 bg-white border-2 border-border rounded-full cursor-pointer font-bold text-text-light text-sm transition-all duration-200 hover:border-primary hover:text-primary hover:-translate-y-0.5"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              ↺ Left
            </button>
            <div className="text-center text-lg font-bold min-w-[60px] text-primary">
              {rotation}°
            </div>
            <button
              onClick={rotateRight}
              className="flex-1 py-3 bg-white border-2 border-border rounded-full cursor-pointer font-bold text-text-light text-sm transition-all duration-200 hover:border-primary hover:text-primary hover:-translate-y-0.5"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              ↻ Right
            </button>
          </div>

          {/* Rotation Slider */}
          <div className="mt-3">
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full h-1.5 rounded-full outline-none cursor-pointer"
              style={{
                WebkitAppearance: 'none',
                appearance: 'none',
                background: `linear-gradient(to right, #3DAEF5 0%, #3DAEF5 ${(rotation / 360) * 100}%, #E0DDD5 ${(rotation / 360) * 100}%, #E0DDD5 100%)`,
              }}
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={onGenerate}
          className="w-full py-4 text-white border-none rounded-full text-base font-bold cursor-pointer transition-all duration-200 hover:-translate-y-1"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            background: '#3DAEF5',
            boxShadow: '0 0 0 4px rgba(61, 174, 245, 0.25)',
          }}
        >
          Create My Play Mat
        </button>
        <p className="mt-2.5 text-[11px] text-text-muted text-center font-medium">
          Save your neighborhood for toy car adventures
        </p>
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3DAEF5;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 1px 4px rgba(61, 174, 245, 0.4);
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3DAEF5;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 1px 4px rgba(61, 174, 245, 0.4);
        }
      `}</style>
    </div>
  );
};

export default MatSidebar;
