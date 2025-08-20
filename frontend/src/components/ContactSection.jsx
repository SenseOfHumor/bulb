
import React, { useState } from 'react';

// Add custom CSS for gradient animation and text alignment
const gradientAnimation = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .contact-form-container * {
    text-align: left !important;
  }
  
  .contact-form-container input,
  .contact-form-container textarea {
    text-align: left !important;
    direction: ltr !important;
  }
`;

export default function ContactSection({ 
  formspreeEndpoint,
  eyebrow = "Get in Touch",
  title = "Let's build something amazing together",
  subtitle = "Have questions? Need a custom solution? We'd love to hear from you.",
  className = "" 
}) {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormState({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Add the CSS animation */}
      <style>{gradientAnimation}</style>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-white/80 ring-1 ring-white/10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-80">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              {eyebrow}
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
            {title}
          </h2>
          
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed text-center">
            {subtitle}
          </p>
        </div>

        {/* Contact Form and Info */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="relative contact-form-container">
            <div className="rounded-3xl p-[1px] bg-gradient-to-b from-white/30 to-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.25)]">
              <div className="rounded-3xl bg-gradient-to-b from-slate-900/70 to-slate-900/40 p-8" style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
                <h3 className="text-xl font-semibold text-white mb-6">Send us a message</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:bg-white/10 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        style={{ textAlign: 'left' }}
                        placeholder="Your name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formState.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:bg-white/10 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        style={{ textAlign: 'left' }}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-white/80 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formState.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:bg-white/10 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      style={{ textAlign: 'left' }}
                      placeholder="What's this about?"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formState.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:bg-white/10 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                      style={{ textAlign: 'left' }}
                      placeholder="Tell us more about your project or question..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_100%] animate-gradient text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      animation: isSubmitting ? 'none' : 'gradient 3s ease infinite'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="22" y1="2" x2="11" y2="13"/>
                          <polygon points="22,2 15,22 11,13 2,9"/>
                        </svg>
                        Send Message
                      </>
                    )}
                  </button>
                </form>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <div className="mt-4 p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm">
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                      Message sent successfully! We'll get back to you soon.
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mt-4 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                      Something went wrong. Please try again.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6 contact-form-container">
            <div className="rounded-3xl p-[1px] bg-gradient-to-b from-white/30 to-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.25)]">
              <div className="rounded-3xl bg-gradient-to-b from-slate-900/70 to-slate-900/40 p-8" style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
                <h3 className="text-xl font-semibold text-white mb-6">Get in touch</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 flex-shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Email</h4>
                      <p className="text-white/70 text-sm">swa2314@gmail.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 flex-shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Location</h4>
                      <p className="text-white/70 text-sm">New Jersey, USA</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 flex-shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Response Time</h4>
                      <p className="text-white/70 text-sm">Usually within 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-3xl p-[1px] bg-gradient-to-b from-white/30 to-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.25)]">
              <div className="rounded-3xl bg-gradient-to-b from-slate-900/70 to-slate-900/40 p-8" style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
                <h3 className="text-xl font-semibold text-white mb-6">Quick Links</h3>
                
                <div className="space-y-3">
                  <a href="#home" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group">
                    <div className="h-2 w-2 rounded-full bg-blue-500 group-hover:bg-blue-400 transition-colors"></div>
                    Home
                  </a>
                  <a href="#about" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group">
                    <div className="h-2 w-2 rounded-full bg-purple-500 group-hover:bg-purple-400 transition-colors"></div>
                    About
                  </a>
                  <a href="#pricing" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 group-hover:bg-indigo-400 transition-colors"></div>
                    Pricing
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
