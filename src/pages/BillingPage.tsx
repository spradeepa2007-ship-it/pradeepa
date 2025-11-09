import { CheckCircle } from 'lucide-react';
import { OrderItem } from '../lib/supabase';

type BillingPageProps = {
  orderData: {
    orderCode: string;
    items: OrderItem[];
    totalItems: number;
    totalAmount: number;
    previousBalance: number;
    remainingBalance: number;
    userName: string;
  };
  onNavigate: (page: string) => void;
};

export default function BillingPage({ orderData, onNavigate }: BillingPageProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white text-center">
            <CheckCircle size={64} className="mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Order Successful!</h1>
            <p className="text-green-100">Your order has been placed successfully</p>
          </div>

          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                MADRAS ENGINEERING COLLEGE
              </h2>
              <p className="text-gray-600">Canteen Management System</p>
              <div className="mt-4 text-sm text-gray-500">
                {new Date().toLocaleString()}
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Customer Name</p>
                  <p className="font-semibold text-gray-900">{orderData.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Code</p>
                  <p className="font-semibold text-gray-900">{orderData.orderCode}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Order Items</h3>
              <div className="space-y-3">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        ₹{item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Total Items:</span>
                <span className="font-semibold">{orderData.totalItems}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-3">
                <span>Total Amount:</span>
                <span>₹{orderData.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-6 space-y-2">
              <h3 className="font-bold text-gray-900 mb-3">Balance Information</h3>
              <div className="flex justify-between text-gray-700">
                <span>Previous Balance:</span>
                <span className="font-semibold">₹{orderData.previousBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Amount Paid:</span>
                <span className="font-semibold text-red-600">- ₹{orderData.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2 mt-2">
                <span>Remaining Balance:</span>
                <span className="text-green-600">₹{orderData.remainingBalance.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center text-gray-600 mb-6 py-4 border-t border-b border-gray-200">
              <p className="text-lg font-semibold text-gray-900">Thank you for using MEC Canteen!</p>
              <p className="text-sm mt-1">Enjoy your meal</p>
            </div>

            <div className="flex gap-4 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                Print Bill
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
