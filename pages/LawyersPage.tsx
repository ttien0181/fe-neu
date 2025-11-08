

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../services/apiService';
import { PersonResponse, PersonRequest, CaseResponse } from '../types';
import { Card, Spinner, Input, UsersIcon, Button, Modal, Label, PlusIcon, EditIcon, DeleteIcon, Select, ChatBubbleIcon, CalendarIcon } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { AskQuestionModal } from './MyQuestionsPage'; 
import { BookingModal } from './MyAppointmentsPage';

const PersonForm: React.FC<{
    initialData: PersonResponse | null;
    onSubmit: (data: PersonRequest) => void;
    onCancel: () => void;
}> = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<PersonRequest>({
        name: initialData?.name || '',
        role: 'lawyer',
        contactInfo: initialData?.contactInfo || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="name">Lawyer Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
                <Label htmlFor="contactInfo">Email / Contact Info</Label>
                <Input id="contactInfo" name="contactInfo" value={formData.contactInfo} onChange={handleChange} required />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Lawyer</Button>
            </div>
        </form>
    );
};

const AssignCaseModal: React.FC<{
    person: PersonResponse;
    onClose: () => void;
    onSave: () => void;
}> = ({ person, onClose, onSave }) => {
    const [allCases, setAllCases] = useState<CaseResponse[]>([]);
    const [assignedCaseIds, setAssignedCaseIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [caseToAssign, setCaseToAssign] = useState<string>('');
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [cases, casePersons] = await Promise.all([api.getCases(), api.getCasePersons()]);
                setAllCases(cases);
                const currentIds = casePersons.filter(cp => cp.personId === person.id).map(cp => cp.caseId);
                setAssignedCaseIds(new Set(currentIds));
            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [person.id]);

    const handleAssign = async () => {
        if (!caseToAssign) return;
        const caseId = Number(caseToAssign);
        try {
            await api.createCasePerson({ caseId, personId: person.id });
            setAssignedCaseIds(prev => new Set(prev).add(caseId));
            setCaseToAssign('');
            onSave(); // Notify parent to refetch
        } catch (error) {
            alert('Failed to assign case.');
        }
    };
    
    const unassignedCases = allCases.filter(c => !assignedCaseIds.has(c.id));

    return (
         <Modal isOpen={true} onClose={onClose} title={`Assign Case to ${person.name}`}>
            {loading ? <Spinner /> : (
                 <div className="space-y-4">
                    <Label>Select a case to assign</Label>
                    <div className="flex gap-2">
                        <Select value={caseToAssign} onChange={e => setCaseToAssign(e.target.value)} className="flex-grow">
                            <option value="">Select a case...</option>
                            {unassignedCases.map(c => (
                                <option key={c.id} value={c.id}>{c.caseName}</option>
                            ))}
                        </Select>
                        <Button onClick={handleAssign} disabled={!caseToAssign}>Assign</Button>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button variant="primary" onClick={onClose}>Done</Button>
                    </div>
                 </div>
            )}
        </Modal>
    )
}

const LawyerDetail: React.FC<{ lawyerId: string }> = ({ lawyerId }) => {
    const [lawyer, setLawyer] = useState<PersonResponse | null>(null);
    const [assignedCases, setAssignedCases] = useState<CaseResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAdmin, isLawyer } = useAuth();
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const lawyerData = await api.getPersonById(Number(lawyerId));
            if (lawyerData.role.toLowerCase() !== 'lawyer') {
                setError("This person is not a lawyer.");
                return;
            }
            setLawyer(lawyerData);

            const [allCases, allCasePersons] = await Promise.all([api.getCases(), api.getCasePersons()]);
            const caseIds = allCasePersons
                .filter(cp => cp.personId === Number(lawyerId))
                .map(cp => cp.caseId);
            setAssignedCases(allCases.filter(c => caseIds.includes(c.id)));
        } catch (err) {
            setError("Failed to load lawyer details.");
        } finally {
            setLoading(false);
        }
    }, [lawyerId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRemoveFromCase = async (caseId: number) => {
        if (!lawyer) return;
        if (window.confirm("Are you sure you want to remove this lawyer from the case?")) {
            try {
                await api.deleteCasePerson(caseId, lawyer.id);
                fetchData();
            } catch (err) {
                alert("Failed to remove lawyer from case.");
            }
        }
    };
    
    if (loading) return <div className="flex justify-center mt-10"><Spinner /></div>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!lawyer) return <p>Lawyer not found.</p>;
    
    return (
        <div>
            <Link to="/app/lawyers" className="text-accent hover:underline mb-6 inline-block font-semibold">&larr; Back to all lawyers</Link>
            <div className="md:flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-primary mb-2">{lawyer.name}</h1>
                    <p className="text-secondary">{lawyer.contactInfo}</p>
                </div>
                 <div className="flex gap-2 mt-4 md:mt-0">
                    {!isLawyer && (
                        <>
                            <Button onClick={() => setIsQuestionModalOpen(true)} variant="secondary"><ChatBubbleIcon/>Ask a Question</Button>
                            <Button onClick={() => setIsAppointmentModalOpen(true)}><CalendarIcon/>Book Appointment</Button>
                        </>
                    )}
                    {isAdmin && <Button onClick={() => setIsAssignModalOpen(true)}>Assign to Case</Button>}
                 </div>
            </div>

            <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4 text-primary">Assigned Cases ({assignedCases.length})</h2>
                {assignedCases.length > 0 ? (
                    <div className="divide-y divide-border -mx-6">
                        {assignedCases.map(caseItem => (
                            <div key={caseItem.id} className="py-4 px-6 flex justify-between items-center hover:bg-background transition-colors group">
                                <div>
                                    <h3 className="font-semibold text-primary">{caseItem.caseName}</h3>
                                    <p className="text-sm text-secondary">{caseItem.courtName}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                     <Link to={`/app/cases/${caseItem.id}`} className="text-accent hover:underline text-sm font-semibold">View Case</Link>
                                     {isAdmin && <Button variant="danger" size="sm" onClick={() => handleRemoveFromCase(caseItem.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">Remove</Button>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-secondary py-8 text-center">This lawyer is not assigned to any cases yet.</p>
                )}
            </Card>
            {isAssignModalOpen && (
                <AssignCaseModal 
                    person={lawyer}
                    onClose={() => setIsAssignModalOpen(false)}
                    onSave={fetchData}
                />
            )}
             {isQuestionModalOpen && (
                <AskQuestionModal 
                    onClose={() => setIsQuestionModalOpen(false)} 
                    onSuccess={() => {
                        alert("Your question has been sent!");
                        setIsQuestionModalOpen(false);
                    }}
                    initialLawyerId={lawyer.id}
                />
            )}
            {isAppointmentModalOpen && (
                <BookingModal 
                    onClose={() => setIsAppointmentModalOpen(false)} 
                    onSuccess={() => {
                        alert("Your appointment request has been sent!");
                        setIsAppointmentModalOpen(false);
                    }}
                    initialLawyerId={lawyer.id}
                />
            )}
        </div>
    );
};


const LawyerList: React.FC = () => {
    const [lawyers, setLawyers] = useState<PersonResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { isAdmin } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLawyer, setEditingLawyer] = useState<PersonResponse | null>(null);

    const fetchLawyers = useCallback(async () => {
        try {
            setLoading(true);
            const allPersons = await api.getPersons();
            setLawyers(allPersons.filter(person => person.role.toLowerCase() === 'lawyer'));
        } catch (err: any) {
            setError('Failed to fetch lawyer information.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLawyers();
    }, [fetchLawyers]);

    const handleOpenModal = (lawyer: PersonResponse | null = null) => {
        setError('');
        setEditingLawyer(lawyer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingLawyer(null);
    };
    
    const handleFormSubmit = async (data: PersonRequest) => {
        try {
            if (editingLawyer) {
                await api.updatePerson(editingLawyer.id, data);
            } else {
                await api.createPerson(data);
            }
            handleCloseModal();
            fetchLawyers();
        } catch (err: any) {
            setError(err.message || 'Failed to save lawyer.');
        }
    };
    
    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this lawyer? They will be unassigned from all cases.")) {
            setError('');
            try {
                await api.deletePerson(id);
                fetchLawyers();
            } catch (err: any) {
                if (err.message && err.message.toLowerCase().includes('foreign key constraint fails')) {
                    setError('Cannot delete this lawyer. They are associated with questions, appointments, or cases. Please reassign or remove these associations first.');
                } else {
                    setError(err.message || 'Failed to delete lawyer.');
                }
            }
        }
    };

    const filteredLawyers = useMemo(() => {
        return lawyers.filter(lawyer =>
            lawyer.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [lawyers, searchTerm]);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-primary">Lawyers</h1>
                 {isAdmin && <Button onClick={() => handleOpenModal()}><PlusIcon/> Add New Lawyer</Button>}
            </div>

            <div className="mb-6">
                <Input
                    type="text"
                    placeholder="Search for a lawyer by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
             {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-6">{error}</p>}

            {loading ? (
                <div className="flex justify-center items-center h-64"><Spinner /></div>
            ) : (
                <>
                    {filteredLawyers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredLawyers.map(lawyer => (
                                <Card key={lawyer.id} className="p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
                                     <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h2 className="text-lg font-semibold text-primary group-hover:text-accent transition-colors pr-2">{lawyer.name}</h2>
                                            {isAdmin && (
                                                <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleOpenModal(lawyer)} className="p-1 text-secondary hover:text-primary"><EditIcon /></button>
                                                    <button onClick={() => handleDelete(lawyer.id)} className="p-1 text-secondary hover:text-red-500"><DeleteIcon /></button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-secondary text-sm mb-4">{lawyer.contactInfo}</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-border text-right">
                                        <Link to={`/app/lawyers/${lawyer.id}`} className="text-sm font-semibold text-accent opacity-75 group-hover:opacity-100 group-hover:underline transition-all">View Details &rarr;</Link>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-secondary mt-12">
                            No lawyers found.
                        </p>
                    )}
                </>
            )}
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingLawyer ? 'Edit Lawyer' : 'Add New Lawyer'}>
                <PersonForm
                    initialData={editingLawyer}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </div>
    );
};

const LawyersPage: React.FC = () => {
    const { lawyerId } = useParams<{ lawyerId?: string }>();
    return lawyerId ? <LawyerDetail lawyerId={lawyerId} /> : <LawyerList />;
};

export default LawyersPage;