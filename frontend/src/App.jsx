import { BrowserRouter } from 'react-router-dom'
import {MainRoute} from './pages/main.route'
import AppContext from './context/context'
import {Loading} from './components/Loading'
import {Alert} from './components/Alert'

import './App.css'

function App() {
  
  return (
    <>
      <AppContext>
          <Loading/>
          <BrowserRouter>
              <MainRoute />
          </BrowserRouter>
          <Alert/>
      </AppContext>
    </>
    )
}

export default App
