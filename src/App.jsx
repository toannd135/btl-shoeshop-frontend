import AllRoute from "./components/AllRoute";
import { useEffect, useState } from "react";
import { refreshToken } from "./services/authService";
import { setAccessToken, clearAccessToken, getAccessToken } from "./utils/tokenStore";

function App() {
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await refreshToken();
        const { accessToken } = res.data;
        setAccessToken(accessToken);
      } catch (error) {
        clearAccessToken();
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
