import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../services/apiService';
import { Button, Card, Input, Label } from '../components/ui';

const Logo = ({ className = 'h-6 w-6', color = '#4f46e5' }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="M24.2,2.3c-0.2,0-0.4,0-0.5,0c-0.3,0-0.5,0.1-0.8,0.2c-11.4,2.6-18.1,13.7-15.5,25.1c2,9,9.6,15.7,18.5,16.2c0.2,0,0.3,0,0.5,0c11.8-0.6,21.3-10.4,21.3-22.3C47.6,11.8,37.2,2.4,24.2,2.3z M24,43.3C14.7,43.3,7,35.5,7,26.3c0-8.2,5.9-15.1,13.9-16.5l15.8,15.8C35.6,33.5,29.9,34.2,24,43.3z M30.9,23.3L15.1,7.5c1.4-0.6,3-1,4.6-1.1c9.4-0.5,17.2,6.8,17.2,16.2C36.9,22.8,32,23.1,30.9,23.3z"/>
    </svg>
);

const RegisterPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const responseMessage = await api.sendVerificationCode({ email });
      setSuccess(responseMessage);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      await api.register({ username, email, password, verificationCode });
      setSuccess(`Registration successful! You will be redirected to login shortly.`);
      setIsRegistrationComplete(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background pt-20 px-4">
      <div className="max-w-md w-full mx-auto text-center">
        <Link to="/" className="inline-flex items-center gap-3 mb-8">
            <Logo className="h-10 w-10" />
            <span className="text-3xl font-bold text-primary">Binh An Law</span>
        </Link>
        <Card className="text-left p-8">
          <h2 className="text-3xl font-bold text-center text-primary mb-2">Create an Account</h2>
          <p className="text-center text-secondary mb-8">
            {step === 1 ? 'Start by entering your email.' : `A code has been sent to ${email}.`}
          </p>

          {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4 text-center text-sm">{error}</p>}
          {success && step === 1 && <p className="text-green-600 bg-green-100 p-3 rounded-md mb-4 text-center text-sm">{success}</p>}

          {step === 1 ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                />
              </div>
              <div>
                <Button type="submit" className="w-full py-3" disabled={isLoading}>
                  {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
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
              <div>
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  placeholder="Enter the code from your email"
                />
              </div>
              {success && step === 2 && <p className="text-green-600 text-sm">{success}</p>}
              <div>
                <Button type="submit" className="w-full py-3" disabled={isLoading || isRegistrationComplete}>
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-secondary mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
              Log In
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;