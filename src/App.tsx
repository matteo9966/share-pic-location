// import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { routeDefinitions } from './config/routes'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <Router>
      <Header />
      <Routes>
        {routeDefinitions.map((route) => (
          <Route key={route.path} path={route.path} element={<route.element />} />
        ))}
      </Routes>
    </Router>
  )
}

export default App
