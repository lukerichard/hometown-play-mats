const MatSidebar = ({
  matSize,
  setMatSize,
  rotation,
  setRotation,
  rotateLeft,
  rotateRight,
  colorScheme,
  setColorScheme,
  matSizes,
  colorSchemes,
  onGenerate
}) => {
  const sizeOptions = Object.entries(matSizes);
  const colorOptions = Object.entries(colorSchemes);

  const colorGradients = {
    classic: 'linear-gradient(135deg, #10b981, #34d399, #fbbf24, #f87171)',
    muted: 'linear-gradient(135deg, #64748b, #94a3b8, #cbd5e1, #78716c)',
    neon: 'linear-gradient(135deg, #ec4899, #f59e0b, #06b6d4, #a855f7)'
  };

  return (
    <div style={{
      width: '360px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(16, 185, 129, 0.15)',
      borderRadius: '24px',
      padding: '32px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 130px)'
    }}>
      <h2 style={{
        color: '#1e293b',
        marginBottom: '24px',
        fontSize: '28px',
        fontWeight: '800',
        letterSpacing: '-0.5px'
      }}>
        Customize Your Mat
      </h2>

      <div style={{
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: '12px',
        padding: '14px',
        fontSize: '14px',
        color: '#047857',
        marginBottom: '24px',
        fontWeight: '500'
      }}>
        Enter an address to center your custom neighborhood play mat
      </div>

      {/* Mat Size Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '700',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '1.2px',
          marginBottom: '16px'
        }}>
          Mat Size
        </div>
        {sizeOptions.map(([key, size]) => (
          <div
            key={key}
            onClick={() => setMatSize(key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '18px',
              background: matSize === key ? 'rgba(16, 185, 129, 0.08)' : '#f8fafb',
              border: `2px solid ${matSize === key ? '#10b981' : 'rgba(16, 185, 129, 0.15)'}`,
              borderRadius: '14px',
              marginBottom: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: matSize === key ? '0 4px 20px rgba(16, 185, 129, 0.2)' : 'none'
            }}
          >
            <input
              type="radio"
              checked={matSize === key}
              onChange={() => setMatSize(key)}
              style={{
                marginRight: '14px',
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                accentColor: '#10b981'
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '4px',
                fontSize: '16px'
              }}>
                {size.name}
              </div>
              <div style={{
                fontSize: '13px',
                color: '#64748b',
                fontWeight: '500'
              }}>
                {size.dimensions}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rotation Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '700',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '1.2px',
          marginBottom: '16px'
        }}>
          Rotation
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={rotateLeft}
            style={{
              flex: 1,
              padding: '14px',
              background: '#f8fafb',
              border: '2px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '700',
              color: '#475569',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px'
            }}
          >
            ↺ Left
          </button>
          <div style={{
            textAlign: 'center',
            fontSize: '22px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            minWidth: '70px',
            letterSpacing: '-0.5px'
          }}>
            {rotation}°
          </div>
          <button
            onClick={rotateRight}
            style={{
              flex: 1,
              padding: '14px',
              background: '#f8fafb',
              border: '2px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '700',
              color: '#475569',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px'
            }}
          >
            ↻ Right
          </button>
        </div>

        {/* Rotation Slider */}
        <div style={{ marginTop: '16px' }}>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={rotation}
            onChange={(e) => setRotation(parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '4px',
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${(rotation / 360) * 100}%, #e5e7eb ${(rotation / 360) * 100}%, #e5e7eb 100%)`,
              outline: 'none',
              cursor: 'pointer',
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
          />
        </div>
      </div>

      {/* Color Scheme Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '700',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '1.2px',
          marginBottom: '16px'
        }}>
          Color Scheme
        </div>
        {colorOptions.map(([key, scheme]) => (
          <div
            key={key}
            onClick={() => setColorScheme(key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '18px',
              background: colorScheme === key ? 'rgba(16, 185, 129, 0.08)' : '#f8fafb',
              border: `2px solid ${colorScheme === key ? '#10b981' : 'rgba(16, 185, 129, 0.15)'}`,
              borderRadius: '14px',
              marginBottom: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: colorScheme === key ? '0 4px 20px rgba(16, 185, 129, 0.2)' : 'none'
            }}
          >
            <input
              type="radio"
              checked={colorScheme === key}
              onChange={() => setColorScheme(key)}
              style={{
                marginRight: '14px',
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                accentColor: '#10b981'
              }}
            />
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              marginRight: '14px',
              border: '2px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              background: colorGradients[key]
            }} />
            <div style={{
              fontWeight: '700',
              color: '#1e293b',
              fontSize: '16px'
            }}>
              {scheme.name}
            </div>
          </div>
        ))}
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        style={{
          width: '100%',
          padding: '18px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '14px',
          fontSize: '17px',
          fontWeight: '800',
          cursor: 'pointer',
          marginTop: '16px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '0.3px',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
        }}
      >
        🏎️ Create My Play Mat!
      </button>
      <div style={{
        marginTop: '12px',
        fontSize: '13px',
        color: '#64748b',
        textAlign: 'center',
        fontWeight: '500'
      }}>
        Save your neighborhood for toy car adventures
      </div>
    </div>
  );
};

export default MatSidebar;
