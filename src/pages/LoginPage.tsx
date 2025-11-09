import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

type LoginPageProps = {
  onNavigate: (page: string) => void;
};

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f9e0f0 0%, #a8edea 100%)' }}>
      <div className="floating-icons">
        <img
          src="https://cdn-icons-png.flaticon.com/512/706/706164.png"
          alt="food"
          className="floating-icon"
          style={{ animationDelay: '1s', top: '10%', left: '10%' }}
        />
        <img
          src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png"
          alt="food"
          className="floating-icon"
          style={{ animationDelay: '2s', top: '20%', right: '15%' }}
        />
        <img
          src="https://cdn-icons-png.flaticon.com/512/590/590836.png"
          alt="food"
          className="floating-icon"
          style={{ animationDelay: '3s', bottom: '15%', left: '20%' }}
        />
        <img
          src="https://cdn-icons-png.flaticon.com/512/706/706164.png"
          alt="food"
          className="floating-icon"
          style={{ animationDelay: '1.5s', bottom: '25%', right: '10%' }}
        />
        <img
          src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png"
          alt="food"
          className="floating-icon"
          style={{ animationDelay: '2.5s', top: '50%', left: '5%' }}
        />
        <img
          src="https://cdn-icons-png.flaticon.com/512/590/590836.png"
          alt="food"
          className="floating-icon"
          style={{ animationDelay: '0.5s', top: '60%', right: '5%' }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md backdrop-blur-sm bg-opacity-95">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              MADRAS ENGINEERING COLLEGE
            </h1>
            <p className="text-lg text-gray-600">Canteen Management System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 py-2 px-4 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="text-blue-600 hover:text-blue-700 font-medium transition"
              >
                Don't have an account? Register here
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        .floating-icons {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
        }

        .floating-icon {
          position: absolute;
          width: 60px;
          height: 60px;
          opacity: 0.6;
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
          }
          50% {
            transform: translateY(-40px) rotate(-5deg);
          }
          75% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
      `}</style>
    </div>
  );
}
