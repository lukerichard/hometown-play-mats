import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFirestore } from '../../hooks/useFirestore';
import { useCartMats } from '../../hooks/useCartMats';
import { calculateCartTotal, buildWaitlistCartItems } from '../../utils/cartUtils';
import {
  MAT_SIZES,
  CANADA_PROVINCES,
  CANADA_TAX_RATES,
  calculateOrderTotals,
  formatCurrency,
  CANADA_POSTAL_CODE_PATTERN,
  normalizePostalCode,
  getProvinceName
} from '../../utils/pricing';
import { joinLaunchWaitlist, validateWaitlistEmail } from '../../utils/waitlist';
import { trackEvent } from '../../utils/analytics';
import Logo from '../Logo';

const font = "'DM Sans', 'Poppins', sans-serif";
const fontDisplay = "'Poppins', 'DM Sans', sans-serif";

const inputStyle = {
  width: '100%',
  padding: '12px 18px',
  border: '2.5px solid #E0DDD5',
  borderRadius: '12px',
  fontSize: '15px',
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
  color: '#2D2D2D'
};

const labelStyle = { display: 'block', fontSize: '14px', fontWeight: '700', color: '#2D2D2D', marginBottom: '8px' };
const fieldWrapStyle = { marginBottom: '20px' };

const handleFocus = (event) => {
  event.currentTarget.style.borderColor = '#3DAEF5';
  event.currentTarget.style.boxShadow = '0 0 0 4px rgba(61, 174, 245, 0.25)';
};

const handleBlur = (event) => {
  event.currentTarget.style.borderColor = '#E0DDD5';
  event.currentTarget.style.boxShadow = 'none';
};

const cardStyle = {
  background: 'white', borderRadius: '20px', padding: '32px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.10)'
};

const Checkout = () => {
  const { currentUser } = useAuth();
  const { data: cartItems, loading: loadingCart } = useFirestore(
    currentUser?.uid ? `users/${currentUser.uid}/cart` : null
  );
  const { matsData, loading: loadingMats } = useCartMats(currentUser?.uid, cartItems);

  const [email, setEmail] = useState(currentUser?.email || '');
  const [fullName, setFullName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reservation, setReservation] = useState(null);

  const loading = loadingCart || loadingMats;

  if (!currentUser?.uid) {
    return <Navigate to="/cart" replace />;
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#ffffff', padding: '100px 20px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px', height: '50px',
            border: '4px solid #E0DDD5', borderTop: '4px solid #3DAEF5',
            borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px'
          }} />
          <p style={{ color: '#5A5A5A', fontSize: '16px', fontWeight: '600' }}>Loading your order...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!reservation && cartItems.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const subtotal = calculateCartTotal(cartItems);
  const orderTotals = calculateOrderTotals(subtotal, provinceCode || null);
  const taxInfo = orderTotals.provinceCode ? CANADA_TAX_RATES[orderTotals.provinceCode] : null;

  const validate = () => {
    if (!email.trim()) return 'Enter your email address.';
    try {
      validateWaitlistEmail(email);
    } catch (validationError) {
      return validationError.message;
    }
    if (!fullName.trim() || !address1.trim() || !city.trim() || !provinceCode || !postalCode.trim()) {
      return 'Please fill in all required shipping fields.';
    }
    if (!CANADA_POSTAL_CODE_PATTERN.test(postalCode.trim())) {
      return 'Enter a valid Canadian postal code, like A1A 1A1.';
    }
    return '';
  };

  const handleReserve = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setSubmitting(true);

    const shippingAddress = {
      fullName: fullName.trim(),
      address1: address1.trim(),
      address2: address2.trim(),
      city: city.trim(),
      provinceCode,
      provinceName: getProvinceName(provinceCode),
      postalCode: normalizePostalCode(postalCode),
      phone: phone.trim()
    };

    try {
      const savedEmail = await joinLaunchWaitlist({
        email,
        userId: currentUser.uid,
        source: 'checkout-reserve',
        cartItems: buildWaitlistCartItems(cartItems, matsData),
        shippingAddress,
        orderTotals,
        contact: {
          email,
          displayName: currentUser.displayName || '',
          phoneNumber: phone.trim() || currentUser.phoneNumber || '',
          isAnonymous: Boolean(currentUser.isAnonymous)
        }
      });

      setReservation({ email: savedEmail, shippingAddress, orderTotals });
      trackEvent('Waitlist Joined', {
        source: 'checkout',
        item_count: cartItems.length,
        cart_total: orderTotals.total,
        province: provinceCode,
      });
    } catch (submitError) {
      setError(submitError.message || 'Could not reserve your spot. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (reservation) {
    return (
      <div style={{ minHeight: '100vh', background: '#ffffff', padding: '100px 20px 40px', fontFamily: font }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={cardStyle}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#3DAEF5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Checkout Opens Soon
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#2D2D2D', margin: '8px 0 16px', fontFamily: fontDisplay }}>
              The first run of 20 is almost ready.
            </h1>
            <p style={{ fontSize: '15px', color: '#5A5A5A', lineHeight: 1.6, marginBottom: '24px' }}>
              Your spot is saved at <strong style={{ color: '#2D2D2D' }}>{reservation.email}</strong>. No payment was taken
              today. We will email you when <Logo size={16} gap={4} /> starts taking orders.
            </p>

            <div style={{ borderTop: '2px solid #E0DDD5', paddingTop: '20px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#2D2D2D', marginBottom: '10px' }}>Shipping to</h2>
              <p style={{ fontSize: '14px', color: '#5A5A5A', lineHeight: 1.6, margin: 0 }}>
                {reservation.shippingAddress.fullName}<br />
                {reservation.shippingAddress.address1}
                {reservation.shippingAddress.address2 ? <>, {reservation.shippingAddress.address2}</> : null}<br />
                {reservation.shippingAddress.city}, {reservation.shippingAddress.provinceName} {reservation.shippingAddress.postalCode}
              </p>
            </div>

            <div style={{ borderTop: '2px solid #E0DDD5', paddingTop: '20px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#5A5A5A' }}>Subtotal</span>
                <span style={{ fontSize: '14px', color: '#2D2D2D', fontWeight: '700' }}>{formatCurrency(reservation.orderTotals.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#5A5A5A' }}>Shipping</span>
                <span style={{ fontSize: '14px', color: '#2e7d32', fontWeight: '700' }}>Included</span>
              </div>
              {reservation.orderTotals.taxRate != null && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#5A5A5A' }}>Tax</span>
                  <span style={{ fontSize: '14px', color: '#2D2D2D', fontWeight: '700' }}>{formatCurrency(reservation.orderTotals.taxAmount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '2px solid #E0DDD5' }}>
                <span style={{ fontSize: '16px', color: '#2D2D2D', fontWeight: '800' }}>Total</span>
                <span style={{ fontSize: '20px', color: '#3DAEF5', fontWeight: '800' }}>{formatCurrency(reservation.orderTotals.total)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/" style={{ flex: 1 }}>
                <button style={{
                  width: '100%', padding: '14px', background: '#3DAEF5', color: 'white',
                  border: 'none', borderRadius: '999px', fontSize: '15px', fontWeight: '700',
                  cursor: 'pointer', fontFamily: font
                }}>
                  Continue Shopping
                </button>
              </Link>
              <Link to="/cart" style={{ flex: 1 }}>
                <button style={{
                  width: '100%', padding: '14px', background: 'white',
                  border: '2.5px solid #E0DDD5', borderRadius: '999px', fontSize: '15px',
                  fontWeight: '700', cursor: 'pointer', fontFamily: font, color: '#2D2D2D'
                }}>
                  Back to Cart
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', padding: '100px 20px 40px', fontFamily: font }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#2D2D2D', marginBottom: '32px', fontFamily: fontDisplay }}>
          Checkout
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          <form style={cardStyle} onSubmit={handleReserve}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#2D2D2D', marginBottom: '20px', fontFamily: font }}>
              Shipping details
            </h2>

            <div style={fieldWrapStyle}>
              <label style={labelStyle}>Email address</label>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>

            <div style={fieldWrapStyle}>
              <label style={labelStyle}>Full name</label>
              <input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)}
                placeholder="Jane Smith" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>

            <div style={fieldWrapStyle}>
              <label style={labelStyle}>Address line 1</label>
              <input type="text" value={address1} onChange={(event) => setAddress1(event.target.value)}
                placeholder="123 Main Street" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>

            <div style={fieldWrapStyle}>
              <label style={labelStyle}>Address line 2 (optional)</label>
              <input type="text" value={address2} onChange={(event) => setAddress2(event.target.value)}
                placeholder="Apartment, suite, etc." style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>City</label>
                <input type="text" value={city} onChange={(event) => setCity(event.target.value)}
                  placeholder="Waterdown" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
              </div>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Province</label>
                <select value={provinceCode} onChange={(event) => setProvinceCode(event.target.value)}
                  style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}>
                  <option value="">Select province</option>
                  {CANADA_PROVINCES.map((province) => (
                    <option key={province.code} value={province.code}>{province.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Postal code</label>
                <input type="text" value={postalCode} onChange={(event) => setPostalCode(event.target.value)}
                  placeholder="A1A 1A1" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
              </div>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Phone (optional)</label>
                <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)}
                  placeholder="(555) 555-5555" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
              </div>
            </div>

            {error && (
              <div style={{
                marginBottom: '20px', padding: '12px 16px', background: '#fde8e8',
                borderLeft: '5px solid #E84545', borderRadius: '12px', color: '#b71c1c',
                fontSize: '14px', fontWeight: '600'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', padding: '16px', background: submitting ? '#B0A999' : '#3DAEF5', color: 'white',
                border: 'none', borderRadius: '999px', fontSize: '16px', fontWeight: '700',
                cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: font,
                boxShadow: submitting ? 'none' : '0 0 0 4px rgba(61, 174, 245, 0.25)', transition: 'all 0.2s'
              }}
            >
              {submitting ? 'Reserving...' : 'Reserve My Spot'}
            </button>
          </form>

          <div style={{ ...cardStyle, position: 'sticky', top: '100px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#2D2D2D', marginBottom: '20px', fontFamily: font }}>
              Your order
            </h2>

            <div style={{ marginBottom: '20px' }}>
              {cartItems.map((item) => {
                const designId = item.designId || item.matId;
                const mat = matsData[designId];
                const matSize = mat?.matSize || item.matSize || 'medium';
                const size = MAT_SIZES[matSize] || MAT_SIZES.medium;
                const name = mat?.name || item.nameSnapshot || 'Custom Play Mat';
                const linePrice = item.quantity * item.pricePerUnit;

                return (
                  <div key={item.id} style={{
                    display: 'flex', justifyContent: 'space-between', gap: '12px',
                    padding: '12px 0', borderBottom: '1px solid #E0DDD5'
                  }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#2D2D2D', fontSize: '15px' }}>{name}</div>
                      <div style={{ fontSize: '13px', color: '#5A5A5A' }}>{size.name} &middot; Qty {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: '700', color: '#2D2D2D', fontSize: '15px', whiteSpace: 'nowrap' }}>
                      {formatCurrency(linePrice)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '15px', color: '#5A5A5A', fontWeight: '600' }}>Subtotal</span>
              <span style={{ fontSize: '15px', color: '#2D2D2D', fontWeight: '700' }}>{formatCurrency(orderTotals.subtotal)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '15px', color: '#5A5A5A', fontWeight: '600' }}>Shipping</span>
              <span style={{ fontSize: '15px', color: '#2e7d32', fontWeight: '700' }}>Included</span>
            </div>

            {taxInfo ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '15px', color: '#5A5A5A', fontWeight: '600' }}>
                  Tax
                  <div style={{ fontSize: '12px', color: '#8A8A8A', fontWeight: '500' }}>
                    {taxInfo.label} {taxInfo.percentLabel} &middot; {getProvinceName(orderTotals.provinceCode)}
                  </div>
                </span>
                <span style={{ fontSize: '15px', color: '#2D2D2D', fontWeight: '700' }}>{formatCurrency(orderTotals.taxAmount)}</span>
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: '#8A8A8A', marginBottom: '12px' }}>
                Tax appears once you select a province.
              </p>
            )}

            <div style={{
              borderTop: '2px solid #E0DDD5', marginTop: '16px', paddingTop: '16px',
              display: 'flex', justifyContent: 'space-between', marginBottom: '20px'
            }}>
              <span style={{ fontSize: '18px', color: '#2D2D2D', fontWeight: '800' }}>Total</span>
              <span style={{ fontSize: '24px', color: '#3DAEF5', fontWeight: '800' }}>{formatCurrency(orderTotals.total)}</span>
            </div>

            <Link to="/cart">
              <button style={{
                width: '100%', padding: '14px', background: 'white',
                border: '2.5px solid #E0DDD5', borderRadius: '999px', fontSize: '15px',
                fontWeight: '700', cursor: 'pointer', fontFamily: font, color: '#2D2D2D'
              }}>
                Back to Cart
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
