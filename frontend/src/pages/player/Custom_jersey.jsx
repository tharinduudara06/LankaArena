import React, { useState, useRef, useEffect } from 'react';
import './styles/custom_jersey.css';
import PlayerSidebar from './PlayerSidebar .jsx';

const Custom_jersey = () => {
  const canvasRef = useRef(null);
  const [jerseyType, setJerseyType] = useState('home');
  const [jerseyColor, setJerseyColor] = useState('#1e40af');
  const [accentColor, setAccentColor] = useState('#ffffff');
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [teamName, setTeamName] = useState('');
  const [sponsorLogo, setSponsorLogo] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [jerseyStyle, setJerseyStyle] = useState('classic');
  const [texture, setTexture] = useState('smooth');
  const [pattern, setPattern] = useState('none');
  const [jerseyView, setJerseyView] = useState('front');

  const jerseyTypes = [
    { id: 'home', name: 'Home', color: '#1e40af' },
    { id: 'away', name: 'Away', color: '#ffffff' },
    { id: 'third', name: 'Third', color: '#000000' },
    { id: 'keeper', name: 'Keeper', color: '#dc2626' }
  ];

  const jerseyStyles = [
    { id: 'classic', name: 'Classic' },
    { id: 'modern', name: 'Modern' },
    { id: 'vintage', name: 'Vintage' },
    { id: 'sleek', name: 'Sleek' }
  ];

  const textures = [
    { id: 'smooth', name: 'Smooth' },
    { id: 'mesh', name: 'Mesh' },
    { id: 'ribbed', name: 'Ribbed' },
    { id: 'matte', name: 'Matte' }
  ];

  const patterns = [
    { id: 'none', name: 'None' },
    { id: 'stripes', name: 'Stripes' },
    { id: 'hoops', name: 'Hoops' },
    { id: 'dots', name: 'Dots' },
    { id: 'geometric', name: 'Geometric' }
  ];

  const drawJersey = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw jersey base
    drawJerseyBase(ctx, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
    
    // Draw patterns
    drawPatterns(ctx, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
    
    // Draw text elements
    drawTextElements(ctx, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
    
    // Draw sponsor logo
    if (sponsorLogo) {
      drawSponsorLogo(ctx, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
    }
  };

  const drawJerseyBase = (ctx, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    if (jerseyView === 'front') {
      // Front view jersey body
      ctx.fillStyle = jerseyColor;
      ctx.beginPath();
      ctx.roundRect(centerX - 80, centerY - 120, 160, 200, 20);
      ctx.fill();
      
      // Front view sleeves
      ctx.fillStyle = jerseyColor;
      ctx.beginPath();
      ctx.roundRect(centerX - 100, centerY - 100, 30, 80, 15);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(centerX + 70, centerY - 100, 30, 80, 15);
      ctx.fill();
      
      // Front view collar
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.roundRect(centerX - 20, centerY - 120, 40, 20, 10);
      ctx.fill();
    } else {
      // Back view jersey body
      ctx.fillStyle = jerseyColor;
      ctx.beginPath();
      ctx.roundRect(centerX - 80, centerY - 120, 160, 200, 20);
      ctx.fill();
      
      // Back view sleeves
      ctx.fillStyle = jerseyColor;
      ctx.beginPath();
      ctx.roundRect(centerX - 100, centerY - 100, 30, 80, 15);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(centerX + 70, centerY - 100, 30, 80, 15);
      ctx.fill();
      
      // Back view collar (V-neck)
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.moveTo(centerX - 20, centerY - 120);
      ctx.lineTo(centerX, centerY - 100);
      ctx.lineTo(centerX + 20, centerY - 120);
      ctx.lineTo(centerX - 20, centerY - 120);
      ctx.fill();
    }
    
    // Jersey trim
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const drawPatterns = (ctx, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    if (pattern === 'stripes') {
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const y = centerY - 100 + (i * 25);
        ctx.beginPath();
        ctx.moveTo(centerX - 80, y);
        ctx.lineTo(centerX + 80, y);
        ctx.stroke();
      }
    } else if (pattern === 'hoops') {
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 8;
      for (let i = 0; i < 4; i++) {
        const y = centerY - 80 + (i * 40);
        ctx.beginPath();
        ctx.moveTo(centerX - 80, y);
        ctx.lineTo(centerX + 80, y);
        ctx.stroke();
      }
    } else if (pattern === 'dots') {
      ctx.fillStyle = accentColor;
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 4; j++) {
          const x = centerX - 60 + (i * 20);
          const y = centerY - 80 + (j * 30);
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }
  };

  const drawTextElements = (ctx, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    if (jerseyView === 'front') {
      // Front view text elements
      // Player number
      if (playerNumber) {
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(playerNumber, centerX, centerY + 20);
      }
      
      // Player name
      if (playerName) {
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(playerName.toUpperCase(), centerX, centerY + 80);
      }
      
      // Team name
      if (teamName) {
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(teamName.toUpperCase(), centerX, centerY - 100);
      }
    } else {
      // Back view text elements
      // Player number (larger on back)
      if (playerNumber) {
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 64px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(playerNumber, centerX, centerY + 10);
      }
      
      // Player name (smaller on back)
      if (playerName) {
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(playerName.toUpperCase(), centerX, centerY + 60);
      }
      
      // Team name (positioned lower on back)
      if (teamName) {
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(teamName.toUpperCase(), centerX, centerY - 80);
      }
    }
  };

  const drawSponsorLogo = (ctx, width, height) => {
    if (sponsorLogo) {
      const centerX = width / 2;
      const centerY = height / 2;
      
      const img = new Image();
      img.onload = () => {
        if (jerseyView === 'front') {
          // Front view logo placement
          ctx.drawImage(img, centerX - 30, centerY - 50, 60, 30);
        } else {
          // Back view logo placement (smaller, at top)
          ctx.drawImage(img, centerX - 20, centerY - 80, 40, 20);
        }
      };
      img.src = URL.createObjectURL(sponsorLogo);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSponsorLogo(file);
    }
  };

  const downloadJersey = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `custom-jersey-${jerseyView}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const downloadBothViews = () => {
    // Download front view
    setJerseyView('front');
    setTimeout(() => {
      const canvas = canvasRef.current;
      const link1 = document.createElement('a');
      link1.download = `custom-jersey-front-${Date.now()}.png`;
      link1.href = canvas.toDataURL();
      link1.click();
      
      // Download back view after a short delay
      setTimeout(() => {
        setJerseyView('back');
        setTimeout(() => {
          const link2 = document.createElement('a');
          link2.download = `custom-jersey-back-${Date.now()}.png`;
          link2.href = canvas.toDataURL();
          link2.click();
        }, 100);
      }, 100);
    }, 100);
  };

  const resetDesign = () => {
    setJerseyColor('#1e40af');
    setAccentColor('#ffffff');
    setPlayerName('');
    setPlayerNumber('');
    setTeamName('');
    setSponsorLogo(null);
    setPattern('none');
  };

  useEffect(() => {
    drawJersey();
  }, [jerseyColor, accentColor, playerName, playerNumber, teamName, sponsorLogo, pattern, jerseyStyle, texture, jerseyView]);

  return (
    <div className="p-cj-custom-jersey-container">
      <PlayerSidebar />
      
      <div className="p-cj-jersey-designer">
        <div className="p-cj-designer-header">
          <h1>Custom Jersey Designer</h1>
          <p>Design your dream jersey with our advanced design tools</p>
        </div>

        <div className="p-cj-designer-content">
          <div className="p-cj-design-panel">
            <div className="p-cj-jersey-preview">
              <div className="p-cj-view-indicator">
                <span className={`p-cj-view-label ${jerseyView === 'front' ? 'p-cj-active' : ''}`}>
                  {jerseyView === 'front' ? 'Front View' : 'Back View'}
                </span>
              </div>
              <canvas
                ref={canvasRef}
                className="p-cj-jersey-canvas"
                width={400}
                height={500}
              />
            </div>

            <div className="p-cj-design-controls">
              <div className="p-cj-control-section">
                <h3>Jersey View</h3>
                <div className="p-cj-view-toggle">
                  <button
                    className={`p-cj-view-btn ${jerseyView === 'front' ? 'p-cj-active' : ''}`}
                    onClick={() => setJerseyView('front')}
                  >
                    Front View
                  </button>
                  <button
                    className={`p-cj-view-btn ${jerseyView === 'back' ? 'p-cj-active' : ''}`}
                    onClick={() => setJerseyView('back')}
                  >
                    Back View
                  </button>
                </div>
              </div>

              <div className="p-cj-control-section">
                <h3>Jersey Type</h3>
                <div className="p-cj-jersey-type-selector">
                  {jerseyTypes.map(type => (
                    <button
                      key={type.id}
                      className={`p-cj-type-btn ${jerseyType === type.id ? 'p-cj-active' : ''}`}
                      onClick={() => {
                        setJerseyType(type.id);
                        setJerseyColor(type.color);
                      }}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-cj-control-section">
                <h3>Colors</h3>
                <div className="p-cj-color-controls">
                  <div className="p-cj-color-input">
                    <label>Primary Color</label>
                    <input
                      type="color"
                      value={jerseyColor}
                      onChange={(e) => setJerseyColor(e.target.value)}
                    />
                  </div>
                  <div className="p-cj-color-input">
                    <label>Accent Color</label>
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="p-cj-control-section">
                <h3>Text & Numbers</h3>
                <div className="p-cj-text-controls">
                  <input
                    type="text"
                    placeholder="Player Name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Player Number"
                    value={playerNumber}
                    onChange={(e) => setPlayerNumber(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Team Name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-cj-control-section">
                <h3>Style Options</h3>
                <div className="p-cj-style-controls">
                  <div className="p-cj-style-selector">
                    <label>Jersey Style</label>
                    <select value={jerseyStyle} onChange={(e) => setJerseyStyle(e.target.value)}>
                      {jerseyStyles.map(style => (
                        <option key={style.id} value={style.id}>{style.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="p-cj-style-selector">
                    <label>Texture</label>
                    <select value={texture} onChange={(e) => setTexture(e.target.value)}>
                      {textures.map(tex => (
                        <option key={tex.id} value={tex.id}>{tex.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="p-cj-style-selector">
                    <label>Pattern</label>
                    <select value={pattern} onChange={(e) => setPattern(e.target.value)}>
                      {patterns.map(pat => (
                        <option key={pat.id} value={pat.id}>{pat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-cj-control-section">
                <h3>Sponsor Logo</h3>
                <div className="p-cj-logo-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="p-cj-upload-btn">
                    Upload Logo
                  </label>
                </div>
              </div>

              <div className="p-cj-action-buttons">
                <button className="p-cj-reset-btn" onClick={resetDesign}>
                  Reset Design
                </button>
                <button className="p-cj-download-btn" onClick={downloadJersey}>
                  Download Current View
                </button>
                <button className="p-cj-download-both-btn" onClick={downloadBothViews}>
                  Download Both Views
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Custom_jersey;
