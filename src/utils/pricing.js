// Canonical mat sizes, Canadian tax table, and shared currency/order-total helpers.
// Internal keys stay `large`/`medium` to match Firestore-persisted matSize values.
export const MAT_SIZES = {
  large: {
    key: 'large',
    name: 'The Hometown',
    label: 'The Hometown',
    dimensions: '60" x 48"',
    description: '60" x 48" - Best for playrooms',
    width: 3,
    height: 2,
    price: 259
  },
  medium: {
    key: 'medium',
    name: 'The Neighbourhood',
    label: 'The Neighbourhood',
    dimensions: '48" x 36"',
    description: '48" x 36" - Perfect for bedroom',
    width: 2,
    height: 1.5,
    price: 189
  }
};

export const DEFAULT_MAT_SIZE = 'medium';

export const getMatSize = (matSize) => MAT_SIZES[matSize] || MAT_SIZES[DEFAULT_MAT_SIZE];

export const CANADA_PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' }
];

// Combined federal/harmonized rate only (no separate BC/SK/MB PST line, QST folded into the QC rate).
export const CANADA_TAX_RATES = {
  AB: { rate: 0.05, label: 'GST', percentLabel: '5%' },
  BC: { rate: 0.05, label: 'GST', percentLabel: '5%' },
  MB: { rate: 0.05, label: 'GST', percentLabel: '5%' },
  NB: { rate: 0.15, label: 'HST', percentLabel: '15%' },
  NL: { rate: 0.15, label: 'HST', percentLabel: '15%' },
  NS: { rate: 0.14, label: 'HST', percentLabel: '14%' },
  NT: { rate: 0.05, label: 'GST', percentLabel: '5%' },
  NU: { rate: 0.05, label: 'GST', percentLabel: '5%' },
  ON: { rate: 0.13, label: 'HST', percentLabel: '13%' },
  PE: { rate: 0.15, label: 'HST', percentLabel: '15%' },
  QC: { rate: 0.14975, label: 'GST + QST (combined)', percentLabel: '14.975%' },
  SK: { rate: 0.05, label: 'GST', percentLabel: '5%' },
  YT: { rate: 0.05, label: 'GST', percentLabel: '5%' }
};

export const getProvinceName = (code) => (
  CANADA_PROVINCES.find((province) => province.code === code)?.name || ''
);

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export const calculateOrderTotals = (subtotal, provinceCode = null) => {
  const safeSubtotal = round2(Number(subtotal) || 0);
  const taxInfo = provinceCode ? CANADA_TAX_RATES[provinceCode] : null;

  if (!taxInfo) {
    return {
      subtotal: safeSubtotal,
      shipping: 0,
      taxRate: null,
      taxLabel: null,
      taxAmount: 0,
      total: safeSubtotal,
      provinceCode: null
    };
  }

  const taxAmount = round2(safeSubtotal * taxInfo.rate);

  return {
    subtotal: safeSubtotal,
    shipping: 0,
    taxRate: taxInfo.rate,
    taxLabel: taxInfo.label,
    taxAmount,
    total: round2(safeSubtotal + taxAmount),
    provinceCode
  };
};

const currencyFormatter = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' });

export const formatCurrency = (amount) => currencyFormatter.format(Number(amount) || 0);

export const CANADA_POSTAL_CODE_PATTERN = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/;

export const normalizePostalCode = (postalCode) => {
  const compact = (postalCode || '').replace(/\s+/g, '').toUpperCase();
  return compact.length === 6 ? `${compact.slice(0, 3)} ${compact.slice(3)}` : compact;
};
