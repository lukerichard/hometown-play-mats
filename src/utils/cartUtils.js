import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { assertShopifyConfigured, getShopifyVariantId, shopifyConfig } from '../config/shopify';
import { getMat } from './matStorage';

const cartCollection = (userId) => collection(db, 'users', userId, 'cart');
const cartDoc = (userId, cartItemId) => doc(db, 'users', userId, 'cart', cartItemId);

const compactPreviewSnapshot = (previewImageUrl) => {
  if (!previewImageUrl || previewImageUrl.startsWith('data:image')) return '';
  return previewImageUrl;
};

export const getCartItemByDesignId = async (userId, designId) => {
  try {
    const q = query(cartCollection(userId), where('designId', '==', designId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const cartItem = querySnapshot.docs[0];
    return {
      id: cartItem.id,
      ...cartItem.data()
    };
  } catch (error) {
    console.error('Error getting cart item:', error);
    throw error;
  }
};

// Backwards-friendly alias for older call sites.
export const getCartItemByMatId = getCartItemByDesignId;

export const addToCart = async (userId, designId, quantity = 1, pricePerUnit, itemData = {}) => {
  try {
    // New cart rows use the design ID, so adding an item is a single atomic
    // write instead of a query followed by a write. Callers can provide a
    // legacy cart row ID while older randomly keyed rows are still present.
    const cartItemId = itemData.existingCartItemId || designId;
    const cartItemRef = cartDoc(userId, cartItemId);

    await setDoc(cartItemRef, {
      designId,
      matId: designId,
      quantity: increment(quantity),
      pricePerUnit,
      ...(itemData.shopifyVariantId !== undefined
        ? { shopifyVariantId: itemData.shopifyVariantId || '' }
        : {}),
      ...(itemData.nameSnapshot !== undefined
        ? { nameSnapshot: itemData.nameSnapshot || '' }
        : {}),
      ...(itemData.previewImageUrlSnapshot !== undefined
        ? { previewImageUrlSnapshot: compactPreviewSnapshot(itemData.previewImageUrlSnapshot) }
        : {}),
      ...(itemData.customPinsSnapshot !== undefined
        ? { customPinsSnapshot: Array.isArray(itemData.customPinsSnapshot) ? itemData.customPinsSnapshot : [] }
        : {}),
      ...(itemData.matSize !== undefined ? { matSize: itemData.matSize || '' } : {}),
      ...(itemData.theme !== undefined ? { theme: itemData.theme || '' } : {}),
      addedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    return cartItemRef.id;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const removeFromCart = async (userId, cartItemId) => {
  try {
    await deleteDoc(cartDoc(userId, cartItemId));
    return true;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const updateCartQuantity = async (userId, cartItemId, quantity) => {
  try {
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    await updateDoc(cartDoc(userId, cartItemId), {
      quantity,
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    throw error;
  }
};

export const getCartItems = async (userId) => {
  try {
    const q = query(cartCollection(userId), orderBy('addedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const cartItems = [];

    querySnapshot.forEach((cartItem) => {
      cartItems.push({
        id: cartItem.id,
        ...cartItem.data()
      });
    });

    return cartItems;
  } catch (error) {
    console.error('Error getting cart items:', error);
    throw error;
  }
};

export const clearCart = async (userId) => {
  try {
    const cartItems = await getCartItems(userId);
    await Promise.all(cartItems.map((item) => removeFromCart(userId, item.id)));
    return true;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

export const calculateCartTotal = (cartItems) => {
  return cartItems.reduce((total, item) => total + (item.quantity * item.pricePerUnit), 0);
};

export const getCustomPinsForCartItem = (mat, item) => (
  mat?.customPins
  || (mat?.customPin ? [mat.customPin] : null)
  || item.customPinsSnapshot
  || []
);

export const buildCartSummaryItem = (item, matsData, { userId = '', matSizes, colorSchemes } = {}) => {
  const designId = item.designId || item.matId;
  const mat = matsData[designId];
  const matSize = mat?.matSize || item.matSize || 'medium';
  const theme = mat?.colorScheme || item.theme || 'pastel';
  const size = matSizes[matSize] || matSizes.medium;
  const themeName = colorSchemes[theme]?.name || theme || 'Custom Theme';

  return {
    userId,
    designId,
    name: mat?.name || item.nameSnapshot || 'Custom Play Mat',
    previewImage: mat?.previewImageUrl || item.previewImageUrlSnapshot || '',
    sizeName: size.name,
    matSize,
    dimensions: size.dimensions,
    themeName,
    address: mat?.address || '',
    showStreetNames: mat?.showStreetNames ?? true,
    showLandmarks: mat?.showLandmarks ?? true,
    showLandmarkNames: mat?.showLandmarkNames ?? true,
    landmarkDensity: mat?.landmarkDensity || 'balanced',
    customPins: getCustomPinsForCartItem(mat, item),
    price: Number(item.pricePerUnit) || size.price,
    quantity: Number(item.quantity) || 1
  };
};

export const buildWaitlistCartItems = (cartItems, matsData) => cartItems.map((item) => {
  const mat = matsData[item.designId || item.matId];

  return {
    designId: item.designId || item.matId,
    name: mat?.name || item.nameSnapshot || 'Custom Play Mat',
    matSize: mat?.matSize || item.matSize || '',
    theme: mat?.colorScheme || item.theme || '',
    quantity: item.quantity,
    pricePerUnit: item.pricePerUnit,
    previewImageUrl: mat?.previewImageUrl || item.previewImageUrlSnapshot || '',
    customPins: getCustomPinsForCartItem(mat, item)
  };
});

const themeLabels = {
  pastel: 'Pastel Park',
  modern: 'Modern Mini',
  classic: 'Classic City',
  muted: 'Muted',
  neon: 'Neon Vibrant'
};

const sizeLabels = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large'
};

export const createShopifyCartFromFirebaseCart = async (userId) => {
  assertShopifyConfigured();

  const cartItems = await getCartItems(userId);
  if (cartItems.length === 0) {
    throw new Error('Your cart is empty.');
  }

  const designs = await Promise.all(
    cartItems.map(async (item) => ({
      item,
      design: await getMat(userId, item.designId || item.matId)
    }))
  );

  const lines = designs.map(({ item, design }) => {
    const merchandiseId = item.shopifyVariantId || getShopifyVariantId(design.matSize || item.matSize);

    if (!merchandiseId) {
      throw new Error(`Missing Shopify variant ID for ${design.matSize || item.matSize || 'mat'}.`);
    }

    return {
      merchandiseId,
      quantity: item.quantity,
      attributes: [
        { key: 'Design', value: design.name || item.nameSnapshot || 'Custom Play Mat' },
        { key: 'Size', value: sizeLabels[design.matSize || item.matSize] || design.matSize || item.matSize || '' },
        { key: 'Theme', value: themeLabels[design.colorScheme || item.theme] || design.colorScheme || item.theme || '' },
        { key: '_designId', value: design.id },
        { key: '_firebaseUid', value: userId },
        { key: '_previewImageUrl', value: design.previewImageUrl || item.previewImageUrlSnapshot || '' }
      ].filter((attribute) => attribute.value !== '')
    };
  });

  const response = await fetch(`https://${shopifyConfig.storeDomain}/api/${shopifyConfig.apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': shopifyConfig.storefrontToken
    },
    body: JSON.stringify({
      query: `
        mutation CreateCart($input: CartInput!) {
          cartCreate(input: $input) {
            cart {
              id
              checkoutUrl
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        input: { lines }
      }
    })
  });

  const payload = await response.json();
  const userErrors = payload.data?.cartCreate?.userErrors || [];

  if (!response.ok || payload.errors?.length || userErrors.length) {
    throw new Error(userErrors[0]?.message || payload.errors?.[0]?.message || 'Failed to create Shopify cart.');
  }

  return payload.data.cartCreate.cart.checkoutUrl;
};
