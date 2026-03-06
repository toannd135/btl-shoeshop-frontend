import AllRoute from "./components/AllRoute";
import { useEffect, useState } from "react";
import { refreshToken } from "./services/authService";
import { setAccessToken, clearAccessToken, setCurrentUser, clearCurrentUser } from "./utils/tokenStore";

function App() {
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await refreshToken();
        const { accessToken, user } = res.data;
        setAccessToken(accessToken);
        setCurrentUser(user);
        window.dispatchEvent(new Event("loginSuccess"));
      } catch (error) {
        clearAccessToken();
        clearCurrentUser();
      } finally {
        setIsAuthInitialized(true);
      }
    };

    initAuth();
  }, []);
  if (!isAuthInitialized) return null;
  return (
    <>
      <AllRoute />
    </>
  );
}

export default App;
