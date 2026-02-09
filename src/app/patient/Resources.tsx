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

const FALLBACK_IMAGE = 'https://placehold.co/600x400?text=Health+Resource';

export default function Resources() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingPost, setViewingPost] = useState<Post | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6;

    const filters = ['All', 'Maternal Health', "Men's Health", 'Nutrition', 'Mental Health', 'Common Illnesses'];

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await api.get('/posts');
                setPosts(response.data);
            } catch (error) {
                console.error("Failed to fetch resources", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const featuredPosts = posts.filter(p => p.is_featured);
    const effectiveFeaturedPosts = featuredPosts.length > 0 ? featuredPosts : (posts.length > 0 ? [posts[0]] : []);
    const currentFeaturedPost = effectiveFeaturedPosts[currentSlide] || effectiveFeaturedPosts[0];
    const otherPosts = posts.filter(p => !effectiveFeaturedPosts.find(fp => fp.id === p.id));

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % effectiveFeaturedPosts.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? effectiveFeaturedPosts.length - 1 : prev - 1));
    };

    // Auto-slide
    useEffect(() => {
        if (effectiveFeaturedPosts.length <= 1) return;
        const interval = setInterval(nextSlide, 6000);
        return () => clearInterval(interval);
    }, [currentSlide, effectiveFeaturedPosts.length]);

    // Filtering logic (client side for now as dataset is small)
    const filteredPosts = activeFilter === 'All'
        ? otherPosts
        : otherPosts.filter(p => p.category === activeFilter);

    // Pagination logic
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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

                    <img src={viewingPost.image_url || FALLBACK_IMAGE} alt={viewingPost.title} style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '16px', marginBottom: '40px' }} />

                    <div style={{ lineHeight: '1.8', color: '#334155', fontSize: '17px' }} dangerouslySetInnerHTML={{ __html: viewingPost.content }} />
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
            {/* Header */}
            <div className="resources-header">
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Resources & Health Hub</h2>
                <div className="resources-search-container">
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
                    {/* Hero Card (Featured Slider) */}
                    {currentFeaturedPost && activeFilter === 'All' && (
                        <div className="featured-card" style={{ position: 'relative' }}>
                            <div className="featured-content">
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                    <span style={{ background: '#fef2f2', color: '#ef4444', fontSize: '12px', fontWeight: '600', padding: '4px 8px', borderRadius: '4px' }}>
                                        Featured Update {effectiveFeaturedPosts.length > 1 ? `(${currentSlide + 1}/${effectiveFeaturedPosts.length})` : ''}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '12px', fontWeight: '500' }}>
                                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Check /></div>
                                        Medically Reviewed
                                    </span>
                                </div>
                                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', lineHeight: '1.3', marginBottom: '16px' }}>
                                    {currentFeaturedPost.title}
                                </h1>
                                <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
                                    {currentFeaturedPost.description}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', fontSize: '13px', color: '#64748b' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {currentFeaturedPost.author_name ? currentFeaturedPost.author_name.charAt(0) : 'A'}
                                    </div>
                                    <span>By <strong>{currentFeaturedPost.author_name || 'Dr. Idibia'}</strong> • {currentFeaturedPost.time_to_read}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <button
                                        onClick={() => setViewingPost(currentFeaturedPost)}
                                        style={{ background: '#0284c7', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        Read Article <Icons.ChevronRight />
                                    </button>

                                    {effectiveFeaturedPosts.length > 1 && (
                                        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                            <button
                                                onClick={prevSlide}
                                                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                                <Icons.ChevronRight style={{ transform: 'rotate(180deg)', width: '14px' }} />
                                            </button>
                                            <button
                                                onClick={nextSlide}
                                                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                                <Icons.ChevronRight style={{ width: '14px' }} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="featured-image" style={{
                                backgroundImage: `url('${currentFeaturedPost.image_url || FALLBACK_IMAGE}')`,
                                transition: 'background-image 0.5s ease-in-out'
                            }}></div>
                        </div>
                    )}

                    {/* Content Grid */}
                    <div style={{ marginTop: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>Latest Content</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                            {currentPosts.map(card => (
                                <div key={card.id} onClick={() => setViewingPost(card)} style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', height: '100%' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                                        <img src={card.image_url || FALLBACK_IMAGE} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#059669', marginBottom: '8px', fontWeight: '500' }}>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px solid #059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Check /></div>
                                            Medically Reviewed
                                        </div>
                                        <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px', lineHeight: '1.4' }}>
                                            {card.title}
                                        </h4>
                                        <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '16px', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {card.description}
                                        </p>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: 'auto' }}>
                                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
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

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '40px' }}>
                                <button
                                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        background: currentPage === 1 ? '#f1f5f9' : 'white',
                                        color: currentPage === 1 ? '#cbd5e1' : '#64748b',
                                        border: '1px solid #e2e8f0',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Previous
                                </button>
                                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        background: currentPage === totalPages ? '#f1f5f9' : 'white',
                                        color: currentPage === totalPages ? '#cbd5e1' : '#64748b',
                                        border: '1px solid #e2e8f0',
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
