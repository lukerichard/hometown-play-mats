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

// Get cart item for a specific mat
export const getCartItemByMatId = async (userId, matId) => {
  try {
    const cartRef = collection(db, 'cart');
    const q = query(
      cartRef,
      where('userId', '==', userId),
      where('matId', '==', matId)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error getting cart item:', error);
    throw error;
  }
};

// Add item to cart (or update quantity if already exists)
export const addToCart = async (userId, matId, quantity = 1, pricePerUnit) => {
  try {
    // Check if item already exists in cart
    const existingItem = await getCartItemByMatId(userId, matId);

    if (existingItem) {
      // Update quantity of existing item
      const newQuantity = existingItem.quantity + quantity;
      await updateCartQuantity(existingItem.id, newQuantity);
      return existingItem.id;
    } else {
      // Add new item to cart
      const cartRef = collection(db, 'cart');
      const newCartItemRef = doc(cartRef);

      await setDoc(newCartItemRef, {
        userId,
        matId,
        quantity,
        pricePerUnit,
        addedAt: serverTimestamp()
      });

      return newCartItemRef.id;
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

// Remove item from cart
export const removeFromCart = async (cartItemId) => {
  try {
    const cartItemRef = doc(db, 'cart', cartItemId);
    await deleteDoc(cartItemRef);
    return true;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

// Update cart item quantity
export const updateCartQuantity = async (cartItemId, quantity) => {
  try {
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    const cartItemRef = doc(db, 'cart', cartItemId);
    await updateDoc(cartItemRef, {
      quantity
    });

    return true;
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    throw error;
  }
};

// Get all cart items for a user
export const getCartItems = async (userId) => {
  try {
    const cartRef = collection(db, 'cart');
    const q = query(
      cartRef,
      where('userId', '==', userId),
      orderBy('addedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const cartItems = [];

    querySnapshot.forEach((doc) => {
      cartItems.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return cartItems;
  } catch (error) {
    console.error('Error getting cart items:', error);
    throw error;
  }
};

// Clear all items from cart for a user
export const clearCart = async (userId) => {
  try {
    const cartItems = await getCartItems(userId);

    const deletePromises = cartItems.map(item =>
      removeFromCart(item.id)
    );

    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// Calculate cart total
export const calculateCartTotal = (cartItems) => {
  return cartItems.reduce((total, item) => {
    return total + (item.quantity * item.pricePerUnit);
  }, 0);
};
