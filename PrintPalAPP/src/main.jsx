import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { CategoryImagesProvider } from './context/CategoryImagesContext.jsx'
import { ItemsProvider } from './context/ItemsContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CategoryImagesProvider>
        <ItemsProvider>
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </ItemsProvider>
      </CategoryImagesProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
