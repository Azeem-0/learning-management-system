import { Skeleton } from "@/components/ui/skeleton";
import { initialSignInFormData, initialSignUpFormData } from "@/config";
import { checkAuthService, loginService, registerService } from "@/services";
import { createContext, useContext, useEffect, useState } from "react";
import { nContext } from "../notification-context";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {

  const { notify } = useContext(nContext);

  const [signInFormData, setSignInFormData] = useState(initialSignInFormData);
  const [signUpFormData, setSignUpFormData] = useState(initialSignUpFormData);
  const [auth, setAuth] = useState({
    authenticate: false,
    user: null,
  });
  const [loading, setLoading] = useState(true);

  async function handleRegisterUser(event) {
    event.preventDefault();
    const data = await registerService(signUpFormData);
    console.log(data, "data");

    if (data.success) {
      localStorage.setItem(
        "accessToken",
        JSON.stringify(data.data.accessToken)
      );
      notify("Registration successful");
    } else {
      notify("Registration failed");
    }
  }

  async function handleLoginUser(event) {
    event.preventDefault();

    try {
      const data = await loginService(signInFormData);
      console.log(data, "data");

      if (data.success) {
        localStorage.setItem(
          "accessToken",
          JSON.stringify(data.data.accessToken)
        );
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
        notify("Login successful");
      } else {
        setAuth({
          authenticate: false,
          user: null,
        });
        notify("Login failed");
      }
    } catch (error) {
      notify(error?.response?.data?.message);
      console.error("Error logging in:", error);
    }
  }

  //check auth user

  async function checkAuthUser() {
    try {
      const data = await checkAuthService();
      if (data.success) {
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
        setLoading(false);
      } else {
        setAuth({
          authenticate: false,
          user: null,
        });
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      if (!error?.response?.data?.success) {
        setAuth({
          authenticate: false,
          user: null,
        });
        setLoading(false);
      }
    }
  }

  function resetCredentials() {
    setAuth({
      authenticate: false,
      user: null,
    });
    notify("Logout successful");
  }

  useEffect(() => {
    checkAuthUser();
  }, []);

  console.log(auth, "gf");

  return (
    <AuthContext.Provider
      value={{
        signInFormData,
        setSignInFormData,
        signUpFormData,
        setSignUpFormData,
        handleRegisterUser,
        handleLoginUser,
        auth,
        resetCredentials,
      }}
    >
      {loading ? <Skeleton /> : children}
    </AuthContext.Provider>
  );
}
