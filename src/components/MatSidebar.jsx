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
    <div style={{
      width: '340px',
      background: '#f8fafb',
      padding: '20px',
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 82px)'
    }}>
      <h2 style={{
        color: '#3A3A3A',
        marginBottom: '16px',
        fontSize: '22px',
        fontWeight: '800',
        letterSpacing: '-0.5px'
      }}>
        Customize Your Mat
      </h2>

      {/* Mat Size Section */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{
          fontSize: '11px',
          fontWeight: '700',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '10px'
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
              padding: '12px',
              background: matSize === key ? 'rgba(74, 93, 78, 0.2)' : '#f8fafb',
              border: `2px solid ${matSize === key ? '#4A5D4E' : 'rgba(121, 151, 127, 0.5)'}`,
              borderRadius: '10px',
              marginBottom: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: matSize === key ? '0 4px 20px rgba(74, 93, 78, 0.4)' : 'none'
            }}
          >
            <input
              type="radio"
              checked={matSize === key}
              onChange={() => setMatSize(key)}
              style={{
                marginRight: '10px',
                width: '16px',
                height: '16px',
                cursor: 'pointer',
                accentColor: '#4A5D4E'
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: '700',
                color: '#3A3A3A',
                marginBottom: '2px',
                fontSize: '14px'
              }}>
                {size.name}
              </div>
              <div style={{
                fontSize: '11px',
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
      <div style={{ marginBottom: '18px' }}>
        <div style={{
          fontSize: '11px',
          fontWeight: '700',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '10px'
        }}>
          Rotation
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <button
            onClick={rotateLeft}
            style={{
              flex: 1,
              padding: '10px',
              background: '#f8fafb',
              border: '2px solid rgba(121, 151, 127, 0.6)',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '700',
              color: '#475569',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px'
            }}
          >
            ↺ Left
          </button>
          <div style={{
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #C78880 0%, #A86E67 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            minWidth: '60px',
            letterSpacing: '-0.5px'
          }}>
            {rotation}°
          </div>
          <button
            onClick={rotateRight}
            style={{
              flex: 1,
              padding: '10px',
              background: '#f8fafb',
              border: '2px solid rgba(121, 151, 127, 0.6)',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '700',
              color: '#475569',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px'
            }}
          >
            ↻ Right
          </button>
        </div>

        {/* Rotation Slider */}
        <div style={{ marginTop: '10px' }}>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={rotation}
            onChange={(e) => setRotation(parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: `linear-gradient(to right, #C78880 0%, #C78880 ${(rotation / 360) * 100}%, #e5e7eb ${(rotation / 360) * 100}%, #e5e7eb 100%)`,
              outline: 'none',
              cursor: 'pointer',
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
          />
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        style={{
          width: '100%',
          padding: '14px',
          background: 'linear-gradient(135deg, #C78880 0%, #A86E67 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontSize: '15px',
          fontWeight: '800',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '0.3px',
          boxShadow: '0 4px 20px rgba(121, 151, 127, 0.5)'
        }}
      >
        🏎️ Create My Play Mat!
      </button>
      <div style={{
        marginTop: '8px',
        fontSize: '11px',
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
