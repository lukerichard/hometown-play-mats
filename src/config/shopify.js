const PLACEHOLDER_VALUES = new Set([
  'your-store.myshopify.com',
  'your_storefront_access_token',
  'gid://shopify/ProductVariant/0000000001',
  'gid://shopify/ProductVariant/0000000002',
  'gid://shopify/ProductVariant/0000000003'
]);

const readEnv = (key) => {
  const value = import.meta.env[key]?.trim() || '';
  return PLACEHOLDER_VALUES.has(value) ? '' : value;
};

export const shopifyConfig = {
  storeDomain: readEnv('VITE_SHOPIFY_STORE_DOMAIN'),
  storefrontToken: readEnv('VITE_SHOPIFY_STOREFRONT_TOKEN'),
  apiVersion: readEnv('VITE_SHOPIFY_API_VERSION') || '2026-04',
  variants: {
    small: readEnv('VITE_SHOPIFY_SMALL_VARIANT_ID'),
    medium: readEnv('VITE_SHOPIFY_MEDIUM_VARIANT_ID'),
    large: readEnv('VITE_SHOPIFY_LARGE_VARIANT_ID'),
    default: readEnv('VITE_SHOPIFY_DEFAULT_VARIANT_ID')
  }
};

export const getShopifyVariantId = (matSize) => {
  return shopifyConfig.variants[matSize] || shopifyConfig.variants.default || '';
};

export const getShopifyConfigurationIssues = () => {
  const issues = [];

  if (!shopifyConfig.storeDomain) {
    issues.push('VITE_SHOPIFY_STORE_DOMAIN');
  }

  if (!shopifyConfig.storefrontToken) {
    issues.push('VITE_SHOPIFY_STOREFRONT_TOKEN');
  }

  if (!shopifyConfig.variants.small) {
    issues.push('VITE_SHOPIFY_SMALL_VARIANT_ID');
  }

  if (!shopifyConfig.variants.medium) {
    issues.push('VITE_SHOPIFY_MEDIUM_VARIANT_ID');
  }

  if (!shopifyConfig.variants.large) {
    issues.push('VITE_SHOPIFY_LARGE_VARIANT_ID');
  }

  return issues;
};

export const assertShopifyConfigured = () => {
  const issues = getShopifyConfigurationIssues();

  if (issues.length > 0) {
    throw new Error(`Shopify is not configured yet. Add valid values for: ${issues.join(', ')}.`);
  }
};
