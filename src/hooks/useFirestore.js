import { useState, useEffect } from 'react';
import {
  collection,
  query,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Custom hook for real-time Firestore data
 * @param {string} collectionName - The Firestore collection name
 * @param {array} queryConstraints - Array of Firestore query constraints (where, orderBy, etc.)
 * @returns {object} - { data, loading, error }
 */
export const useFirestore = (collectionName, queryConstraints = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionName) {
      setLoading(false);
      return;
    }

    try {
      // Create query reference
      const collectionRef = collection(db, collectionName);
      const q = queryConstraints.length > 0
        ? query(collectionRef, ...queryConstraints)
        : collectionRef;

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const documents = [];
          snapshot.forEach((doc) => {
            documents.push({
              id: doc.id,
              ...doc.data()
            });
          });

          setData(documents);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Firestore error:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      // Cleanup listener on unmount
      return () => unsubscribe();
    } catch (err) {
      console.error('useFirestore error:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [collectionName, JSON.stringify(queryConstraints)]);

  return { data, loading, error };
};

export default useFirestore;
