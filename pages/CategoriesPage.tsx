
import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/apiService';
import { CategoryResponse, CategoryRequest } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Button, Modal, Input, Textarea, Spinner, PlusIcon, EditIcon, DeleteIcon, Label } from '../components/ui';

const CategoryForm: React.FC<{
  initialData: CategoryRequest | null;
  onSubmit: (data: CategoryRequest) => void;
  onCancel: () => void;
}> = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<CategoryRequest>(initialData || { name: '', description: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                <Label htmlFor="name">Category Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Category</Button>
            </div>
        </form>
    );
};

const CategoriesPage: React.FC = () => {
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
    const { isAdmin } = useAuth();

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getCategories();
            setCategories(data);
            setError('');
        } catch (err: any) {
            setError('Failed to fetch categories.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleOpenModal = (category: CategoryResponse | null = null) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleFormSubmit = async (data: CategoryRequest) => {
        try {
            if (editingCategory) {
                await api.updateCategory(editingCategory.id, data);
            } else {
                await api.createCategory(data);
            }
            handleCloseModal();
            fetchCategories();
        } catch (err: any) {
            setError(err.message || 'Failed to save category.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await api.deleteCategory(id);
                fetchCategories();
            } catch (err: any) {
                setError(err.message || 'Failed to delete category.');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Manage Categories</h1>
                {isAdmin && <Button onClick={() => handleOpenModal()}><PlusIcon/> Add New Category</Button>}
            </div>

            {error && <p className="text-red-500 bg-red-900/50 p-3 rounded-md mb-4">{error}</p>}
            
            {loading ? <div className="flex justify-center"><Spinner /></div> : (
                <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                                {isAdmin && <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {categories.map(category => (
                                <tr key={category.id} className="hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{category.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{category.description}</td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => handleOpenModal(category)} className="text-blue-400 hover:text-blue-300"><EditIcon/></button>
                                            <button onClick={() => handleDelete(category.id)} className="text-red-500 hover:text-red-400"><DeleteIcon /></button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCategory ? 'Edit Category' : 'Add New Category'}>
                <CategoryForm
                    initialData={editingCategory}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </div>
    );
};

export default CategoriesPage;
