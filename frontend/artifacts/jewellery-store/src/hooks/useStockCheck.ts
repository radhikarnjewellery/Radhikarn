import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Fetches fresh stock for a list of product IDs.
 * Returns a map of productId -> current stock (0 = out of stock).
 */
export function useStockCheck(productIds: string[]) {
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (productIds.length === 0) { setChecked(true); return; }

    let cancelled = false;
    Promise.all(
      productIds.map(id =>
        fetch(`${API_URL}/api/products/${id}`)
          .then(r => r.ok ? r.json() : null)
          .catch(() => null)
      )
    ).then(results => {
      if (cancelled) return;
      const map: Record<string, number> = {};
      results.forEach((p, i) => {
        if (p) map[productIds[i]] = p.stock ?? 0;
      });
      setStockMap(map);
      setChecked(true);
    });

    return () => { cancelled = true; };
  }, [productIds.join(",")]);

  const isOutOfStock = (id: string) => checked && stockMap[id] !== undefined && stockMap[id] === 0;
  const getStock = (id: string) => stockMap[id] ?? null;

  return { stockMap, isOutOfStock, getStock, checked };
}
