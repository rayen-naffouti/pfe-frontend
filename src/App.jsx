import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "@/components/ThemeProvider"
import AppRoutes from "./routes"

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
