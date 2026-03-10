import {BrowserRouter, Routes, Route} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Start from "./pages/start";
import Game from "./pages/game";

function App() {

  const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Start />}/>
            <Route path="/game" element={<Game />}/>
            <Route path="*" element={<Start />}/> {/*create an */}
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </>
  )
}

export default App
