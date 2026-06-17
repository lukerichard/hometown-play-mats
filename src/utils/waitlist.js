import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const joinLaunchWaitlist = async ({ email, userId = '', source = 'checkout', cartItems = [] }) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!emailPattern.test(normalizedEmail)) {
    throw new Error('Enter a valid email address.');
  }

  if (!db) {
    throw new Error('Waitlist is unavailable until Firebase is configured.');
  }

  await addDoc(collection(db, 'launchWaitlist'), {
    email: normalizedEmail,
    userId,
    source,
    cartItems,
    createdAt: serverTimestamp()
  });

  return normalizedEmail;
};
