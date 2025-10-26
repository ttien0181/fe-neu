
import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/apiService';
import { CaseResponse, CaseRequest, CategoryResponse } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Button, Modal, Input, Textarea, Select, Spinner, PlusIcon, EditIcon, DeleteIcon } from '../components/ui';

const CaseForm: React.FC<{
  initialData: CaseRequest | null;
  categories: CategoryResponse[];
  onSubmit: (data: CaseRequest) => void;
  onCancel: () => void;
}> = ({ initialData, categories, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<CaseRequest>(initialData || { caseName: '', categoryId: categories[0]?.id });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'categoryId' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Case Name</label>
                <Input name="caseName" value={formData.caseName} onChange={handleChange} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <Textarea name="caseDescription" value={formData.caseDescription || ''} onChange={handleChange} />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                <Select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </Select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <Input name="status" value={formData.status || ''} onChange={handleChange} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Court Name</label>
                <Input name="courtName" value={formData.courtName || ''} onChange={handleChange} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                <Input name="location" value={formData.location || ''} onChange={handleChange} />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Case</Button>
            </div>
        </form>
    );
};

const CasesPage: React.FC = () => {
    const [cases, setCases] = useState<CaseResponse[]>([]);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCase, setEditingCase] = useState<CaseResponse | null>(null);

    const { isAdmin } = useAuth();

    const fetchCasesAndCategories = useCallback(async () => {
        try {
            setLoading(true);
            const [casesData, categoriesData] = await Promise.all([api.getCases(), api.getCategories()]);
            setCases(casesData);
            setCategories(categoriesData);
            setError('');
        } catch (err: any) {
            setError('Failed to fetch data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCasesAndCategories();
    }, [fetchCasesAndCategories]);

    const handleOpenModal = (caseItem: CaseResponse | null = null) => {
        setEditingCase(caseItem);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCase(null);
    };

    const handleFormSubmit = async (data: CaseRequest) => {
        try {
            if (editingCase) {
                await api.updateCase(editingCase.id, data);
            } else {
                await api.createCase(data);
            }
            handleCloseModal();
            fetchCasesAndCategories();
        } catch (err: any) {
            setError(err.message || 'Failed to save case.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this case?')) {
            try {
                await api.deleteCase(id);
                fetchCasesAndCategories();
            } catch (err: any) {
                setError(err.message || 'Failed to delete case.');
            }
        }
    };

    const getCategoryName = (categoryId: number) => {
        return categories.find(c => c.id === categoryId)?.name || 'N/A';
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Manage Cases</h1>
                {isAdmin && <Button onClick={() => handleOpenModal()}><PlusIcon /> Add New Case</Button>}
            </div>

            {error && <p className="text-red-500 bg-red-900/50 p-3 rounded-md mb-4">{error}</p>}
            
            {loading ? <div className="flex justify-center"><Spinner /></div> : (
                <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Court</th>
                                {isAdmin && <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {cases.map(caseItem => (
                                <tr key={caseItem.id} className="hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{caseItem.caseName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getCategoryName(caseItem.categoryId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{caseItem.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{caseItem.courtName}</td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => handleOpenModal(caseItem)} className="text-blue-400 hover:text-blue-300"><EditIcon/></button>
                                            <button onClick={() => handleDelete(caseItem.id)} className="text-red-500 hover:text-red-400"><DeleteIcon /></button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCase ? 'Edit Case' : 'Add New Case'}>
                <CaseForm
                    initialData={editingCase ? {
                        caseName: editingCase.caseName,
                        caseDescription: editingCase.caseDescription,
                        status: editingCase.status,
                        courtName: editingCase.courtName,
                        location: editingCase.location,
                        categoryId: editingCase.categoryId,
                    } : null}
                    categories={categories}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </div>
    );
};

export default CasesPage;
