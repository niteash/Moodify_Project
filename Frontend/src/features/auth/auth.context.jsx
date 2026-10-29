import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  register as registerApi,
  login as loginApi,
  getMe as getMeApi,
  logout as logoutApi,
} from "../../services/auth.api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getMe = useCallback(async () => {
    try {
      const response = await getMeApi();
      setUser(response.user ?? null);
      return response;
    } catch (error) {
      setUser(null);
      throw error;
    }
  }, []);

  useEffect(() => {
    let active = true;

    getMeApi()
      .then((response) => {
        if (active) {
          setUser(response.user ?? null);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const register = async (credentials) => {
    setLoading(true);

    try {
      const response = await registerApi(credentials);

      if (response.user) {
        setUser(response.user);
      }

      return response;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);

    try {
      const response = await loginApi(credentials);

      if (!response.success || !response.user) {
        throw new Error(response.message || "Login failed.");
      }

      setUser(response.user);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);

    try {
      await logoutApi();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        register,
        login,
        getMe,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }

  return context;
};
