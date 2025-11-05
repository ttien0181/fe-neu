

import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../services/apiService';
import { PersonResponse, QuestionRequest } from '../types';
import { Card, Spinner, Input, UsersIcon, Button, Modal, Label, Textarea, ChatBubbleIcon } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

const AskQuestionForm: React.FC<{
    lawyer: PersonResponse;
    onSubmit: (content: string) => void;
    onCancel: () => void;
}> = ({ lawyer, onSubmit, onCancel }) => {
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(content);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="question_content">Your question for {lawyer.name}</Label>
                <Textarea
                    id="question_content"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows={6}
                    required
                    placeholder="Please type your legal question here..."
                />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Submit Question</Button>
            </div>
        </form>
    );
};


const LawyersPage: React.FC = () => {
    const [lawyers, setLawyers] = useState<PersonResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { isAuthenticated, user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLawyer, setSelectedLawyer] = useState<PersonResponse | null>(null);

    useEffect(() => {
        const fetchLawyers = async () => {
            try {
                setLoading(true);
                const allPersons = await api.getPersons();
                const lawyerList = allPersons.filter(person => person.role.toLowerCase() === 'lawyer');
                setLawyers(lawyerList);
            } catch (err: any) {
                setError('Failed to fetch lawyer information.');
            } finally {
                setLoading(false);
            }
        };

        fetchLawyers();
    }, []);
    
    const handleOpenModal = (lawyer: PersonResponse) => {
        setSelectedLawyer(lawyer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedLawyer(null);
    };
    
    const handleQuestionSubmit = async (content: string) => {
        if (!user || !selectedLawyer) {
            setError("You must be logged in to ask a question.");
            return;
        }
        try {
            const questionData: QuestionRequest = {
                idQuestioner: user.id,
                idLawyerPerson: selectedLawyer.id,
                content: content,
            };
            await api.createQuestion(questionData);
            handleCloseModal();
            alert("Your question has been submitted successfully!");
        } catch (err: any) {
            setError(err.message || "Failed to submit your question.");
        }
    };


    const filteredLawyers = useMemo(() => {
        return lawyers.filter(lawyer =>
            lawyer.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [lawyers, searchTerm]);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Our Lawyers</h1>
                <p className="text-lg text-secondary max-w-2xl mx-auto">
                    Meet our team of dedicated and experienced legal professionals committed to delivering exceptional results.
                </p>
            </div>

            <div className="mb-8 max-w-lg mx-auto">
                <Input
                    type="text"
                    placeholder="Search for a lawyer by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
             {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-lg mb-6">{error}</p>}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spinner />
                </div>
            ) : (
                <>
                    {filteredLawyers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredLawyers.map(lawyer => (
                                <Card key={lawyer.id} className="text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col items-center justify-between">
                                    <div>
                                        <div className="w-24 h-24 rounded-full bg-background flex items-center justify-center mb-4 border border-border">
                                            <UsersIcon />
                                        </div>
                                        <h2 className="text-xl font-semibold text-primary">{lawyer.name}</h2>
                                        <p className="text-accent font-medium mt-1">Lawyer</p>
                                        <p className="text-secondary text-sm mt-3">{lawyer.contactInfo}</p>
                                    </div>
                                    {isAuthenticated && !user?.email?.includes(lawyer.contactInfo) && (
                                         <Button variant="secondary" className="mt-4 w-full" onClick={() => handleOpenModal(lawyer)}>
                                            <ChatBubbleIcon/> Ask Question
                                         </Button>
                                    )}
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-secondary mt-12">
                            No lawyers found matching your search criteria.
                        </p>
                    )}
                </>
            )}
            
            {selectedLawyer && (
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={`Ask ${selectedLawyer.name} a Question`}>
                    <AskQuestionForm
                        lawyer={selectedLawyer}
                        onSubmit={handleQuestionSubmit}
                        onCancel={handleCloseModal}
                    />
                </Modal>
            )}
        </div>
    );
};

export default LawyersPage;