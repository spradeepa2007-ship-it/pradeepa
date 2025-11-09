import { useState, useEffect } from 'react';
import { ShoppingCart, Wallet, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, MenuItem, OrderItem } from '../lib/supabase';

type StudentDashboardProps = {
  onNavigate: (page: string, data?: any) => void;
};

export default function StudentDashboard({ onNavigate }: StudentDashboardProps) {
  const { user, signOut, refreshUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<'breakfast' | 'lunch' | 'breaktime' | 'dinner'>('breakfast');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [showBalance, setShowBalance] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'NetBanking' | 'Card' | 'Wallet'>('UPI');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMenuItems();
  }, [selectedCategory]);

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category', selectedCategory)
      .eq('available', true);

    if (error) {
      console.error('Error fetching menu items:', error);
    } else {
      setMenuItems(data || []);
    }
  };

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((i) => i.id === item.id);
    if (existingItem) {
      setCart(cart.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      setCart([...cart, { id: item.id, name: item.name, price: item.price, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: number) => {
    const existingItem = cart.find((i) => i.id === id);
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i)));
    } else {
      setCart(cart.filter((i) => i.id !== id));
    }
  };

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const placeOrder = async () => {
    if (!user || cart.length === 0) return;

    setLoading(true);
    setMessage('');

    const totalAmount = getTotalPrice();
    if (user.balance < totalAmount) {
      setMessage('Insufficient balance. Please recharge your account.');
      setLoading(false);
      return;
    }

    try {
      const orderCode = `ORD${Date.now()}`;
      const newBalance = user.balance - totalAmount;

      const { error: orderError } = await supabase.from('orders').insert({
        order_code: orderCode,
        user_id: user.id,
        items: cart,
        total_items: getTotalItems(),
        total_amount: totalAmount,
        previous_balance: user.balance,
        remaining_balance: newBalance,
        status: 'completed',
      });

      if (orderError) throw orderError;

      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshUser();

      onNavigate('billing', {
        orderCode,
        items: cart,
        totalItems: getTotalItems(),
        totalAmount,
        previousBalance: user.balance,
        remainingBalance: newBalance,
        userName: user.name,
      });

      setCart([]);
    } catch (error) {
      console.error('Error placing order:', error);
      setMessage('Error placing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    if (!user || !rechargeAmount || parseFloat(rechargeAmount) <= 0) return;

    setLoading(true);
    setMessage('');

    try {
      const amount = parseFloat(rechargeAmount);
      const rechargeCode = `RCH${Date.now()}`;

      const { error: rechargeError } = await supabase.from('recharge_transactions').insert({
        recharge_code: rechargeCode,
        user_id: user.id,
        amount,
        payment_mode: paymentMode,
        transaction_status: 'success',
      });

      if (rechargeError) throw rechargeError;

      const newBalance = user.balance + amount;
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshUser();

      setMessage(`Successfully recharged ₹${amount.toFixed(2)}`);
      setRechargeAmount('');
    } catch (error) {
      console.error('Error processing recharge:', error);
      setMessage('Error processing recharge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              MEC Canteen - Student Portal
            </h1>
            <p className="text-sm text-gray-600">Welcome, {user.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              <Wallet size={20} />
              {showBalance ? `₹${user.balance.toFixed(2)}` : 'Check Balance'}
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Menu Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['breakfast', 'lunch', 'breaktime', 'dinner'] as const).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`py-3 px-4 rounded-lg font-semibold capitalize transition ${
                      selectedCategory === category
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 capitalize">{selectedCategory} Menu</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-lg font-bold text-blue-600 mb-3">₹{item.price.toFixed(2)}</p>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart size={24} className="text-blue-500" />
                <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">₹{item.price.toFixed(2)} x {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-600 font-bold"
                          >
                            −
                          </button>
                          <span className="font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(menuItems.find((m) => m.id === item.id)!)}
                            className="text-green-500 hover:text-green-600 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Total Items:</span>
                      <span className="font-semibold">{getTotalItems()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total Price:</span>
                      <span>₹{getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={placeOrder}
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition mt-4 disabled:opacity-50"
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>
                </>
              )}

              {message && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${
                  message.includes('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {message}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recharge Wallet</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="UPI">UPI</option>
                    <option value="NetBanking">Net Banking</option>
                    <option value="Card">Card</option>
                    <option value="Wallet">Wallet</option>
                  </select>
                </div>
                <button
                  onClick={handleRecharge}
                  disabled={loading || !rechargeAmount}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Recharge Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
}
