import { useEffect, useState } from 'react';
import { getMat } from '../utils/matStorage';

export const useCartMats = (userId, cartItems) => {
  const [matsData, setMatsData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchMats = async () => {
      if (!userId || cartItems.length === 0) {
        if (!cancelled) {
          setMatsData({});
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const mats = {};

      try {
        await Promise.all(cartItems.map(async (item) => {
          const designId = item.designId || item.matId;
          try {
            mats[designId] = await getMat(userId, designId);
          } catch (error) {
            console.error(`Error fetching mat ${designId}:`, error);
            mats[designId] = null;
          }
        }));
      } catch (error) {
        console.error('Error fetching mats:', error);
      }

      if (!cancelled) {
        setMatsData(mats);
        setLoading(false);
      }
    };

    fetchMats();

    return () => {
      cancelled = true;
    };
  }, [cartItems, userId]);

  return { matsData, loading };
};
