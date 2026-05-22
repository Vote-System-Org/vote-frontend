import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../api/axios';
import type { Electeur } from '../types';

interface AuthContextType {
  user: Electeur | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (
    username: string,
    password: string,
    captcha_key: string,
    captcha_value: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<Electeur | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }

    // Vérifier si admin depuis le token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.is_staff) {
        setIsAdmin(true);
        setUser({
          id: payload.user_id,
          matricule: 'ADMIN',
          nom: 'Admin',
          prenom: '',
          email: '',
          filiere: '',
          niveau: '',
          statut: 'ELIGIBLE',
          a_vote: false,
          date_vote: null,
          created_at: '',
        });
        setLoading(false);
        return;
      }
    } catch {
      // token invalide
    }

    api.get('/auth/profil/')
      .then((response) => setUser(response.data))
      .catch(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (
    username: string,
    password: string,
    captcha_key: string,
    captcha_value: string
  ) => {
    const response = await api.post('/auth/login/', {
      username,
      password,
      captcha_key,
      captcha_value,
    });

    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    const payload = JSON.parse(atob(access.split('.')[1]));
    setIsAdmin(payload.is_staff || false);

    if (!payload.is_staff) {
      const profil = await api.get('/auth/profil/');
      setUser(profil.data);
    } else {
      setUser({
        id: payload.user_id,
        matricule: 'ADMIN',
        nom: 'Admin',
        prenom: '',
        email: '',
        filiere: '',
        niveau: '',
        statut: 'ELIGIBLE',
        a_vote: false,
        date_vote: null,
        created_at: '',
      });
    }
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      await api.post('/auth/logout/', { refresh });
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setIsAdmin(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin,
      loading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}