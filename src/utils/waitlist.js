import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateWaitlistEmail = (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!emailPattern.test(normalizedEmail)) {
    throw new Error('Enter a valid email address.');
  }

  return normalizedEmail;
};

export const joinLaunchWaitlist = async ({
  email,
  userId = '',
  source = 'checkout',
  cartItems = [],
  selectedItem = null
}) => {
  if (!db) {
    throw new Error('Waitlist is unavailable until Firebase is configured.');
  }

  const normalizedEmail = validateWaitlistEmail(email);

  await addDoc(collection(db, 'launchWaitlist'), {
    email: normalizedEmail,
    userId,
    source,
    selectedItem,
    cartItems,
    createdAt: serverTimestamp()
  });

  return normalizedEmail;
};
