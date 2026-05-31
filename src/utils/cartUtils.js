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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getMat } from './matStorage';

const cartCollection = (userId) => collection(db, 'users', userId, 'cart');
const cartDoc = (userId, cartItemId) => doc(db, 'users', userId, 'cart', cartItemId);

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
    const existingItem = await getCartItemByDesignId(userId, designId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      await updateCartQuantity(userId, existingItem.id, newQuantity);
      return existingItem.id;
    }

    const newCartItemRef = doc(cartCollection(userId));
    await setDoc(newCartItemRef, {
      designId,
      matId: designId,
      quantity,
      pricePerUnit,
      shopifyVariantId: itemData.shopifyVariantId || '',
      nameSnapshot: itemData.nameSnapshot || '',
      previewImageUrlSnapshot: itemData.previewImageUrlSnapshot || '',
      matSize: itemData.matSize || '',
      theme: itemData.theme || '',
      addedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return newCartItemRef.id;
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

const getShopifyVariantId = (matSize) => {
  const variantMap = {
    small: import.meta.env.VITE_SHOPIFY_SMALL_VARIANT_ID,
    medium: import.meta.env.VITE_SHOPIFY_MEDIUM_VARIANT_ID,
    large: import.meta.env.VITE_SHOPIFY_LARGE_VARIANT_ID
  };

  return variantMap[matSize] || import.meta.env.VITE_SHOPIFY_DEFAULT_VARIANT_ID || '';
};

export const createShopifyCartFromFirebaseCart = async (userId) => {
  const shopDomain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
  const storefrontToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

  if (!shopDomain || !storefrontToken) {
    throw new Error('Shopify is not configured. Add VITE_SHOPIFY_STORE_DOMAIN and VITE_SHOPIFY_STOREFRONT_TOKEN.');
  }

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
        { key: 'designId', value: design.id },
        { key: 'firebaseUid', value: userId },
        { key: 'matName', value: design.name || item.nameSnapshot || 'Custom Play Mat' },
        { key: 'matSize', value: design.matSize || item.matSize || '' },
        { key: 'theme', value: design.colorScheme || item.theme || '' },
        { key: 'previewImageUrl', value: design.previewImageUrl || item.previewImageUrlSnapshot || '' }
      ].filter((attribute) => attribute.value !== '')
    };
  });

  const response = await fetch(`https://${shopDomain}/api/2026-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontToken
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
