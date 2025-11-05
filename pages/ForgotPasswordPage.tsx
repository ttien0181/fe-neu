import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../services/apiService';
import { Button, Card, Input, Label } from '../components/ui';

const ForgotPasswordPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);
        try {
            const responseMessage = await api.sendPasswordResetCode({ email });
            setSuccess(responseMessage);
            setStep(2);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset code. Make sure the email is registered.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);
        try {
            const responseMessage = await api.resetPassword({ email, newPassword, verificationCode });
            setSuccess(`${responseMessage} You can now log in with your new password.`);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to reset password. Please check the code and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background pt-20 px-4">
            <div className="max-w-md w-full mx-auto">
                <Card>
                    <h2 className="text-3xl font-bold text-center text-primary mb-2">Reset Password</h2>
                    <p className="text-center text-secondary mb-8">
                        {step === 1 ? 'Enter your email to receive a reset code.' : `A code has been sent to ${email}.`}
                    </p>

                    {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4 text-center text-sm">{error}</p>}
                    {success && (step === 1 || (step === 2 && !error)) && <p className="text-green-600 bg-green-100 p-3 rounded-md mb-4 text-center text-sm">{success}</p>}

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
                                    placeholder="Enter your registered email"
                                />
                            </div>
                            <div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? 'Sending...' : 'Send Reset Code'}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <Label htmlFor="verificationCode">Verification Code</Label>
                                <Input
                                    id="verificationCode"
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    required
                                    placeholder="Enter code from email"
                                />
                            </div>
                            <div>
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    placeholder="Enter your new password"
                                />
                            </div>
                            <div>
                                <Button type="submit" className="w-full" disabled={isLoading || (!!success && step === 2)}>
                                    {isLoading ? 'Resetting...' : 'Reset Password'}
                                </Button>
                            </div>
                        </form>
                    )}

                    <p className="text-center text-sm text-secondary mt-6">
                        Remember your password?{' '}
                        <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
                            Log In
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
