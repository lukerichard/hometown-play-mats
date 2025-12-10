import { useState, useEffect, useRef } from 'react';

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
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const colorGradients = {
    classic: 'linear-gradient(135deg, #10b981, #34d399, #fbbf24, #f87171)',
    muted: 'linear-gradient(135deg, #64748b, #94a3b8, #cbd5e1, #78716c)',
    neon: 'linear-gradient(135deg, #ec4899, #f59e0b, #06b6d4, #a855f7)'
  };

  const handleColorSelect = (key) => {
    setColorScheme(key);
    setColorDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setColorDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{
      width: '340px',
      background: '#f8fafb',
      padding: '20px',
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 82px)'
    }}>
      <h2 style={{
        color: '#1e293b',
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
              background: matSize === key ? 'rgba(16, 185, 129, 0.08)' : '#f8fafb',
              border: `2px solid ${matSize === key ? '#10b981' : 'rgba(16, 185, 129, 0.15)'}`,
              borderRadius: '10px',
              marginBottom: '8px',
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
                marginRight: '10px',
                width: '16px',
                height: '16px',
                cursor: 'pointer',
                accentColor: '#10b981'
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: '700',
                color: '#1e293b',
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
              border: '2px solid rgba(16, 185, 129, 0.2)',
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
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
              border: '2px solid rgba(16, 185, 129, 0.2)',
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
      <div ref={dropdownRef} style={{ marginBottom: '18px', position: 'relative' }}>
        <div style={{
          fontSize: '11px',
          fontWeight: '700',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '10px'
        }}>
          Color Scheme
        </div>

        {/* Selected Option Display */}
        <div
          onClick={() => setColorDropdownOpen(!colorDropdownOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            background: 'white',
            border: '2px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative'
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            marginRight: '10px',
            border: '2px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            background: colorGradients[colorScheme]
          }} />
          <div style={{
            fontWeight: '700',
            color: '#1e293b',
            fontSize: '14px',
            flex: 1
          }}>
            {colorSchemes[colorScheme].name}
          </div>
          <div style={{
            fontSize: '18px',
            color: '#64748b',
            transition: 'transform 0.3s',
            transform: colorDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </div>
        </div>

        {/* Dropdown Options */}
        {colorDropdownOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: 'white',
            border: '2px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '10px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            overflow: 'hidden'
          }}>
            {colorOptions.map(([key, scheme]) => (
              <div
                key={key}
                onClick={() => handleColorSelect(key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  cursor: 'pointer',
                  borderBottom: key !== colorOptions[colorOptions.length - 1][0] ? '1px solid rgba(16, 185, 129, 0.1)' : 'none',
                  transition: 'background 0.2s',
                  background: colorScheme === key ? 'rgba(16, 185, 129, 0.08)' : 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = colorScheme === key ? 'rgba(16, 185, 129, 0.08)' : 'transparent'}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  marginRight: '10px',
                  border: '2px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  background: colorGradients[key]
                }} />
                <div style={{
                  fontWeight: '700',
                  color: '#1e293b',
                  fontSize: '14px'
                }}>
                  {scheme.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        style={{
          width: '100%',
          padding: '14px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontSize: '15px',
          fontWeight: '800',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '0.3px',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
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
