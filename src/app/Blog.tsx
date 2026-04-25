import { useState, useEffect } from 'react';
import { api } from '../services';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

const Icons = {
    Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Clock: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    ArrowRight: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7-7 7M3 12h18" /></svg>,
    User: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
};

export default function Blog({ user }: { user?: any }) {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await api.get('/posts');
                setPosts(response.data);
            } catch (error) {
                console.error("Failed to fetch blog posts", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="blog-page" style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <PublicNavbar user={user} />
            
            {/* Hero Header */}
            <div style={{ background: '#0f172a', color: 'white', padding: '80px 0', textAlign: 'center' }}>
                <div className="container">
                    <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '20px' }}>Health Updates & Medical Insights</h1>
                    <p style={{ fontSize: '18px', opacity: 0.8, maxWidth: '600px', margin: '0 auto 40px' }}>
                        Stay informed with the latest healthcare tips, news, and expert advice from our medical team.
                    </p>
                    
                    {/* Search */}
                    <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                            <Icons.Search />
                        </span>
                        <input 
                            type="text" 
                            placeholder="Search articles, topics or categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                width: '100%', padding: '18px 20px 18px 55px', borderRadius: '50px', 
                                border: 'none', background: 'white', color: '#0f172a', fontSize: '16px',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="container" style={{ padding: '80px 0' }}>
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} style={{ height: '450px', background: 'white', borderRadius: '24px', animation: 'pulse 2s infinite' }}></div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
                            {filteredPosts.map(post => (
                                <div key={post.id} className="blog-card-v2" onClick={() => navigate(`/blog/${post.id}`)} style={{ 
                                    background: 'white', borderRadius: '24px', overflow: 'hidden', 
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9',
                                    transition: 'all 0.3s ease', cursor: 'pointer'
                                }}>
                                    <div style={{ height: '240px', background: '#e2e8f0', overflow: 'hidden' }}>
                                        <img 
                                            src={post.image_url || `https://images.unsplash.com/photo-1576091160550-2173bdb999ef?auto=format&fit=crop&q=80&w=800`} 
                                            alt={post.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div style={{ padding: '30px' }}>
                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                            <span style={{ background: '#eef2ff', color: '#2E37A4', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                                                {post.category}
                                            </span>
                                            <span style={{ color: '#94a3b8', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Icons.Clock /> {post.time_to_read || '5 min read'}
                                            </span>
                                        </div>
                                        <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '15px', lineHeight: '1.4' }}>
                                            {post.title}
                                        </h3>
                                        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '25px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {post.description}
                                        </p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '13px' }}>
                                                <Icons.User /> {post.author_name || 'Dr. Idibia'}
                                            </div>
                                            <span style={{ color: '#2E37A4', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                Read More <Icons.ArrowRight />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {filteredPosts.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                                <h3 style={{ fontSize: '24px', color: '#0f172a' }}>No articles found matching "{searchTerm}"</h3>
                                <button onClick={() => setSearchTerm('')} className="btn btn-primary" style={{ marginTop: '20px' }}>Clear Search</button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <PublicFooter />
            
            <style>{`
                .blog-card-v2:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important;
                    border-color: #2E37A4 !important;
                }
            `}</style>
        </div>
    );
}
