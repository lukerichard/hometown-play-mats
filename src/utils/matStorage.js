import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Save a new mat to Firestore
export const saveMat = async (userId, matData) => {
  try {
    // Create a new document with auto-generated ID
    const matsRef = collection(db, 'savedMats');
    const newMatRef = doc(matsRef);

    await setDoc(newMatRef, {
      ...matData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return newMatRef.id;
  } catch (error) {
    console.error('Error saving mat:', error);
    throw error;
  }
};

// Update an existing mat
export const updateMat = async (matId, updates) => {
  try {
    const matRef = doc(db, 'savedMats', matId);

    await updateDoc(matRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error updating mat:', error);
    throw error;
  }
};

// Delete a mat
export const deleteMat = async (matId) => {
  try {
    const matRef = doc(db, 'savedMats', matId);
    await deleteDoc(matRef);
    return true;
  } catch (error) {
    console.error('Error deleting mat:', error);
    throw error;
  }
};

// Get a single mat by ID
export const getMat = async (matId) => {
  try {
    const matRef = doc(db, 'savedMats', matId);
    const matSnap = await getDoc(matRef);

    if (matSnap.exists()) {
      return {
        id: matSnap.id,
        ...matSnap.data()
      };
    } else {
      throw new Error('Mat not found');
    }
  } catch (error) {
    console.error('Error getting mat:', error);
    throw error;
  }
};

// Get all mats for a user
export const getUserMats = async (userId) => {
  try {
    const matsRef = collection(db, 'savedMats');
    const q = query(
      matsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const mats = [];

    querySnapshot.forEach((doc) => {
      mats.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return mats;
  } catch (error) {
    console.error('Error getting user mats:', error);
    throw error;
  }
};
