import {
  useState
} from "react";

import { AuthContext } from "./authContextValue";

export const AuthProvider =
  ({ children }) => {

    const [user, setUser] =
      useState(() => {
        const savedUser =
          localStorage.getItem("user");

        return savedUser
          ? JSON.parse(savedUser)
          : null;
      });

    
    const login = (userData) => {
      localStorage.setItem(
        "user",
        JSON.stringify(userData)
      );

      setUser(userData);

};

const logout = () => {

  localStorage.removeItem(
    "token"
  );
  localStorage.removeItem(
      "user"
    );

  setUser(null);
};

    return (
      <AuthContext.Provider
        value={{
        user,
        login,
        logout
      }}
      >
        {children}
      </AuthContext.Provider>
    );
  };
