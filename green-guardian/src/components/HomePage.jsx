import { useState, useEffect, useRef } from "react";
import { 
  Camera, 
  MapPin, 
  Users, 
  Award, 
  Leaf, 
  Globe,
  Sparkles,
  ArrowRight,
  Shield,
  TrendingUp,
  Heart,
  Zap
} from "lucide-react";
import "../styles/HomePage.css";

export default function HomePage({ onNavigate }) {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = (e) => {
      const target = e.target;
      setScrollY(target.scrollTop);
    };

    const scrollContainer = document.querySelector('.home-page');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const features = [
    {
      icon: Camera,
      title: "AI Species Recognition",
      description: "Instantly identify wildlife using advanced machine learning technology",
      color: "#7fb800",
      gradient: "linear-gradient(135deg, #7fb800, #81b29a)"
    },
    {
      icon: MapPin,
      title: "Real-time Location Tracking",
      description: "Discover wildlife observations on an interactive map with AR navigation",
      color: "#667eea",
      gradient: "linear-gradient(135deg, #667eea, #764ba2)"
    },
    {
      icon: Users,
      title: "Global Community",
      description: "Connect with wildlife enthusiasts and share your discoveries worldwide",
      color: "#f093fb",
      gradient: "linear-gradient(135deg, #f093fb, #f5576c)"
    },
    {
      icon: Award,
      title: "Conservation Impact",
      description: "Your observations contribute to wildlife conservation research and protection",
      color: "#feca57",
      gradient: "linear-gradient(135deg, #feca57, #ff9ff3)"
    }
  ];

  const stats = [
    { value: "10K+", label: "Species Identified", icon: Leaf },
    { value: "50K+", label: "Active Users", icon: Users },
    { value: "200K+", label: "Observations", icon: Globe },
    { value: "98%", label: "Accuracy Rate", icon: Sparkles }
  ];

  const steps = [
    {
      number: "01",
      title: "Scan Wildlife",
      description: "Use your camera to capture any animal or plant you encounter",
      icon: Camera
    },
    {
      number: "02",
      title: "Get Instant Results",
      description: "Our AI identifies the species with detailed information in seconds",
      icon: Zap
    },
    {
      number: "03",
      title: "Share & Explore",
      description: "Share your discovery and explore observations from around the world",
      icon: Heart
    }
  ];

  const parallaxOffset = scrollY * 0.5;
  const heroOpacity = Math.max(0, 1 - scrollY / 400);
  const heroScale = Math.max(0.9, 1 - scrollY / 2000);

  return (
    <div className="home-page">
      <section 
        className="hero-section" 
        ref={heroRef}
        style={{
          opacity: heroOpacity,
          transform: `scale(${heroScale}) translateY(${parallaxOffset}px)`
        }}
      >
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <Leaf size={16} />
            <span>Protecting Wildlife Through Technology</span>
          </div>
          
          <h1 className="hero-title">
            Discover & Protect
            <br />
            <span className="hero-title-highlight">Wildlife Together</span>
          </h1>
          
          <p className="hero-description">
            Join thousands of nature enthusiasts using AI-powered species recognition
            to identify, track, and protect wildlife around the globe.
          </p>
          
          <div className="hero-actions">
            <button 
              className="btn-hero btn-hero-primary"
              onClick={() => onNavigate('scan')}
            >
              <Camera size={20} />
              Start Scanning
              <ArrowRight size={20} />
            </button>
            <button 
              className="btn-hero btn-hero-secondary"
              onClick={() => onNavigate('map')}
            >
              <MapPin size={20} />
              Explore Map
            </button>
          </div>
        </div>

        <div className="hero-image">
          <div className="floating-card floating-card-1">
            <img src="/images/wildlife/Butterfly.jpg" alt="Butterfly" />
            <div className="card-overlay">
              <span className="species-name">Monarch Butterfly</span>
              <span className="confidence-badge">96% match</span>
            </div>
          </div>
          <div className="floating-card floating-card-2">
            <img src="/images/wildlife/fox.jpg" alt="Fox" />
            <div className="card-overlay">
              <span className="species-name">Red Fox</span>
              <span className="confidence-badge">89% match</span>
            </div>
          </div>
          <div className="floating-card floating-card-3">
            <img src="/images/wildlife/eagle.jpg" alt="Eagle" />
            <div className="card-overlay">
              <span className="species-name">Bald Eagle</span>
              <span className="confidence-badge">94% match</span>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-container">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className="stat-item"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Icon className="stat-icon" size={32} />
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Powerful Features</h2>
          <p className="section-subtitle">
            Everything you need to explore and protect wildlife
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="feature-card"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div 
                  className="feature-icon"
                  style={{ background: feature.gradient }}
                >
                  <Icon size={32} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="how-it-works-section">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Start contributing to wildlife conservation in three simple steps
          </p>
        </div>

        <div className="steps-container">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index} 
                className="step-item"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="step-number">{step.number}</div>
                <div className="step-icon">
                  <Icon size={40} />
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="step-connector">
                    <ArrowRight size={24} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="impact-section">
        <div className="impact-content">
          <div className="impact-text">
            <div className="impact-badge">
              <Shield size={16} />
              <span>Conservation Impact</span>
            </div>
            <h2 className="impact-title">
              Your Observations
              <br />
              Make a Real Difference
            </h2>
            <p className="impact-description">
              Every species you identify helps researchers track biodiversity,
              monitor endangered species, and protect natural habitats. Join our 
              community of citizen scientists making a global impact.
            </p>
            <div className="impact-stats">
              <div className="impact-stat">
                <TrendingUp size={24} />
                <div>
                  <div className="impact-stat-value">15+</div>
                  <div className="impact-stat-label">Species Protected</div>
                </div>
              </div>
              <div className="impact-stat">
                <Globe size={24} />
                <div>
                  <div className="impact-stat-value">120+</div>
                  <div className="impact-stat-label">Countries Covered</div>
                </div>
              </div>
            </div>
          </div>
          <div className="impact-visual">
            <div className="impact-circle impact-circle-1"></div>
            <div className="impact-circle impact-circle-2"></div>
            <div className="impact-circle impact-circle-3"></div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Start Your Journey?</h2>
          <p className="cta-description">
            Join our community and help protect wildlife for future generations
          </p>
          <div className="cta-actions">
            <button 
              className="btn-cta btn-cta-primary"
              onClick={() => onNavigate('scan')}
            >
              <Camera size={20} />
              Start Scanning Now
            </button>
            <button 
              className="btn-cta btn-cta-secondary"
              onClick={() => onNavigate('feed')}
            >
              <Users size={20} />
              Join Community
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
