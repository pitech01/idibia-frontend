
import '../index.css';

export default function Preloader() {
    return (
        <div className="preloader-container">
            <div className="preloader-content">
                {/* Rotating Rings */}
                <div className="spinner-ring ring-1"></div>
                <div className="spinner-ring ring-2"></div>

                {/* Breathing Logo */}
                <div className="logo-center">
                    <img src="/logo.png" alt="IDIBIA" />
                </div>
            </div>

            {/* Elegant Text */}
            <div className="preloader-text-modern">
                <span>I</span><span>D</span><span>I</span><span>B</span><span>I</span><span>A</span>
            </div>
            <p className="preloader-subtext">MEDICAL SERVICES AND LOGISTICS</p>
        </div>
    );
}
