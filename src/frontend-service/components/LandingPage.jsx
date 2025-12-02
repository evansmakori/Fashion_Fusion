import React from 'react';
import { Button } from './ui';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              AI-Powered Fashion<br />
              Transformation Platform
            </h1>
            <p className="hero-subtitle">
              Upload a photo and let AI transform it into multiple style variations 
              with detailed outfit breakdowns and intelligent styling recommendations.
            </p>
            <div className="hero-cta">
              <Button onClick={onGetStarted} className="cta-primary">
                Get Started
              </Button>
              <Button onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} 
                      className="cta-secondary">
                Learn More
              </Button>
            </div>
          </div>
          <div className="hero-image">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="hero-video"
            >
              <source src="/Background.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2 className="section-title">Platform Features</h2>
          <p className="section-description">
            Cutting-edge technology for fashion design and analysis
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="feature-title">AI Image Generation</h3>
            <p className="feature-description">
              Image-to-image transformation using Stability AI. Generate 4 distinct style 
              variations from a single photo while maintaining the person's features.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="feature-title">Intelligent Analysis</h3>
            <p className="feature-description">
              Vultr AI-powered fashion analysis with automatic item detection, price estimation, 
              confidence scoring, and context-aware styling recommendations.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="feature-title">Style Variations</h3>
            <p className="feature-description">
              Generate professional business attire, relaxed casual wear, urban streetwear, 
              and elegant dinner outfits from a single source image.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="feature-title">E-commerce Integration</h3>
            <p className="feature-description">
              Complete shopping experience with product catalog, cart management, 
              order processing, payment integration, and address validation.
            </p>
          </div>
        </div>
      </section>

      {/* Styles Showcase Section */}
      <section className="styles-section">
        <div className="section-header">
          <h2 className="section-title">Style Collections</h2>
          <p className="section-description">
            Transform your fashion vision across multiple styles
          </p>
        </div>
        <div className="styles-grid">
          <div className="style-card">
            <div className="style-image">
              <img src="/Professional.jpg" alt="Professional Style" />
              <div className="style-overlay">
                <h3>Professional</h3>
                <p>Business attire and formal office fashion</p>
              </div>
            </div>
          </div>
          <div className="style-card">
            <div className="style-image">
              <img src="/Casual.jpg" alt="Casual Style" />
              <div className="style-overlay">
                <h3>Casual</h3>
                <p>Relaxed everyday wear</p>
              </div>
            </div>
          </div>
          <div className="style-card">
            <div className="style-image">
              <img src="/Streetwear.jpg" alt="Streetwear Style" />
              <div className="style-overlay">
                <h3>Streetwear</h3>
                <p>Urban trendy styles</p>
              </div>
            </div>
          </div>
          <div className="style-card">
            <div className="style-image">
              <img src="/Dinner.jpg" alt="Dinner Style" />
              <div className="style-overlay">
                <h3>Dinner</h3>
                <p>Elegant evening outfits</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="technology-section">
        <div className="tech-content">
          <div className="tech-text">
            <h2 className="section-title">Advanced Technology</h2>
            <div className="tech-features">
              <div className="tech-item">
                <div className="tech-number">01</div>
                <div className="tech-details">
                  <h4>High-Quality Output</h4>
                  <p>Generate stunning 1024x1024 images with precise detail preservation</p>
                </div>
              </div>
              <div className="tech-item">
                <div className="tech-number">02</div>
                <div className="tech-details">
                  <h4>Smart Detection</h4>
                  <p>Automatic identification of shirts, pants, shoes, and accessories</p>
                </div>
              </div>
              <div className="tech-item">
                <div className="tech-number">03</div>
                <div className="tech-details">
                  <h4>Price Intelligence</h4>
                  <p>AI-powered price estimation with confidence scoring</p>
                </div>
              </div>
              <div className="tech-item">
                <div className="tech-number">04</div>
                <div className="tech-details">
                  <h4>Context-Aware Tips</h4>
                  <p>Personalized styling recommendations based on selected style</p>
                </div>
              </div>
            </div>
          </div>
          <div className="tech-stats">
            <div className="stat-card">
              <div className="stat-number">4</div>
              <div className="stat-label">Style Variations</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">1024²</div>
              <div className="stat-label">Image Resolution</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">AI</div>
              <div className="stat-label">Powered Analysis</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Fashion?</h2>
          <p className="cta-description">
            Start creating stunning style variations with AI-powered fashion technology
          </p>
          <Button onClick={onGetStarted} className="cta-button">
            Start Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
