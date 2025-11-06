

import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/apiService';
import { QuestionResponse } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Spinner, Card } from '../components/ui';

const MyQuestionsPage: React.FC = () => {
    const [questions, setQuestions] = useState<QuestionResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const fetchQuestions = useCallback(async () => {
        if (!user) {
            setError("You must be logged in to see your questions.");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const myQuestions = await api.getQuestionsByUser(user.id);
            setQuestions(myQuestions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (err: any) {
            setError('Failed to fetch your questions.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const toggleExpand = (id: number) => {
        setExpandedId(prevId => (prevId === id ? null : id));
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-primary mb-8">My Questions</h1>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            {loading ? <div className="flex justify-center"><Spinner /></div> : (
                <div className="space-y-4">
                    {questions.length > 0 ? (
                        questions.map(q => (
                            <Card key={q.id} className="p-4">
                                <div onClick={() => toggleExpand(q.id)} className="cursor-pointer">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-primary">{q.content}</p>
                                            <p className="text-sm text-secondary">To: {q.lawyerName} on {new Date(q.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {q.answer ? (
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Answered</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>
                                            )}
                                             <span className={`transform transition-transform text-secondary ${expandedId === q.id ? 'rotate-180' : ''}`}>
                                                ▼
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedId === q.id ? 'max-h-screen mt-4 pt-4 border-t border-border' : 'max-h-0'}`}>
                                    {q.answer ? (
                                        <div>
                                            <h3 className="font-semibold text-primary mb-2">Answer from {q.lawyerName}:</h3>
                                            <p className="text-primary whitespace-pre-wrap bg-background p-3 rounded-md">{q.answer}</p>
                                        </div>
                                    ) : (
                                        <p className="text-secondary italic">The lawyer has not answered this question yet.</p>
                                    )}
                                </div>
                            </Card>
                        ))
                    ) : (
                        <p className="text-center text-secondary py-16">You have not asked any questions yet.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyQuestionsPage;
