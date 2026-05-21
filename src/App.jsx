import React, { useState, useEffect, useRef } from 'react';

const ComplimentBalloon = () => {
  const [step, setStep] = useState('landing');
  const [relationship, setRelationship] = useState(null);
  const [customRelationship, setCustomRelationship] = useState('');
  const [compliments, setCompliments] = useState([]);
  const [popped, setPopped] = useState([]);
  const [activeEffect, setActiveEffect] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const balloonId = params.get('b');
    if (balloonId) {
      setStep('relationship');
    }
  }, []);

  useEffect(() => {
    if (activeEffect !== null) {
      drawEffect(activeEffect.effectType);
    }
  }, [activeEffect]);

  const generateCompliments = async (relationshipType, customText = '') => {
    setStep('loading');
    
    try {
      const relationshipDesc = customText || relationshipType;
      
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Someone described their relationship to the person sending them this as: "${relationshipDesc}"

Generate exactly 6 genuine, clever compliments that fit this specific relationship context. Make them:
- Contextually appropriate and smart (reference the relationship type if it's unique/funny)
- Warm and authentic (not generic)
- A mix of sweet and playful
- Each 8-15 words max
- No quotation marks
- If it's a weird/unique relationship, embrace that humor

Return ONLY a JSON array of strings, nothing else. Example:
["compliment 1", "compliment 2", ...]`
          }],
        })
      });

      const data = await response.json();
      const text = data.content.find(c => c.type === 'text')?.text || '';
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      
      setCompliments(parsed);
      setStep('pop');
    } catch (error) {
      console.error('Error:', error);
      const fallbacks = {
        'crush': [
          "Your smile genuinely makes my day better",
          "You're somehow both adorable and incredibly cool",
          "I love how passionate you are about things",
          "Your energy is actually contagious in the best way",
          "You make even boring things feel fun",
          "I think you're pretty wonderful, just saying"
        ],
        'best friend': [
          "You're the most loyal person I know",
          "Our chaotic energy together is unmatched",
          "You get me in a way most people don't",
          "Life is genuinely better with you in it",
          "You're the person I want to tell everything to",
          "Thanks for being consistently amazing"
        ],
        'friend': [
          "You're such a genuinely good person",
          "Your vibe is always immaculate",
          "You make everyone around you feel comfortable",
          "I really appreciate how real you are",
          "You're so much fun to be around",
          "Glad we're friends honestly"
        ],
        'person I know': [
          "You seem like a really solid person",
          "Your energy is really positive",
          "I respect how you carry yourself",
          "You're pretty cool from what I've seen",
          "You have good taste in things",
          "Keep doing your thing, it's working"
        ]
      };
      setCompliments(fallbacks[relationshipType] || fallbacks['friend']);
      setStep('pop');
    }
  };

  const drawEffect = (effectType) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#FF6B9D', '#FFE66D', '#4ECDC4', '#A8E6CF', '#FF8B94', '#C7CEEA'];
    
    // Confetti explosion
    for (let i = 0; i < 150; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = Math.random() * 12 + 4;
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 5,
        size: Math.random() * 12 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20,
        opacity: 1,
        shape: Math.random() > 0.5 ? 'circle' : 'square'
      });
    }

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4; // gravity
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.008;
        
        ctx.globalAlpha = p.opacity;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        
        ctx.restore();
      });

      ctx.globalAlpha = 1;

      if (frame < 180) {
        requestAnimationFrame(animate);
      } else {
        setActiveEffect(null);
      }
    };

    animate();
  };

  const handleRelationshipSelect = (type) => {
    setRelationship(type);
    if (type === 'other') {
      setStep('custom_input');
    } else {
      generateCompliments(type);
    }
  };

  const handleCustomSubmit = () => {
    if (customRelationship.trim()) {
      generateCompliments('other', customRelationship);
    }
  };

  const popBalloon = (index) => {
    if (!popped.includes(index)) {
      setPopped([...popped, index]);
      setActiveEffect({ index, effectType: 'confetti' });
    }
  };

  const createBalloon = () => {
    const balloonId = Math.random().toString(36).substring(7);
    const url = `${window.location.origin}${window.location.pathname}?b=${balloonId}`;
    navigator.clipboard.writeText(url);
    alert('🎈 Balloon link copied! Send it to someone special.');
  };

  // Balloon colors
  const balloonColors = [
    '#FF6B9D', // pink
    '#FFE66D', // yellow
    '#4ECDC4', // teal
    '#A8E6CF', // mint
    '#FF8B94', // coral
    '#C7CEEA'  // lavender
  ];

  // LANDING PAGE
  if (step === 'landing') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: '"Fredoka", sans-serif'
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap" rel="stylesheet" />
        
        <div style={{
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '8rem',
            marginBottom: '20px',
            animation: 'float 3s ease-in-out infinite'
          }}>
            🎈
          </div>
          
          <h2 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '20px',
            textTransform: 'lowercase',
            letterSpacing: '-1px'
          }}>
            compliment<br/>balloon
          </h2>
          
          <p style={{
            color: 'rgba(255,255,255,0.95)',
            fontSize: '1.2rem',
            marginBottom: '40px',
            lineHeight: '1.6',
            fontWeight: 400
          }}>
            send balloons full of compliments.<br/>
            they pop each one. chaos ensues. 🎉
          </p>
          
          <button
            onClick={createBalloon}
            style={{
              background: '#FFE66D',
              border: 'none',
              borderRadius: '100px',
              padding: '22px 55px',
              fontSize: '1.3rem',
              fontWeight: 600,
              color: '#667eea',
              cursor: 'pointer',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              transition: 'all 0.3s',
              fontFamily: '"Fredoka", sans-serif',
              textTransform: 'lowercase'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px) scale(1.05)';
              e.target.style.boxShadow = '0 15px 50px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 10px 40px rgba(0,0,0,0.3)';
            }}
          >
            create balloon 🎈
          </button>
          
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // RELATIONSHIP SELECTION
  if (step === 'relationship') {
    const options = [
      { value: 'crush', emoji: '😳', label: 'crush' },
      { value: 'best friend', emoji: '💕', label: 'best friend' },
      { value: 'friend', emoji: '✨', label: 'friend' },
      { value: 'person I know', emoji: '👋', label: 'person i know' },
      { value: 'other', emoji: '🤔', label: 'other...' }
    ];

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: '"Fredoka", sans-serif'
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap" rel="stylesheet" />
        
        <div style={{
          maxWidth: '650px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '50px',
            lineHeight: '1.2',
            textTransform: 'lowercase'
          }}>
            who am i to you?
          </h1>
          
          <div style={{
            display: 'grid',
            gap: '18px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))'
          }}>
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleRelationshipSelect(opt.value)}
                style={{
                  background: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '35px 25px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  fontFamily: '"Fredoka", sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-8px) scale(1.03)';
                  e.target.style.boxShadow = '0 12px 35px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 6px 25px rgba(0,0,0,0.2)';
                }}
              >
                <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>{opt.emoji}</div>
                <div style={{
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: '#f5576c',
                  textTransform: 'lowercase'
                }}>
                  {opt.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // CUSTOM INPUT
  if (step === 'custom_input') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: '"Fredoka", sans-serif'
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap" rel="stylesheet" />
        
        <div style={{
          maxWidth: '550px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 2.8rem)',
            fontWeight: 700,
            color: '#333',
            marginBottom: '25px',
            lineHeight: '1.3',
            textTransform: 'lowercase'
          }}>
            okay, who am i to you exactly? 🤔
          </h1>
          
          <p style={{
            color: '#666',
            fontSize: '1.15rem',
            marginBottom: '35px',
            fontWeight: 400
          }}>
            (be specific! the weirder, the better)
          </p>
          
          <input
            type="text"
            value={customRelationship}
            onChange={(e) => setCustomRelationship(e.target.value)}
            placeholder="ex: my cat's favorite human"
            style={{
              width: '100%',
              padding: '22px',
              fontSize: '1.15rem',
              border: '4px solid #fed6e3',
              borderRadius: '20px',
              fontFamily: '"Fredoka", sans-serif',
              outline: 'none',
              marginBottom: '25px',
              boxSizing: 'border-box',
              fontWeight: 500
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
          />
          
          <button
            onClick={handleCustomSubmit}
            disabled={!customRelationship.trim()}
            style={{
              background: customRelationship.trim() ? '#fed6e3' : '#ddd',
              border: 'none',
              borderRadius: '100px',
              padding: '20px 45px',
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#333',
              cursor: customRelationship.trim() ? 'pointer' : 'not-allowed',
              boxShadow: customRelationship.trim() ? '0 6px 25px rgba(0,0,0,0.2)' : 'none',
              transition: 'all 0.3s',
              fontFamily: '"Fredoka", sans-serif',
              textTransform: 'lowercase',
              opacity: customRelationship.trim() ? 1 : 0.6
            }}
            onMouseEnter={(e) => {
              if (customRelationship.trim()) {
                e.target.style.transform = 'translateY(-3px) scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (customRelationship.trim()) {
                e.target.style.transform = 'translateY(0) scale(1)';
              }
            }}
          >
            generate ✨
          </button>
        </div>
      </div>
    );
  }

  // LOADING
  if (step === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Fredoka", sans-serif'
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap" rel="stylesheet" />
        
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '7rem',
            animation: 'bounce 1s ease-in-out infinite',
            marginBottom: '25px'
          }}>
            🎈
          </div>
          
          <h2 style={{
            fontSize: '2.2rem',
            fontWeight: 700,
            color: '#fff',
            textTransform: 'lowercase'
          }}>
            filling balloons...
          </h2>
          
          <style>{`
            @keyframes bounce {
              0%, 100% { transform: translateY(0) scale(1); }
              50% { transform: translateY(-30px) scale(1.1); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // POP PAGE - ACTUAL BALLOONS!
  if (step === 'pop') {
    const allPopped = popped.length === compliments.length;

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        fontFamily: '"Fredoka", sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap" rel="stylesheet" />
        
        <canvas
          ref={canvasRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            zIndex: 1000
          }}
        />
        
        <div style={{
          maxWidth: '900px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '15px',
            textTransform: 'lowercase',
            letterSpacing: '-1px'
          }}>
            {allPopped ? '🎉 all popped! 🎉' : 'tap to pop! 🎈'}
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.95)',
            fontSize: '1.3rem',
            marginBottom: '50px',
            fontWeight: 500
          }}>
            {allPopped 
              ? "you're amazing. someone wanted you to know that." 
              : `${popped.length}/${compliments.length} popped`
            }
          </p>

          {/* BALLOONS GRID */}
          <div style={{
            display: 'grid',
            gap: '30px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            marginBottom: '50px'
          }}>
            {compliments.map((comp, idx) => {
              const isPopped = popped.includes(idx);
              const color = balloonColors[idx % balloonColors.length];
              
              return (
                <div
                  key={idx}
                  onClick={() => popBalloon(idx)}
                  style={{
                    cursor: isPopped ? 'default' : 'pointer',
                    animation: isPopped ? 'none' : `float ${3 + idx * 0.3}s ease-in-out infinite`,
                    animationDelay: `${idx * 0.2}s`,
                    position: 'relative',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isPopped) e.currentTarget.style.transform = 'scale(1.08)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isPopped) e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {isPopped ? (
                    // Popped state - show compliment
                    <div style={{
                      background: 'rgba(255,255,255,0.95)',
                      borderRadius: '25px',
                      padding: '30px 25px',
                      minHeight: '180px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                      opacity: 0.85
                    }}>
                      <p style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        color: '#667eea',
                        lineHeight: '1.5',
                        margin: 0
                      }}>
                        {comp}
                      </p>
                    </div>
                  ) : (
                    // Balloon - SVG
                    <svg
                      viewBox="0 0 200 280"
                      style={{
                        width: '100%',
                        maxWidth: '200px',
                        margin: '0 auto',
                        filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.3))'
                      }}
                    >
                      {/* Balloon body */}
                      <ellipse
                        cx="100"
                        cy="110"
                        rx="85"
                        ry="105"
                        fill={color}
                        opacity="0.95"
                      />
                      
                      {/* Shine */}
                      <ellipse
                        cx="70"
                        cy="80"
                        rx="25"
                        ry="35"
                        fill="rgba(255,255,255,0.4)"
                      />
                      
                      {/* Knot */}
                      <ellipse
                        cx="100"
                        cy="218"
                        rx="8"
                        ry="12"
                        fill={color}
                        opacity="0.8"
                      />
                      
                      {/* String */}
                      <path
                        d="M 100 230 Q 95 245 100 260 T 100 280"
                        stroke="rgba(255,255,255,0.6)"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>

          {allPopped && (
            <button
              onClick={() => {
                setStep('landing');
                setPopped([]);
                setCompliments([]);
                setRelationship(null);
                setCustomRelationship('');
                window.history.pushState({}, '', window.location.pathname);
              }}
              style={{
                background: '#FFE66D',
                border: 'none',
                borderRadius: '100px',
                padding: '22px 55px',
                fontSize: '1.3rem',
                fontWeight: 600,
                color: '#667eea',
                cursor: 'pointer',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                transition: 'all 0.3s',
                fontFamily: '"Fredoka", sans-serif',
                textTransform: 'lowercase'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px) scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
              }}
            >
              make your own 🎨
            </button>
          )}
          
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(-2deg); }
              50% { transform: translateY(-15px) rotate(2deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return null;
};

export default ComplimentBalloon;
