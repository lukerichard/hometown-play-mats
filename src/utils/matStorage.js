import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

const designsCollection = (userId) => collection(db, 'users', userId, 'designs');
const designDoc = (userId, designId) => doc(db, 'users', userId, 'designs', designId);

const uploadPreviewImage = async (userId, designId, previewImageUrl) => {
  if (!storage || !previewImageUrl?.startsWith('data:image')) {
    return previewImageUrl || '';
  }

  try {
    const imageRef = ref(storage, `users/${userId}/design-previews/${designId}.png`);
    await uploadString(imageRef, previewImageUrl, 'data_url');
    return getDownloadURL(imageRef);
  } catch (error) {
    console.warn('Preview image upload failed; saving mat without preview image.', error);
    return '';
  }
};

// Save a new design to a user's subcollection.
export const saveMat = async (userId, matData, status = 'saved') => {
  try {
    const newMatRef = doc(designsCollection(userId));
    const previewImageUrl = await uploadPreviewImage(userId, newMatRef.id, matData.previewImageUrl);

    await setDoc(newMatRef, {
      ...matData,
      previewImageUrl,
      status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return newMatRef.id;
  } catch (error) {
    console.error('Error saving mat:', error);
    throw error;
  }
};

// Update an existing design.
export const updateMat = async (userId, matId, updates) => {
  try {
    const previewImageUrl = updates.previewImageUrl
      ? await uploadPreviewImage(userId, matId, updates.previewImageUrl)
      : undefined;

    await updateDoc(designDoc(userId, matId), {
      ...updates,
      ...(previewImageUrl !== undefined ? { previewImageUrl } : {}),
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error updating mat:', error);
    throw error;
  }
};

// Delete a design.
export const deleteMat = async (userId, matId) => {
  try {
    await deleteDoc(designDoc(userId, matId));
    return true;
  } catch (error) {
    console.error('Error deleting mat:', error);
    throw error;
  }
};

// Get a single design by ID.
export const getMat = async (userId, matId) => {
  try {
    const matSnap = await getDoc(designDoc(userId, matId));

    if (matSnap.exists()) {
      return {
        id: matSnap.id,
        ...matSnap.data()
      };
    }

    throw new Error('Mat not found');
  } catch (error) {
    console.error('Error getting mat:', error);
    throw error;
  }
};

// Get all designs for a user.
export const getUserMats = async (userId) => {
  try {
    const q = query(designsCollection(userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const mats = [];

    querySnapshot.forEach((mat) => {
      mats.push({
        id: mat.id,
        ...mat.data()
      });
    });

    return mats;
  } catch (error) {
    console.error('Error getting user mats:', error);
    throw error;
  }
};
