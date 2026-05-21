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
    
    // Different effects based on type
    switch(effectType) {
      case 'hearts':
        // Floating hearts
        for (let i = 0; i < 30; i++) {
          particles.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 200,
            y: canvas.height / 2 + (Math.random() - 0.5) * 200,
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 4 - 2,
            size: Math.random() * 20 + 15,
            opacity: 1,
            rotation: Math.random() * 360,
            type: 'heart',
            color: ['#FF6B9D', '#C44569', '#FF8E9E'][Math.floor(Math.random() * 3)]
          });
        }
        break;
        
      case 'stars':
        // Star burst
        for (let i = 0; i < 50; i++) {
          const angle = (i / 50) * Math.PI * 2;
          const speed = Math.random() * 8 + 4;
          particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 15 + 8,
            opacity: 1,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 20,
            type: 'star',
            color: ['#FFE66D', '#FFF700', '#FFED4E'][Math.floor(Math.random() * 3)]
          });
        }
        break;
        
      case 'bubbles':
        // Rising bubbles
        for (let i = 0; i < 40; i++) {
          particles.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 300,
            y: canvas.height / 2 + (Math.random() - 0.5) * 200,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 3 - 2,
            size: Math.random() * 30 + 20,
            opacity: 0.6,
            type: 'bubble',
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.1 + 0.05,
            color: ['#4ECDC4', '#45B7D1', '#96E6B3'][Math.floor(Math.random() * 3)]
          });
        }
        break;
        
      case 'lightning':
        // Electric zaps
        for (let i = 0; i < 25; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 12 + 6;
          particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 4 + 2,
            length: Math.random() * 40 + 30,
            opacity: 1,
            type: 'lightning',
            color: ['#A8E6CF', '#00F5A0', '#DCEDC1'][Math.floor(Math.random() * 3)]
          });
        }
        break;
        
      case 'flowers':
        // Blooming flowers
        for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * Math.PI * 2;
          const radius = 100;
          particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            targetX: canvas.width / 2 + Math.cos(angle) * radius,
            targetY: canvas.height / 2 + Math.sin(angle) * radius,
            progress: 0,
            size: Math.random() * 25 + 20,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            type: 'flower',
            color: ['#FFB6B9', '#FEC8D8', '#FFDFD3'][Math.floor(Math.random() * 3)]
          });
        }
        break;
        
      case 'paint':
        // Paint splatter
        for (let i = 0; i < 60; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 10 + 3;
          particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 15 + 5,
            opacity: 0.8,
            type: 'paint',
            color: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94', '#C7CEEA'][Math.floor(Math.random() * 6)]
          });
        }
        break;
    }

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        ctx.globalAlpha = p.opacity || 1;
        
        switch(p.type) {
          case 'heart':
            p.y += p.vy;
            p.x += p.vx;
            p.vy += 0.1;
            p.opacity -= 0.008;
            
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-p.size/2, -p.size/2, -p.size, p.size/3, 0, p.size);
            ctx.bezierCurveTo(p.size, p.size/3, p.size/2, -p.size/2, 0, 0);
            ctx.fill();
            ctx.restore();
            break;
            
          case 'star':
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.rotation += p.rotationSpeed;
            p.opacity -= 0.01;
            
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
              const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
              const x = Math.cos(angle) * p.size;
              const y = Math.sin(angle) * p.size;
              i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            break;
            
          case 'bubble':
            p.y += p.vy;
            p.wobble += p.wobbleSpeed;
            p.x += Math.sin(p.wobble) * 2;
            p.opacity -= 0.005;
            
            ctx.fillStyle = p.color;
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Shine
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.beginPath();
            ctx.arc(p.x - p.size/3, p.y - p.size/3, p.size/4, 0, Math.PI * 2);
            ctx.fill();
            break;
            
          case 'lightning':
            p.x += p.vx;
            p.y += p.vy;
            p.opacity -= 0.02;
            
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 0.5, p.y - p.vy * 0.5);
            ctx.stroke();
            break;
            
          case 'flower':
            p.progress += 0.03;
            const easeProgress = 1 - Math.pow(1 - p.progress, 3);
            p.x = p.x + (p.targetX - p.x) * easeProgress * 0.1;
            p.y = p.y + (p.targetY - p.y) * easeProgress * 0.1;
            p.rotation += p.rotationSpeed;
            
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            
            // Draw flower petals
            for (let i = 0; i < 5; i++) {
              ctx.save();
              ctx.rotate((i * 2 * Math.PI) / 5);
              ctx.beginPath();
              ctx.ellipse(0, -p.size/2, p.size/3, p.size/2, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
            
            // Center
            ctx.fillStyle = '#FFE66D';
            ctx.beginPath();
            ctx.arc(0, 0, p.size/4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            break;
            
          case 'paint':
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.3;
            p.opacity -= 0.008;
            
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
      });

      ctx.globalAlpha = 1;

      if (frame < 150) {
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

  const popCompliment = (index) => {
    if (!popped.includes(index)) {
      setPopped([...popped, index]);
      const effects = ['hearts', 'stars', 'bubbles', 'lightning', 'flowers', 'paint'];
      const randomEffect = effects[Math.floor(Math.random() * effects.length)];
      setActiveEffect({ index, effectType: randomEffect });
    }
  };

  const createBalloon = () => {
    const balloonId = Math.random().toString(36).substring(7);
    const url = `${window.location.origin}${window.location.pathname}?b=${balloonId}`;
    navigator.clipboard.writeText(url);
    alert('🎈 Balloon link copied! Send it to someone special.');
  };

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
        fontFamily: '"DM Sans", sans-serif'
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 5rem)',
            fontWeight: 900,
            margin: '0 0 20px 0'
          }}>
            🎈
          </h1>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 900,
            color: '#fff',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '3px'
          }}>
            Compliment<br/>Balloon
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1.2rem',
            marginBottom: '40px',
            lineHeight: '1.6'
          }}>
            Send someone a link. They tell you who you are to them.
            AI generates custom compliments. They pop each balloon. Chaos + cuteness ensues.
          </p>
          <button
            onClick={createBalloon}
            style={{
              background: '#FFE66D',
              border: 'none',
              borderRadius: '16px',
              padding: '20px 50px',
              fontSize: '1.3rem',
              fontWeight: 900,
              color: '#667eea',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Create Balloon 🎈
          </button>
        </div>
      </div>
    );
  }

  // RELATIONSHIP SELECTION
  if (step === 'relationship') {
    const options = [
      { value: 'crush', emoji: '😳', label: 'Crush' },
      { value: 'best friend', emoji: '💕', label: 'Best Friend' },
      { value: 'friend', emoji: '✨', label: 'Friend' },
      { value: 'person I know', emoji: '👋', label: 'Person I Know' },
      { value: 'other', emoji: '🤔', label: 'Other...' }
    ];

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: '"DM Sans", sans-serif'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 900,
            color: '#fff',
            marginBottom: '40px',
            lineHeight: '1.2'
          }}>
            Who am I to you?
          </h1>
          <div style={{
            display: 'grid',
            gap: '15px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'
          }}>
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleRelationshipSelect(opt.value)}
                style={{
                  background: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '30px 20px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{opt.emoji}</div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#f5576c'
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
        fontFamily: '"DM Sans", sans-serif'
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 2.5rem)',
            fontWeight: 900,
            color: '#333',
            marginBottom: '20px',
            lineHeight: '1.3'
          }}>
            Okay, so who am I to you exactly? 🤔
          </h1>
          <p style={{
            color: '#666',
            fontSize: '1.1rem',
            marginBottom: '30px'
          }}>
            (Be specific! The weirder, the better)
          </p>
          <input
            type="text"
            value={customRelationship}
            onChange={(e) => setCustomRelationship(e.target.value)}
            placeholder="e.g., 'my cat's favorite human', 'my nemesis', 'the person I share memes with'"
            style={{
              width: '100%',
              padding: '20px',
              fontSize: '1.1rem',
              border: '4px solid #fed6e3',
              borderRadius: '16px',
              fontFamily: '"DM Sans", sans-serif',
              outline: 'none',
              marginBottom: '20px',
              boxSizing: 'border-box'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
          />
          <button
            onClick={handleCustomSubmit}
            disabled={!customRelationship.trim()}
            style={{
              background: customRelationship.trim() ? '#fed6e3' : '#ccc',
              border: 'none',
              borderRadius: '16px',
              padding: '18px 40px',
              fontSize: '1.2rem',
              fontWeight: 700,
              color: '#333',
              cursor: customRelationship.trim() ? 'pointer' : 'not-allowed',
              boxShadow: customRelationship.trim() ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
              transition: 'transform 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            onMouseEnter={(e) => {
              if (customRelationship.trim()) e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              if (customRelationship.trim()) e.target.style.transform = 'scale(1)';
            }}
          >
            Generate Compliments ✨
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
        fontFamily: '"DM Sans", sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '5rem',
            animation: 'pulse 1.5s ease-in-out infinite',
            marginBottom: '20px'
          }}>
            🎈
          </div>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 900,
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            Generating compliments...
          </h2>
          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // POP PAGE
  if (step === 'pop') {
    const allPopped = popped.length === compliments.length;

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: '"DM Sans", sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <canvas
          ref={canvasRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            zIndex: 100
          }}
        />
        
        <div style={{
          maxWidth: '700px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 900,
            color: '#fff',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            textShadow: '4px 4px 0 rgba(0,0,0,0.2)'
          }}>
            {allPopped ? '🎉 ALL POPPED! 🎉' : '🎈 TAP TO POP 🎈'}
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.95)',
            fontSize: '1.2rem',
            marginBottom: '40px',
            fontWeight: 600
          }}>
            {allPopped 
              ? "You're pretty great. Someone wanted you to know that." 
              : `${popped.length}/${compliments.length} popped`
            }
          </p>

          <div style={{
            display: 'grid',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {compliments.map((comp, idx) => {
              const isPopped = popped.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => popCompliment(idx)}
                  disabled={isPopped}
                  style={{
                    background: isPopped ? 'rgba(255,255,255,0.3)' : '#fff',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '30px',
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: isPopped ? 'rgba(255,255,255,0.6)' : '#667eea',
                    cursor: isPopped ? 'default' : 'pointer',
                    transform: isPopped ? 'scale(0.95)' : 'scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: isPopped ? 'none' : '0 8px 30px rgba(0,0,0,0.3)',
                    textDecoration: isPopped ? 'line-through' : 'none',
                    lineHeight: '1.5'
                  }}
                  onMouseEnter={(e) => {
                    if (!isPopped) e.target.style.transform = 'scale(1.03)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isPopped) e.target.style.transform = 'scale(1)';
                  }}
                >
                  {isPopped ? '💨 ' : '🎈 '}{comp}
                </button>
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
                borderRadius: '16px',
                padding: '20px 50px',
                fontSize: '1.2rem',
                fontWeight: 900,
                color: '#667eea',
                cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              Make Your Own 🎨
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default ComplimentBalloon;
