import { useState, useEffect } from 'react';
import { api } from '../../services';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Icons = {
    Search: (props: any) => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Play: (props: any) => <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" {...props}><path d="M8 5v14l11-7z" /></svg>,
    Headphones: (props: any) => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
    Check: (props: any) => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
    Share: (props: any) => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>,
    Bookmark: (props: any) => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>,
    Message: (props: any) => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
    ChevronRight: (props: any) => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
    X: (props: any) => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
};

interface Post {
    id: number;
    title: string;
    description: string;
    content: string;
    category: string;
    type: 'article' | 'video';
    image_url: string;
    time_to_read: string;
    is_featured: boolean;
    author_name?: string;
}

export default function Resources() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingPost, setViewingPost] = useState<Post | null>(null);

    const filters = ['All', 'Maternal Health', "Men's Health", 'Nutrition', 'Mental Health', 'Common Illnesses'];

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await api.get('/posts');
                setPosts(response.data);
            } catch (error) {
                console.error("Failed to fetcw resources", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const featuredPost = posts.find(p => p.is_featured) || posts[0];
    const otherPosts = posts.filter(p => p.id !== featuredPost?.id);

    // Filtering logic (client side for now as dataset is small)
    const filteredPosts = activeFilter === 'All'
        ? otherPosts
        : otherPosts.filter(p => p.category === activeFilter);

    if (viewingPost) {
        return (
            <div className="animate-fade-in" style={{ paddingBottom: '40px', background: 'white', minHeight: '100%', borderRadius: '16px' }}>
                <div style={{ position: 'sticky', top: 0, background: 'white', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                    <button onClick={() => setViewingPost(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: '600' }}>
                        <Icons.ChevronRight style={{ transform: 'rotate(180deg)' }} /> Back to Resources
                    </button>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button style={{ background: '#f1f5f9', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', color: '#64748b' }}><Icons.Bookmark /></button>
                        <button style={{ background: '#f1f5f9', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', color: '#64748b' }}><Icons.Share /></button>
                    </div>
                </div>

                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
                    <span style={{ color: '#0284c7', fontWeight: '600', fontSize: '14px', marginBottom: '12px', display: 'block' }}>{viewingPost.category}</span>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '24px', lineHeight: '1.3' }}>{viewingPost.title}</h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', color: '#64748b', fontSize: '14px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {viewingPost.author_name ? viewingPost.author_name.charAt(0) : 'D'}
                        </div>
                        <div>
                            <span style={{ display: 'block', fontWeight: '600', color: '#0f172a' }}>{viewingPost.author_name || 'Dr. Idibia'}</span>
                            <span>{viewingPost.time_to_read} • {new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    <img src={viewingPost.image_url} alt={viewingPost.title} style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '16px', marginBottom: '40px' }} />

                    <div style={{ lineHeight: '1.8', color: '#334155', fontSize: '17px' }} dangerouslySetInnerHTML={{ __html: viewingPost.content }} />
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Resources & Health Hub</h2>
                <div style={{ position: 'relative', width: '400px' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }}><Icons.Search /></span>
                    <input
                        type="text"
                        placeholder="Search topics (e.g., Malaria, Pregnancy, Diet)..."
                        style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '24px', border: '1px solid #e2e8f0', background: 'white', outline: 'none' }}
                    />
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '4px' }}>
                {filters.map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        style={{
                            padding: '8px 16px', borderRadius: '20px', border: '1px solid',
                            borderColor: activeFilter === filter ? '#0284c7' : '#e2e8f0',
                            background: activeFilter === filter ? '#0284c7' : 'white',
                            color: activeFilter === filter ? 'white' : '#64748b',
                            cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap'
                        }}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ display: 'grid', gap: '24px' }}>
                    <Skeleton height={320} borderRadius={16} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                        <Skeleton height={200} borderRadius={16} count={3} />
                    </div>
                </div>
            ) : (
                <>
                    {/* Hero Card (Featured) */}
                    {featuredPost && activeFilter === 'All' && (
                        <div style={{
                            background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0',
                            display: 'grid', gridTemplateColumns: '1.2fr 1fr', marginBottom: '40px', minHeight: '320px'
                        }}>
                            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                    <span style={{ background: '#fef2f2', color: '#ef4444', fontSize: '12px', fontWeight: '600', padding: '4px 8px', borderRadius: '4px' }}>Important Alert</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '12px', fontWeight: '500' }}>
                                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Check /></div>
                                        Medically Reviewed
                                    </span>
                                </div>
                                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', lineHeight: '1.3', marginBottom: '16px' }}>
                                    {featuredPost.title}
                                </h1>
                                <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
                                    {featuredPost.description}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', fontSize: '13px', color: '#64748b' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {featuredPost.author_name ? featuredPost.author_name.charAt(0) : 'A'}
                                    </div>
                                    <span>By <strong>{featuredPost.author_name || 'Dr. Idibia'}</strong> • {featuredPost.time_to_read}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => setViewingPost(featuredPost)}
                                        style={{ background: '#0284c7', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        Read Article <Icons.ChevronRight />
                                    </button>
                                </div>
                            </div>
                            <div style={{
                                backgroundImage: `url('${featuredPost.image_url}')`,
                                backgroundSize: 'cover', backgroundPosition: 'center'
                            }}></div>
                        </div>
                    )}

                    {/* Content & Sidebar Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '32px' }}>

                        {/* Main Content Column */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>Latest Content</h3>
                                <a href="#" style={{ color: '#0284c7', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>View All</a>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                                {filteredPosts.map(card => (
                                    <div key={card.id} onClick={() => setViewingPost(card)} style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                        <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                                            <img src={card.image_url} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            {card.type === 'article' && (
                                                <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', color: '#0f172a' }}>
                                                    {card.category}
                                                </span>
                                            )}
                                            {card.type === 'video' && (
                                                <>
                                                    <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', color: '#0f172a' }}>
                                                        {card.category}
                                                    </span>
                                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                                                        <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                                                            <Icons.Play />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#059669', marginBottom: '8px', fontWeight: '500' }}>
                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px solid #059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Check /></div>
                                                Medically Reviewed
                                            </div>
                                            <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px', lineHeight: '1.4' }}>
                                                {card.title}
                                            </h4>
                                            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', marginBottom: '16px', flex: 1 }}>
                                                {card.description}
                                            </p>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                    {card.type === 'article' ? `Article • ${card.time_to_read}` : 'Watch Now'}
                                                </div>
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                                        <Icons.Bookmark />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                            {/* Ask a Doctor Widget */}
                            <div style={{ background: '#dbeafe', borderRadius: '24px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'relative', zIndex: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                        <div style={{ background: 'white', padding: '8px', borderRadius: '50%', color: '#0284c7' }}><Icons.Message /></div>
                                        <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e3a8a' }}>Ask a Doctor</h4>
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.5', marginBottom: '16px' }}>
                                        Confused by a symptom? Ask our medical community anonymously.
                                    </p>
                                    <textarea
                                        placeholder="Describe your symptom or question..."
                                        style={{ width: '100%', height: '80px', borderRadius: '12px', border: 'none', padding: '12px', fontSize: '13px', marginBottom: '12px', resize: 'none', outline: 'none' }}
                                    ></textarea>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', marginBottom: '16px' }}>
                                        <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></div>
                                        Your identity stays private
                                    </div>
                                    <button style={{ width: '100%', background: '#3b82f6', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                                        Submit Question
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
