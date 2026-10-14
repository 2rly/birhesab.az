import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface FavoritesContextType {
  favorites: Set<string>;
  toggle: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: new Set(),
  toggle: () => {},
  isFavorite: () => false,
});

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.has(id),
    [favorites]
  );

  return (
    <FavoritesContext.Provider value={{ favorites, toggle, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
