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
      width: '360px',
      background: 'linear-gradient(180deg, #FFF9F0 0%, #FFEAA7 100%)',
      padding: '24px',
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 82px)',
      borderRight: '3px solid rgba(255, 107, 107, 0.2)'
    }}>
      <h2 style={{
        color: '#2D3436',
        marginBottom: '24px',
        fontSize: '26px',
        fontWeight: '800',
        letterSpacing: '-0.5px'
      }}>
        Customize Your Mat
      </h2>

      {/* Mat Size Section */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '800',
          color: '#636E72',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          marginBottom: '14px'
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
              padding: '16px',
              background: matSize === key ? 'rgba(255, 107, 107, 0.15)' : 'white',
              border: `3px solid ${matSize === key ? '#FF6B6B' : 'rgba(255, 107, 107, 0.2)'}`,
              borderRadius: '16px',
              marginBottom: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: matSize === key ? '0 6px 25px rgba(255, 107, 107, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              if (matSize !== key) {
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (matSize !== key) {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
              }
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
                accentColor: '#FF6B6B'
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: '800',
                color: '#2D3436',
                marginBottom: '4px',
                fontSize: '16px'
              }}>
                {size.name}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#636E72',
                fontWeight: '600'
              }}>
                {size.dimensions}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rotation Section */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '800',
          color: '#636E72',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          marginBottom: '14px'
        }}>
          Rotation
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button
            onClick={rotateLeft}
            style={{
              flex: 1,
              padding: '14px',
              background: 'white',
              border: '3px solid rgba(255, 107, 107, 0.3)',
              borderRadius: '16px',
              cursor: 'pointer',
              fontWeight: '800',
              color: '#636E72',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#636E72';
              e.currentTarget.style.borderColor = 'rgba(255, 107, 107, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ↺ Left
          </button>
          <div style={{
            textAlign: 'center',
            fontSize: '22px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)',
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
              background: 'white',
              border: '3px solid rgba(255, 107, 107, 0.3)',
              borderRadius: '16px',
              cursor: 'pointer',
              fontWeight: '800',
              color: '#636E72',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#636E72';
              e.currentTarget.style.borderColor = 'rgba(255, 107, 107, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ↻ Right
          </button>
        </div>

        {/* Rotation Slider */}
        <div style={{ marginTop: '14px' }}>
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
              background: `linear-gradient(to right, #FF6B6B 0%, #FFD93D ${(rotation / 360) * 100}%, #e5e7eb ${(rotation / 360) * 100}%, #e5e7eb 100%)`,
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
          padding: '20px',
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '18px',
          fontSize: '18px',
          fontWeight: '800',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '0.3px',
          boxShadow: '0 6px 25px rgba(255, 107, 107, 0.4)',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 107, 107, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(255, 107, 107, 0.4)';
        }}
      >
        Create My Play Mat!
      </button>
      <div style={{
        marginTop: '12px',
        fontSize: '12px',
        color: '#636E72',
        textAlign: 'center',
        fontWeight: '600'
      }}>
        Save your neighborhood for toy car adventures
      </div>
    </div>
  );
};

export default MatSidebar;
