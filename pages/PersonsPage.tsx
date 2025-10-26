
import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/apiService';
import { PersonResponse, PersonRequest, PersonRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Button, Modal, Input, Select, Spinner, PlusIcon, EditIcon, DeleteIcon } from '../components/ui';

const PersonForm: React.FC<{
  initialData: PersonRequest | null;
  onSubmit: (data: PersonRequest) => void;
  onCancel: () => void;
}> = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<PersonRequest>(initialData || { name: '', role: PersonRole.PLAINTIFF, contactInfo: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <Input name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                <Select name="role" value={formData.role} onChange={handleChange} required>
                    {Object.values(PersonRole).map(role => (
                        <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                    ))}
                </Select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Contact Info</label>
                <Input name="contactInfo" value={formData.contactInfo || ''} onChange={handleChange} />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Person</Button>
            </div>
        </form>
    );
};

const PersonsPage: React.FC = () => {
    const [persons, setPersons] = useState<PersonResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<PersonResponse | null>(null);
    const { isAdmin } = useAuth();

    const fetchPersons = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getPersons();
            setPersons(data);
            setError('');
        } catch (err: any) {
            setError('Failed to fetch persons.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPersons();
    }, [fetchPersons]);

    const handleOpenModal = (person: PersonResponse | null = null) => {
        setEditingPerson(person);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPerson(null);
    };

    const handleFormSubmit = async (data: PersonRequest) => {
        try {
            if (editingPerson) {
                await api.updatePerson(editingPerson.id, data);
            } else {
                await api.createPerson(data);
            }
            handleCloseModal();
            fetchPersons();
        } catch (err: any) {
            setError(err.message || 'Failed to save person.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this person?')) {
            try {
                await api.deletePerson(id);
                fetchPersons();
            } catch (err: any) {
                setError(err.message || 'Failed to delete person.');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Manage Persons</h1>
                {isAdmin && <Button onClick={() => handleOpenModal()}><PlusIcon/> Add New Person</Button>}
            </div>

            {error && <p className="text-red-500 bg-red-900/50 p-3 rounded-md mb-4">{error}</p>}
            
            {loading ? <div className="flex justify-center"><Spinner /></div> : (
                <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact Info</th>
                                {isAdmin && <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {persons.map(person => (
                                <tr key={person.id} className="hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{person.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{person.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{person.contactInfo}</td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => handleOpenModal(person)} className="text-blue-400 hover:text-blue-300"><EditIcon/></button>
                                            <button onClick={() => handleDelete(person.id)} className="text-red-500 hover:text-red-400"><DeleteIcon /></button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingPerson ? 'Edit Person' : 'Add New Person'}>
                <PersonForm
                    initialData={editingPerson}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </div>
    );
};

export default PersonsPage;
