import { useStorage } from '../../src/react/useStorage';
import { ExampleCard } from '../components/ExampleCard';
import { CodeBlock } from '../components/CodeBlocks';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const products = [
  { id: 1, name: 'Laptop', price: 999, image: '💻' },
  { id: 2, name: 'Phone', price: 699, image: '📱' },
  { id: 3, name: 'Headphones', price: 199, image: '🎧' },
  { id: 4, name: 'Watch', price: 299, image: '⌚' },
  { id: 5, name: 'Tablet', price: 499, image: '📱' },
];

export function ShoppingCart() {
  const [cart, setCart] = useStorage<CartItem[]>('demo.cart', [], { ttl: 3600 });

  const addToCart = (product: (typeof products)[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
    }
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="example-container">
      <h1>Shopping Cart with TTL</h1>
      <p>Cart persists for 1 hour, then automatically expires</p>

      <ExampleCard title="Products">
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">{product.image}</div>
              <h3>{product.name}</h3>
              <p className="product-price">${product.price}</p>
              <button onClick={() => addToCart(product)} className="btn btn-primary btn-sm">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </ExampleCard>

      <ExampleCard title={`Shopping Cart (${itemCount} items)`}>
        {cart.length === 0 ? (
          <p className="empty-state">Your cart is empty</p>
        ) : (
          <>
            <ul className="cart-list">
              {cart.map((item) => (
                <li key={item.id} className="cart-item">
                  <span className="cart-item-image">{item.image}</span>
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p className="cart-item-price">${item.price}</p>
                  </div>
                  <div className="cart-item-quantity">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="btn btn-sm"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="btn btn-sm"
                    >
                      +
                    </button>
                  </div>
                  <div className="cart-item-total">${item.price * item.quantity}</div>
                  <button onClick={() => removeItem(item.id)} className="btn btn-danger btn-sm">
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <div className="cart-summary">
              <div className="cart-total">
                <strong>Total:</strong>
                <strong>${total.toFixed(2)}</strong>
              </div>
              <div className="cart-actions">
                <button onClick={clearCart} className="btn btn-secondary">
                  Clear Cart
                </button>
                <button className="btn btn-primary">Checkout</button>
              </div>
            </div>
          </>
        )}
      </ExampleCard>

      <CodeBlock
        code={`const [cart, setCart] = useStorage<CartItem[]>(
  'cart',
  [],
  { ttl: 3600 } // Expires after 1 hour
);

// Add item
setCart(prev => {
  const existing = prev.find(item => item.id === productId);
  if (existing) {
    return prev.map(item =>
      item.id === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
  }
  return [...prev, newItem];
});`}
      />

      <div className="info-panel">
        <h3>🛒 Features</h3>
        <ul>
          <li>Cart persists across sessions</li>
          <li>Automatic expiration after 1 hour (TTL)</li>
          <li>Handles complex array operations</li>
          <li>Functional updates for safe state changes</li>
        </ul>
      </div>
    </div>
  );
}
