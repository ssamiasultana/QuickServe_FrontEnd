import Cookies from "js-cookie";
import { useEffect, useState } from "react";

import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = Cookies.get("auth_token");
    const savedUser = Cookies.get("user");

    if (savedToken) {
      setToken(savedToken);
    }
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing user data from cookie:", error);
        Cookies.remove("user");
      }
    }
  }, []);

  const login = (token, userData) => {
    setToken(token);
    setUser(userData);
    Cookies.set("auth_token", token, {
      expires: 7,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    Cookies.set("user", JSON.stringify(userData), {
      expires: 7,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    Cookies.remove("auth_token");
    Cookies.remove("user");
  };

  const updateUser = (userData) => {
    setUser(userData);
    Cookies.set("user", JSON.stringify(userData), {
      expires: 7,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
