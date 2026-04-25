import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

const Icons = {
    ArrowLeft: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
    Clock: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    User: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Calendar: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
};

export default function BlogPost({ user }: { user?: any }) {
    const { id } = useParams();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await api.get(`/posts/${id}`);
                setPost(response.data);
            } catch (error) {
                console.error("Failed to fetch blog post", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h1>Post Not Found</h1>
                <Link to="/blog" className="btn btn-primary">Back to Blog</Link>
            </div>
        );
    }

    return (
        <div className="blog-post-view" style={{ minHeight: '100vh', background: 'white' }}>
            <PublicNavbar user={user} />
            
            <div className="container" style={{ padding: '40px 0 80px' }}>
                <button 
                    onClick={() => navigate('/blog')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: '600', marginBottom: '40px' }}
                >
                    <Icons.ArrowLeft /> Back to Articles
                </button>

                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '40px' }}>
                        <span style={{ background: '#eef2ff', color: '#2E37A4', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '800', marginBottom: '20px', display: 'inline-block' }}>
                            {post.category}
                        </span>
                        <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#0f172a', marginBottom: '30px', lineHeight: '1.2' }}>
                            {post.title}
                        </h1>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', color: '#64748b', fontSize: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '30px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#2E37A4' }}>
                                    {post.author_name ? post.author_name.charAt(0) : 'D'}
                                </div>
                                <strong>{post.author_name || 'Dr. Idibia'}</strong>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Icons.Calendar /> {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Icons.Clock /> {post.time_to_read || '5 min read'}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '50px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)' }}>
                        <img 
                            src={post.image_url || `https://images.unsplash.com/photo-1576091160550-2173bdb999ef?auto=format&fit=crop&q=80&w=1200`} 
                            alt={post.title}
                            style={{ width: '100%', height: 'auto', maxHeight: '600px', objectFit: 'cover' }}
                        />
                    </div>

                    <div 
                        className="blog-content"
                        style={{ 
                            fontSize: '18px', lineHeight: '1.8', color: '#334155',
                            fontFamily: "'Plus Jakarta Sans', sans-serif"
                        }}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>
            </div>

            <PublicFooter />
            
            <style>{`
                .blog-content h2 { margin: 40px 0 20px; color: #0f172a; font-size: 28px; }
                .blog-content p { margin-bottom: 25px; }
                .blog-content ul, .blog-content ol { margin-bottom: 25px; padding-left: 20px; }
                .blog-content li { margin-bottom: 10px; }
                @media (max-width: 768px) {
                    .blog-post-view h1 { font-size: 32px !important; }
                }
            `}</style>
        </div>
    );
}
