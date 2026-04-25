import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';

const team = [
    {
        name: "Dr. Micheal Adebayo",
        role: "Chief Medical Officer",
        specialty: "Cardiology",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
        bio: "Over 15 years of experience in cardiovascular health and digital medicine integration."
    },
    {
        name: "Dr. Sarah Chen",
        role: "Head of Diagnostics",
        specialty: "Pathology",
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400",
        bio: "Leads our mobile diagnostic unit with a focus on rapid and accurate testing protocols."
    },
    {
        name: "Nurse Blessing Okoro",
        role: "Head of Patient Care",
        specialty: "Nursing Informatics",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
        bio: "Ensures that every patient receives compassionate and personalized care through our platform."
    },
    {
        name: "Dr. James Wilson",
        role: "Technical Director",
        specialty: "Health Tech",
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
        bio: "The architect behind IDIBIA's secure and seamless telemedicine infrastructure."
    },
    {
        name: "Dr. Fatima Yusuf",
        role: "Pediatric Lead",
        specialty: "Pediatrics",
        image: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=400",
        bio: "Dedicated to improving child health through innovative virtual pediatric consultations."
    },
    {
        name: "Dr. David Smith",
        role: "Emergency Response",
        specialty: "Emergency Medicine",
        image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
        bio: "Coordinates our rapid response team and critical care protocols."
    }
];

export default function Team({ user }: { user?: any }) {
    return (
        <div className="team-page" style={{ background: '#f8fafc' }}>
            <PublicNavbar user={user} />

            {/* Header */}
            <section style={{ 
                background: 'linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.9)), url("https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=2000")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '100px 0', 
                color: 'white', 
                textAlign: 'center' 
            }}>
                <div className="container">
                    <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '20px' }}>Meet Our Experts</h1>
                    <p style={{ fontSize: '18px', opacity: 0.8, maxWidth: '600px', margin: '0 auto' }}>
                        The dedicated medical and technical professionals behind IDIBIA's healthcare revolution.
                    </p>
                </div>
            </section>

            <section className="section-padding">
                <div className="container">
                    <div className="grid-3" style={{ gap: '40px' }}>
                        {team.map((member, i) => (
                            <div key={i} className="team-card" style={{ 
                                background: 'white', 
                                borderRadius: '32px', 
                                overflow: 'hidden', 
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                                border: '1px solid #f1f5f9',
                                transition: 'transform 0.3s ease'
                            }}>
                                <div style={{ height: '300px', overflow: 'hidden' }}>
                                    <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ padding: '30px' }}>
                                    <span style={{ color: '#2E37A4', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', marginBottom: '10px', display: 'block' }}>{member.role}</span>
                                    <h3 style={{ fontSize: '22px', color: '#0f172a', marginBottom: '10px' }}>{member.name}</h3>
                                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px', fontWeight: '600' }}>Specialty: {member.specialty}</p>
                                    <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>{member.bio}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Join Us CTA */}
                    <div style={{ 
                        marginTop: '100px', 
                        padding: '60px', 
                        background: 'white', 
                        borderRadius: '40px', 
                        textAlign: 'center',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
                        border: '1px solid #f1f5f9'
                    }}>
                        <h2 style={{ fontSize: '32px', color: '#0f172a', marginBottom: '20px' }}>Want to Join Our Medical Team?</h2>
                        <p style={{ color: '#64748b', fontSize: '18px', maxWidth: '600px', margin: '0 auto 40px' }}>
                            We're always looking for passionate medical professionals to help us expand our reach across Nigeria.
                        </p>
                        <a href="/register" className="btn btn-primary" style={{ padding: '15px 40px', borderRadius: '30px', fontSize: '16px' }}>Apply to Join</a>
                    </div>
                </div>
            </section>

            <PublicFooter />

            <style>{`
                .team-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important;
                }
            `}</style>
        </div>
    );
}
