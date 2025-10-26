
import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/apiService';
import { CaseTagResponse, CaseTagRequest } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Button, Modal, Input, Spinner, PlusIcon, EditIcon, DeleteIcon, Label } from '../components/ui';

const CaseTagForm: React.FC<{
  initialData: CaseTagRequest | null;
  onSubmit: (data: CaseTagRequest) => void;
  onCancel: () => void;
}> = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<CaseTagRequest>(initialData || { tagName: '' });

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
                <Label htmlFor="tagName">Tag Name</Label>
                <Input id="tagName" name="tagName" value={formData.tagName} onChange={handleChange} required />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Tag</Button>
            </div>
        </form>
    );
};

const CaseTagsPage: React.FC = () => {
    const [tags, setTags] = useState<CaseTagResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<CaseTagResponse | null>(null);
    const { isAdmin } = useAuth();

    const fetchTags = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getCaseTags();
            setTags(data);
            setError('');
        } catch (err: any) {
            setError('Failed to fetch case tags.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    const handleOpenModal = (tag: CaseTagResponse | null = null) => {
        setEditingTag(tag);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTag(null);
    };

    const handleFormSubmit = async (data: CaseTagRequest) => {
        try {
            if (editingTag) {
                await api.updateCaseTag(editingTag.id, data);
            } else {
                await api.createCaseTag(data);
            }
            handleCloseModal();
            fetchTags();
        } catch (err: any) {
            setError(err.message || 'Failed to save tag.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this tag?')) {
            try {
                await api.deleteCaseTag(id);
                fetchTags();
            } catch (err: any) {
                setError(err.message || 'Failed to delete tag.');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Manage Case Tags</h1>
                {isAdmin && <Button onClick={() => handleOpenModal()}><PlusIcon/> Add New Tag</Button>}
            </div>

            {error && <p className="text-red-500 bg-red-900/50 p-3 rounded-md mb-4">{error}</p>}
            
            {loading ? <div className="flex justify-center"><Spinner /></div> : (
                <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tag Name</th>
                                {isAdmin && <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {tags.map(tag => (
                                <tr key={tag.id} className="hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{tag.tagName}</td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => handleOpenModal(tag)} className="text-blue-400 hover:text-blue-300"><EditIcon/></button>
                                            <button onClick={() => handleDelete(tag.id)} className="text-red-500 hover:text-red-400"><DeleteIcon /></button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTag ? 'Edit Tag' : 'Add New Tag'}>
                <CaseTagForm
                    initialData={editingTag}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </div>
    );
};

export default CaseTagsPage;
