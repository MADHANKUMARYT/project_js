import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { configureStore, createSlice } from '@reduxjs/toolkit'
import { Provider, useSelector, useDispatch } from 'react-redux'

// --- Sample product data (6 unique plants, 3+ categories) ---
const PRODUCTS = [
  { id: 'p1', name: 'Monstera Deliciosa', price: 799, category: 'Tropical', img: 'https://source.unsplash.com/collection/190727/200x200?plant,monstera' },
  { id: 'p2', name: 'Snake Plant', price: 499, category: 'Low Light', img: 'https://source.unsplash.com/collection/190727/200x200?plant,snake' },
  { id: 'p3', name: 'Fiddle Leaf Fig', price: 1299, category: 'Focal', img: 'https://source.unsplash.com/collection/190727/200x200?plant,fiddle' },
  { id: 'p4', name: 'ZZ Plant', price: 599, category: 'Low Light', img: 'https://source.unsplash.com/collection/190727/200x200?plant,zz' },
  { id: 'p5', name: 'Pothos', price: 299, category: 'Trailing', img: 'https://source.unsplash.com/collection/190727/200x200?plant,pothos' },
  { id: 'p6', name: 'Calathea', price: 899, category: 'Tropical', img: 'https://source.unsplash.com/collection/190727/200x200?plant,calathea' },
]

// --- Redux slice: cart ---
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: {}, // id -> { product, qty }
    addedIds: {}, // id -> true when Add to Cart was clicked (to disable button on listing)
  },
  reducers: {
    addToCart: (state, action) => {
      const p = action.payload
      if (!state.items[p.id]) state.items[p.id] = { product: p, qty: 0 }
      state.items[p.id].qty += 1
      state.addedIds[p.id] = true
    },
    increase: (state, action) => {
      const id = action.payload
      if (state.items[id]) state.items[id].qty += 1
    },
    decrease: (state, action) => {
      const id = action.payload
      if (!state.items[id]) return
      state.items[id].qty -= 1
      if (state.items[id].qty <= 0) {
        delete state.items[id]
        delete state.addedIds[id]
      }
    },
    removeItem: (state, action) => {
      const id = action.payload
      delete state.items[id]
      delete state.addedIds[id]
    },
    clearCart: (state) => {
      state.items = {}
      state.addedIds = {}
    }
  }
})

const { addToCart, increase, decrease, removeItem, clearCart } = cartSlice.actions

const store = configureStore({ reducer: { cart: cartSlice.reducer } })

// --- Header ---
function Header() {
  const items = useSelector(s => s.cart.items)
  const count = Object.values(items).reduce((sum, it) => sum + it.qty, 0)
  return (
    <header className="bg-white shadow p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-2xl font-extrabold">GreenNest</Link>
        <nav className="hidden md:flex gap-4 ml-6">
          <Link to="/products" className="text-sm">Products</Link>
          <Link to="/cart" className="text-sm">Cart</Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/products" className="text-sm md:hidden">Products</Link>
        <Link to="/cart" className="relative px-3 py-1 border rounded flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 7h12l-2-7M16 21a1 1 0 100-2 1 1 0 000 2zM8 21a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
          <span className="text-sm">Cart</span>
          <span className="ml-2 inline-block bg-green-600 text-white rounded-full px-2 text-xs">{count}</span>
        </Link>
      </div>
    </header>
  )
}

// --- Landing Page ---
// NOTE: Removed useNavigate and use Link instead so this component never calls hooks that require Router context outside of it.
function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1524594154902-0a1a7f0c1a3b?auto=format&fit=crop&w=1650&q=80')] bg-cover bg-center">
        <div className="bg-white/80 p-8 rounded shadow max-w-xl text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome to GreenNest</h1>
          <p className="mb-4">We handpick healthy houseplants that thrive in Indian homes — easy care, stylish pots, and fast delivery.</p>
          {/* Use Link instead of useNavigate so this component is safe in any render context */}
          <Link to="/products" className="px-6 py-2 bg-green-600 text-white rounded inline-block">Get Started</Link>
        </div>
      </div>
    </div>
  )
}

// --- Product Listing Page ---
function Products() {
  const dispatch = useDispatch()
  const addedIds = useSelector(s => s.cart.addedIds)

  // Group products by category
  const categories = PRODUCTS.reduce((acc, p) => {
    acc[p.category] ||= []
    acc[p.category].push(p)
    return acc
  }, {})

  return (
    <main className="p-6">
      <h2 className="text-2xl font-bold mb-4">Shop Plants</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(categories).map(([cat, items]) => (
          <section key={cat} className="p-4 border rounded">
            <h3 className="font-semibold mb-3">{cat}</h3>
            <div className="space-y-4">
              {items.map(p => (
                <div key={p.id} className="flex items-center gap-4">
                  <img src={p.img} alt={p.name} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm">₹{p.price}</div>
                  </div>
                  <div>
                    <button
                      className={`px-3 py-1 rounded ${addedIds[p.id] ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-600 text-white'}`}
                      onClick={() => dispatch(addToCart(p))}
                      disabled={!!addedIds[p.id]}
                    >
                      {addedIds[p.id] ? 'Added' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}

// --- Shopping Cart Page ---
function CartPage() {
  const items = useSelector(s => s.cart.items)
  const dispatch = useDispatch()

  const entries = Object.values(items)
  const totalItems = entries.reduce((s, e) => s + e.qty, 0)
  const totalCost = entries.reduce((s, e) => s + e.qty * e.product.price, 0)

  return (
    <main className="p-6">
      <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>
      <div className="mb-4">Total plants: <strong>{totalItems}</strong></div>
      <div className="mb-4">Total cost: <strong>₹{totalCost}</strong></div>

      <div className="space-y-4">
        {entries.length === 0 && <div>Your cart is empty.</div>}
        {entries.map(({ product, qty }) => (
          <div key={product.id} className="flex items-center gap-4 border p-3 rounded">
            <img src={product.img} alt={product.name} className="w-24 h-24 object-cover rounded" />
            <div className="flex-1">
              <div className="font-medium">{product.name}</div>
              <div className="text-sm">Unit price: ₹{product.price}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => dispatch(increase(product.id))} className="px-2 py-1 border rounded">+</button>
              <div className="px-3">{qty}</div>
              <button onClick={() => dispatch(decrease(product.id))} className="px-2 py-1 border rounded">-</button>
            </div>
            <div className="flex flex-col gap-2 ml-4">
              <button onClick={() => dispatch(removeItem(product.id))} className="px-3 py-1 border rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={() => alert('Coming Soon')} className="px-4 py-2 bg-blue-600 text-white rounded">Checkout</button>
        {/* Use Link for navigation to avoid useNavigate outside Router issues */}
        <Link to="/products" className="px-4 py-2 border rounded inline-block">Continue Shopping</Link>
      </div>
    </main>
  )
}

// --- App + Router ---
function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="*" element={<Products />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  )
}

// --- Render ---
const root = document.getElementById('root')
if (root) {
  createRoot(root).render(<App />)
} else {
  
  console.warn('No root element found. If you are running tests, import the App component instead of mounting automatically.')
}

export default App