import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/apiService';
import { CaseFileResponse, CaseFileRequest, CaseResponse } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Button, Modal, Select, Spinner, PlusIcon, DeleteIcon, Label, Input, EditIcon, Card } from '../components/ui';

// Form for ADDING a new file (includes file upload)
const CaseFileAddForm: React.FC<{
  cases: CaseResponse[];
  onSubmit: (data: CaseFileRequest, file: File) => void;
  onCancel: () => void;
}> = ({ cases, onSubmit, onCancel }) => {
    const [caseId, setCaseId] = useState<string>(cases[0]?.id.toString() || '');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileError('');
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type === 'application/pdf') {
                setSelectedFile(file);
            } else {
                setFileError('Only PDF files are allowed.');
                e.target.value = '';
                setSelectedFile(null);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setFileError('Please select a file.');
            return;
        }
        if (!caseId) {
            return;
        }
        const requestData: CaseFileRequest = {
            caseId: Number(caseId),
            fileName: selectedFile.name,
            filePath: `/files/${caseId}`,
            fileType: 'pdf'
        };
        onSubmit(requestData, selectedFile);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="caseId">Vụ việc</Label>
                <Select id="caseId" name="caseId" value={caseId} onChange={(e) => setCaseId(e.target.value)} required disabled={cases.length === 0}>
                    {cases.length > 0 ? (
                        cases.map(c => <option key={c.id} value={c.id}>{c.caseName}</option>)
                    ) : (
                        <option>Không có vụ việc nào có sẵn</option>
                    )}
                </Select>
            </div>
            <div>
                <Label htmlFor="file">Tập tin PDF</Label>
                <Input id="file" name="file" type="file" accept=".pdf" onChange={handleFileChange} required />
                {fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Hủy</Button>
                <Button type="submit" disabled={!caseId || cases.length === 0}>Thêm tập tin</Button>
            </div>
        </form>
    );
};

// Form for EDITING file metadata
const CaseFileEditForm: React.FC<{
  initialData: CaseFileResponse;
  cases: CaseResponse[];
  onSubmit: (data: Partial<CaseFileRequest>) => void;
  onCancel: () => void;
}> = ({ initialData, cases, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        fileName: initialData.fileName,
        caseId: initialData.caseId.toString()
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            fileName: formData.fileName,
            caseId: Number(formData.caseId)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="fileName">Tên tập tin</Label>
                <Input id="fileName" name="fileName" value={formData.fileName} onChange={handleChange} required />
            </div>
            <div>
                <Label htmlFor="caseId">Vụ việc</Label>
                <Select id="caseId" name="caseId" value={formData.caseId} onChange={handleChange} required>
                    {cases.map(c => <option key={c.id} value={c.id}>{c.caseName}</option>)}
                </Select>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Hủy</Button>
                <Button type="submit">Lưu thay đổi</Button>
            </div>
        </form>
    );
};


const CaseFilesPage: React.FC = () => {
    const [files, setFiles] = useState<CaseFileResponse[]>([]);
    const [cases, setCases] = useState<CaseResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFile, setEditingFile] = useState<CaseFileResponse | null>(null);
    const { isAdmin, user } = useAuth();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [filesData, casesData] = await Promise.all([api.getCaseFiles(), api.getCases()]);
            setFiles(filesData);
            setCases(casesData);
            setError('');
        } catch (err: any) {
            setError('Không thể tải các tập tin hồ sơ.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (file: CaseFileResponse | null = null) => {
        setEditingFile(file);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingFile(null);
    };

    const handleAddSubmit = async (data: CaseFileRequest, file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('caseId', data.caseId.toString());
            formData.append('fileName', data.fileName);
            formData.append('filePath', data.filePath);
            formData.append('fileType', data.fileType);
            // Fix: Changed user.userId to user.id to match the User interface.
            if (user?.id) {
                formData.append('uploadedBy', user.id.toString());
            }

            await api.createCaseFile(formData);
            handleCloseModal();
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Không thể thêm hồ sơ tập tin.');
        }
    };

    const handleEditSubmit = async (data: Partial<CaseFileRequest>) => {
        if (!editingFile || !user) return;
        try {
            const updatedFile = await api.updateCaseFile(editingFile.id, data);
            
            // Fix: Changed user.userId to user.id to match the User interface.
            await api.createAuditLog({
                userId: user.id,
                action: `UPDATE_FILE: User updated file '${updatedFile.fileName}'`,
                fileId: updatedFile.id,
                caseId: updatedFile.caseId,
            });

            handleCloseModal();
            fetchData();
        } catch (err: any) {
             setError(err.message || 'Không thể cập nhật hồ sơ tập tin.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa hồ sơ tập tin này không?')) {
            try {
                await api.deleteCaseFile(id);
                fetchData();
            } catch (err: any) {
                setError(err.message || 'Không thể xóa hồ sơ tập tin.');
            }
        }
    };
    
    const getCaseName = (caseId: number) => cases.find(c => c.id === caseId)?.caseName || 'Unknown Case';

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-primary">Quản lý tập tin hồ sơ</h1>
                {isAdmin && <Button onClick={() => handleOpenModal()}><PlusIcon/> Thêm tập tin mới</Button>}
            </div>

            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            
            {loading ? <div className="flex justify-center"><Spinner /></div> : (
                <Card className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-background">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Tên tập tin</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Vụ việc liên quan</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Đường dẫn</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Loại</th>
                                {isAdmin && <th className="px-6 py-3 text-right text-xs font-semibold text-secondary uppercase tracking-wider">Hành động</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {files.map(file => (
                                <tr key={file.id} className="hover:bg-background transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{file.fileName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">{getCaseName(file.caseId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">{file.filePath}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">{file.fileType}</td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => handleOpenModal(file)} className="p-1 text-secondary hover:text-accent"><EditIcon/></button>
                                            <button onClick={() => handleDelete(file.id)} className="p-1 text-secondary hover:text-red-500"><DeleteIcon /></button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                             {files.length === 0 && (
                                <tr>
                                    <td colSpan={isAdmin ? 5 : 4} className="text-center py-16 text-secondary">Không tìm thấy tập tin nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Card>
            )}
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingFile ? 'Chỉnh sửa hồ sơ tập tin' : 'Thêm hồ sơ tập tin mới'}>
               {editingFile ? (
                   <CaseFileEditForm 
                        initialData={editingFile}
                        cases={cases}
                        onSubmit={handleEditSubmit}
                        onCancel={handleCloseModal}
                   />
               ) : (
                   <CaseFileAddForm
                        cases={cases}
                        onSubmit={handleAddSubmit}
                        onCancel={handleCloseModal}
                    />
               )}
            </Modal>
        </div>
    );
};

export default CaseFilesPage;
