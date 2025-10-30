import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../services/apiService';
import { Button, Card, Input, Label } from '../components/ui';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const responseMessage = await api.register({ username, password });
      setSuccess(`${responseMessage} You will be redirected to login shortly.`);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to register. The username may already be taken.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background pt-20 px-4">
      <div className="max-w-md w-full mx-auto">
        <Card>
          <h2 className="text-3xl font-bold text-center text-primary mb-2">Create an Account</h2>
          <p className="text-center text-secondary mb-8">Join LegalFlow to manage your cases.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Choose a username"
              />
            </div>
            <div>
              <Label htmlFor="password-input">Password</Label>
              <Input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a strong password"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}
            <div>
              <Button type="submit" className="w-full" disabled={isLoading || !!success}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </div>
            <p className="text-center text-sm text-secondary">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
                    Log In
                </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;