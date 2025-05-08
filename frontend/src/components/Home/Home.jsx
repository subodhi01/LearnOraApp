import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to LearnOra</h1>
          <p className="hero-subtitle">Your journey to knowledge starts here</p>
          {!user && (
            <div className="hero-buttons">
              <Link to="/signup" className="cta-button primary">
                <i className="fas fa-rocket"></i>
                Get Started
              </Link>
              <Link to="/courses" className="cta-button secondary">
                <i className="fas fa-compass"></i>
                Explore Courses
              </Link>
            </div>
          )}
        </div>
        <div className="hero-image">
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80" 
            alt="Students learning together" 
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose LearnOra?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-graduation-cap"></i>
            <h3>Structured Learning</h3>
            <p>Follow carefully designed learning paths to achieve your goals</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-users"></i>
            <h3>Community Support</h3>
            <p>Connect with fellow learners and share your journey</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-chart-line"></i>
            <h3>Track Progress</h3>
            <p>Monitor your learning progress with detailed analytics</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-book"></i>
            <h3>Rich Resources</h3>
            <p>Access a vast library of learning materials and resources</p>
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="popular-courses">
        <h2>Popular Courses</h2>
        <div className="courses-grid">
          <div className="course-card">
            <div className="course-image">
              <img 
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1472&q=80" 
                alt="Web Development" 
              />
              <div className="course-overlay">
                <span className="course-level">Beginner</span>
              </div>
            </div>
            <div className="course-content">
              <h3>Web Development</h3>
              <p>Master modern web development with HTML, CSS, and JavaScript</p>
              <div className="course-meta">
                <span><i className="fas fa-clock"></i> 12 weeks</span>
                <span><i className="fas fa-users"></i> 1.2k students</span>
              </div>
              <Link to="/courses/web-development" className="course-link">
                Learn More <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>
          <div className="course-card">
            <div className="course-image">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                alt="Data Science" 
              />
              <div className="course-overlay">
                <span className="course-level">Intermediate</span>
              </div>
            </div>
            <div className="course-content">
              <h3>Data Science</h3>
              <p>Learn data analysis, visualization, and machine learning</p>
              <div className="course-meta">
                <span><i className="fas fa-clock"></i> 16 weeks</span>
                <span><i className="fas fa-users"></i> 2.5k students</span>
              </div>
              <Link to="/courses/data-science" className="course-link">
                Learn More <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>
          <div className="course-card">
            <div className="course-image">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1415&q=80" 
                alt="Digital Marketing" 
              />
              <div className="course-overlay">
                <span className="course-level">All Levels</span>
              </div>
            </div>
            <div className="course-content">
              <h3>Digital Marketing</h3>
              <p>Master SEO, social media, and content marketing</p>
              <div className="course-meta">
                <span><i className="fas fa-clock"></i> 10 weeks</span>
                <span><i className="fas fa-users"></i> 3.1k students</span>
              </div>
              <Link to="/courses/digital-marketing" className="course-link">
                Learn More <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Plans Section */}
      <section className="learning-plans">
        <h2>Featured Learning Plans</h2>
        <div className="plans-grid">
          <div className="plan-card">
            <div className="plan-image">
              <img 
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                alt="Full Stack Development" 
              />
              <div className="plan-overlay">
                <span className="plan-duration">6 Months</span>
              </div>
            </div>
            <div className="plan-content">
              <h3>Full Stack Development</h3>
              <p>Master both frontend and backend development with this comprehensive plan</p>
              <div className="plan-meta">
                <span><i className="fas fa-book"></i> 12 Courses</span>
                <span><i className="fas fa-users"></i> 3.5k learners</span>
              </div>
              <div className="plan-progress">
                <div className="progress-bar">
                  <div className="progress" style={{ width: '75%' }}></div>
                </div>
                <span>75% Complete</span>
              </div>
              <Link to="/learning-plans/full-stack" className="plan-link">
                View Plan <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>

          <div className="plan-card">
            <div className="plan-image">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                alt="Data Science Career" 
              />
              <div className="plan-overlay">
                <span className="plan-duration">8 Months</span>
              </div>
            </div>
            <div className="plan-content">
              <h3>Data Science Career</h3>
              <p>From Python basics to advanced machine learning and AI</p>
              <div className="plan-meta">
                <span><i className="fas fa-book"></i> 15 Courses</span>
                <span><i className="fas fa-users"></i> 2.8k learners</span>
              </div>
              <div className="plan-progress">
                <div className="progress-bar">
                  <div className="progress" style={{ width: '60%' }}></div>
                </div>
                <span>60% Complete</span>
              </div>
              <Link to="/learning-plans/data-science" className="plan-link">
                View Plan <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>

          <div className="plan-card">
            <div className="plan-image">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1415&q=80" 
                alt="Digital Marketing Mastery" 
              />
              <div className="plan-overlay">
                <span className="plan-duration">4 Months</span>
              </div>
            </div>
            <div className="plan-content">
              <h3>Digital Marketing Mastery</h3>
              <p>Learn SEO, social media, content marketing, and analytics</p>
              <div className="plan-meta">
                <span><i className="fas fa-book"></i> 8 Courses</span>
                <span><i className="fas fa-users"></i> 4.2k learners</span>
              </div>
              <div className="plan-progress">
                <div className="progress-bar">
                  <div className="progress" style={{ width: '90%' }}></div>
                </div>
                <span>90% Complete</span>
              </div>
              <Link to="/learning-plans/digital-marketing" className="plan-link">
                View Plan <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Learning?</h2>
          <p>Join thousands of learners worldwide and begin your journey today</p>
          {!user ? (
            <Link to="/signup" className="cta-button primary">
              <i className="fas fa-rocket"></i>
              Get Started Now
            </Link>
          ) : (
            <Link to="/dashboard" className="cta-button primary">
              <i className="fas fa-tachometer-alt"></i>
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home; 