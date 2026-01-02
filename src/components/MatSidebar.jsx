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
      background: '#FAFAFA',
      padding: '24px',
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 82px)',
      borderRight: '2px solid #E5E7EB'
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
              background: matSize === key ? '#F0F4F0' : 'white',
              border: `2px solid ${matSize === key ? '#7A8A6E' : '#D4C4AA'}`,
              borderRadius: '12px',
              marginBottom: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: matSize === key ? '0 2px 8px rgba(122, 138, 110, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              if (matSize !== key) {
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.background = '#F5F0E8';
              }
            }}
            onMouseLeave={(e) => {
              if (matSize !== key) {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.background = 'white';
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
                accentColor: '#7A8A6E'
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
              border: '2px solid #D4C4AA',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '700',
              color: '#636E72',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#C88B70';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = '#C88B70';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#636E72';
              e.currentTarget.style.borderColor = '#D4C4AA';
            }}
          >
            ↺ Left
          </button>
          <div style={{
            textAlign: 'center',
            fontSize: '22px',
            fontWeight: '800',
            color: '#7A8A6E',
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
              border: '2px solid #D4C4AA',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '700',
              color: '#636E72',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#C88B70';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = '#C88B70';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#636E72';
              e.currentTarget.style.borderColor = '#D4C4AA';
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
              background: `linear-gradient(to right, #7A8A6E 0%, #7A8A6E ${(rotation / 360) * 100}%, #e5e7eb ${(rotation / 360) * 100}%, #e5e7eb 100%)`,
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
          background: '#7A8A6E',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '0.3px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#5C6E54';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#7A8A6E';
          e.currentTarget.style.transform = 'translateY(0)';
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
