import { useEffect } from "react";
import { useAuthStore } from "./modules/iam/application/stores/auth.store";
import { AppRouter } from "./router";

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <AppRouter />;
}

export default App;
