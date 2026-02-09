import { useState, useEffect } from 'react';
import { api } from '../../services';
import { toast } from 'react-hot-toast';

interface CreatePostModalProps {
    onClose: () => void;
    onSuccess: () => void;
    post?: any; // If provided, we are editing
}

export default function CreatePostModal({ onClose, onSuccess, post }: CreatePostModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'General Health',
        type: 'article',
        description: '',
        content: '',
        time_to_read: '5 min read',
        author_name: 'Dr. Idibia',
        is_featured: false
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        if (post) {
            setFormData({
                title: post.title,
                category: post.category,
                type: post.type,
                description: post.description || '',
                content: post.content,
                time_to_read: post.time_to_read || '5 min read',
                author_name: post.author_name || 'Dr. Idibia',
                is_featured: post.is_featured ? true : false
            });
        }
    }, [post]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('category', formData.category);
            data.append('type', formData.type);
            data.append('description', formData.description);
            data.append('content', formData.content);
            data.append('time_to_read', formData.time_to_read);
            data.append('author_name', formData.author_name);
            data.append('is_featured', formData.is_featured ? '1' : '0');

            if (imageFile) {
                data.append('image', imageFile);
            }

            if (post) {
                // Update
                data.append('_method', 'PUT'); // Laravel method spoofing for FormData PUT
                await api.post(`/admin/posts/${post.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Post updated successfully');
            } else {
                // Create
                await api.post('/admin/posts', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Post created successfully');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to save post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
        }}>
            <div style={{
                background: 'white', width: '90%', maxWidth: '800px', maxHeight: '90vh',
                overflowY: 'auto', borderRadius: '16px', padding: '30px', position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '20px', right: '20px', border: 'none',
                        background: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8'
                    }}
                >
                    &times;
                </button>

                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#1e293b' }}>
                    {post ? 'Edit Content' : 'Create New Content'}
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#64748b' }}>Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#64748b' }}>Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            >
                                <option>General Health</option>
                                <option>Maternal Health</option>
                                <option>Men's Health</option>
                                <option>Nutrition</option>
                                <option>Mental Health</option>
                                <option>Common Illnesses</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#64748b' }}>Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            >
                                <option value="article">Article</option>
                                <option value="video">Video</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#64748b' }}>Author Name</label>
                            <input
                                type="text"
                                value={formData.author_name}
                                onChange={e => setFormData({ ...formData, author_name: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#64748b' }}>Read Time</label>
                            <input
                                type="text"
                                value={formData.time_to_read}
                                onChange={e => setFormData({ ...formData, time_to_read: e.target.value })}
                                placeholder="e.g. 5 min read"
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#64748b' }}>Cover Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => e.target.files && setImageFile(e.target.files[0])}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}
                        />
                        {post && post.image_url && !imageFile && (
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                                Current image: <a href={post.image_url} target="_blank" rel="noreferrer">View</a>
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#64748b' }}>Short Description (Excerpt)</label>
                        <textarea
                            rows={2}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#64748b' }}>Content (HTML supported)</label>
                        <textarea
                            rows={10}
                            required
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            placeholder="<p>Write your article content here...</p>"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'monospace' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            checked={formData.is_featured}
                            onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                            id="featured"
                            style={{ width: '18px', height: '18px' }}
                        />
                        <label htmlFor="featured" style={{ fontWeight: '500', color: '#334155' }}>Mark as Featured Post</label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', cursor: loading ? 'not-allowed' : 'pointer' }}
                        >
                            {loading ? 'Saving...' : 'Save Content'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
