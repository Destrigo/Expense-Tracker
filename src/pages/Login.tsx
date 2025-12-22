import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Login = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [currency, setCurrency] = useState('USD');

  const handleSubmit = async () => {
    if (!email || !password) return toast.error('Email and password required');

    try {
      if (isRegistering) {
        if (!name) return toast.error('Name required');

        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, monthlyIncome, currency }),
        });

        if (!res.ok) throw new Error('Registration failed');

        const data = await res.json();
        localStorage.setItem('jwt', data.token);
        toast.success('Registered and logged in!');
        navigate('/profile');
      } else {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) throw new Error('Invalid credentials');

        const data = await res.json();
        localStorage.setItem('jwt', data.token);
        toast.success('Logged in!');
        navigate('/profile');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-xl font-bold text-center">
          {isRegistering ? 'Register' : 'Login'}
        </h1>

        {isRegistering && (
          <div className="space-y-2">
            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label>Monthly Income</Label>
              <Input
                type="number"
                value={monthlyIncome}
                onChange={e => setMonthlyIncome(Number(e.target.value))}
              />
            </div>

            <div>
              <Label>Currency</Label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              >
                {['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div>
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>

        <Button onClick={handleSubmit} className="w-full">
          {isRegistering ? 'Register' : 'Login'}
        </Button>

        <div className="text-center mt-2">
          <button
            className="text-sm text-blue-600 underline"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
