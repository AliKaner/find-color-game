"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  HSB, 
  hsbToCss, 
  generateRandomHSB, 
  calculateColorScore, 
  getFunnyComment 
} from "@/utils/color";
import { playSoundEffect } from "@/utils/audio";

type Screen = "splash" | "memory" | "prediction" | "result" | "summary";

export default function Home() {
  // Game State
  const [screen, setScreen] = useState<Screen>("splash");
  const [round, setRound] = useState(1);
  const maxRounds = 5;
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  // Color State
  const [targetColor, setTargetColor] = useState<HSB>({ h: 0, s: 0, b: 0 });
  const [userColor, setUserColor] = useState<HSB>({ h: 180, s: 50, b: 50 });
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [comment, setComment] = useState("");
  const [displayScore, setDisplayScore] = useState(0);

  // Timer State
  const [timer, setTimer] = useState(5.00);
  const timerRef = useRef<NodeJS.Timeout|null>(null);

  // --- Handlers ---

  const startNewGame = () => {
    setRound(1);
    setTotalScore(0);
    startRound(1);
    playSoundEffect('click', isSoundOn);
  };

  const startRound = useCallback((r: number) => {
    const target = generateRandomHSB();
    setTargetColor(target);
    setRound(r);
    setTimer(5.00);
    setScreen("memory");
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, 5.00 - elapsed);
      setTimer(remaining);
      
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setScreen("prediction");
        setUserColor({ h: 180, s: 50, b: 50 });
      }
    }, 10);
  }, [isSoundOn]);

  useEffect(() => {
    // Tick sound every second
    if (screen === "memory" && Math.floor(timer) !== Math.floor(timer + 0.01)) {
        playSoundEffect('tick', isSoundOn);
    }
  }, [timer, screen, isSoundOn]);

  const submitGuess = () => {
    const s = calculateColorScore(targetColor, userColor);
    setScore(s);
    setTotalScore(prev => prev + s);
    setComment(getFunnyComment(s));
    setScreen("result");
    playSoundEffect('success', isSoundOn);
  };

  const nextRound = () => {
    if (round < maxRounds) {
      startRound(round + 1);
    } else {
      setScreen("summary");
    }
    playSoundEffect('click', isSoundOn);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    if (screen === 'result') {
      setDisplayScore(0);
      const duration = 1000; // 1 second
      const steps = 60;
      const increment = score / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= score) {
          setDisplayScore(score);
          clearInterval(interval);
        } else {
          setDisplayScore(current);
        }
      }, duration / steps);
      return () => clearInterval(interval);
    }
  }, [screen, score]);

  // --- Render Helpers ---

  const renderIcon = (type: string) => {
    switch(type) {
      case 'sound-on': return <svg viewBox="0 0 24 24"><path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.01,19.86 21,16.28 21,12C21,7.72 18.01,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.02C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z" /></svg>;
      case 'sound-off': return <svg viewBox="0 0 24 24"><path d="M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18.01,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.48,12.43 16.5,12.22 16.5,12Z" /></svg>;
      case 'sun': return <svg viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37c-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.38.39-1.02 0-1.41zM7.05 18.36c.39-.39.39-1.03 0-1.41l-1.06-1.06c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0z"/></svg>;
      case 'moon': return <svg viewBox="0 0 24 24"><path d="M9.37,5.51C9.19,6.15,9.1,6.82,9.1,7.5c0,4.08,3.32,7.4,7.4,7.4c0.68,0,1.35-0.09,1.99-0.27C17.45,17.19,14.93,19,12,19 c-3.86,0-7-3.14-7-7C5,9.07,6.81,6.55,9.37,5.51z M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36 c-0.98,1.37-2.58,2.26-4.4,2.26c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C12.92,3.04,12.46,3,12,3z"/></svg>;
      case 'check': return <svg viewBox="0 0 24 24"><path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" /></svg>;
      case 'arrow': return <svg viewBox="0 0 24 24"><path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" /></svg>;
      default: return null;
    }
  };

  const getAmbientColor = () => {
    if (screen === 'splash') return 'transparent';
    if (screen === 'memory') return hsbToCss(targetColor.h, targetColor.s, targetColor.b);
    if (screen === 'prediction') return hsbToCss(userColor.h, userColor.s, userColor.b);
    if (screen === 'result') return hsbToCss(targetColor.h, targetColor.s, targetColor.b);
    return 'transparent';
  };

  return (
    <div id="app-root" className={theme === 'light' ? 'light-theme' : ''}>
      <div className="ambient-bg" style={{ backgroundColor: getAmbientColor() }}></div>
      <header className="top-bar">
        <div className="logo">ColorGuess</div>
        <div className="controls">
          <button className="icon-btn" onClick={() => setIsSoundOn(!isSoundOn)}>
            {isSoundOn ? renderIcon('sound-on') : renderIcon('sound-off')}
          </button>
          <button className="icon-btn" onClick={toggleTheme}>
            {theme === 'dark' ? renderIcon('sun') : renderIcon('moon')}
          </button>
        </div>
      </header>

      <main className="game-viewport">
        {screen === "splash" && (
          <section className="screen">
            <div className="glass-card splash-card animate-in">
              <h1>color</h1>
              <p>Humans can't reliably recall colors. This is a simple game to see how good (or bad) you are at it.</p>
              <p className="subtext">We'll show you five colors, then you'll try and recreate them.</p>
              <button className="primary-btn" onClick={startNewGame}>Solo Play</button>
            </div>
          </section>
        )}

        {screen === "memory" && (
          <section className="screen">
            <div className="color-container" style={{ backgroundColor: hsbToCss(targetColor.h, targetColor.s, targetColor.b) }}>
              <div className="overlay-content">
                <span className="round-info">{round}/{maxRounds}</span>
                <div className="timer-box">
                  <span className="timer-value">{timer.toFixed(2)}</span>
                  <span className="timer-label">Seconds to remember</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {screen === "prediction" && (
          <section className="screen">
            <div className="color-container" style={{ backgroundColor: hsbToCss(userColor.h, userColor.s, userColor.b) }}>
              {/* Sliders moved OUTSIDE overlay-content to isolate from blend mode */}
              <div className="hsb-controls">
                <div className="slider-wrapper">
                  <input 
                    type="range" className="slider-input" min="0" max="360" 
                    value={userColor.h} onChange={(e) => setUserColor({...userColor, h: parseInt(e.target.value)})}
                  />
                  <div className="slider-track hue-bg"></div>
                  <span className="slider-tag">H</span>
                </div>
                <div className="slider-wrapper">
                  <input 
                    type="range" className="slider-input" min="0" max="100" 
                    value={userColor.s} onChange={(e) => setUserColor({...userColor, s: parseInt(e.target.value)})}
                  />
                  <div 
                    className="slider-track sat-bg" 
                    style={{ 
                      background: `linear-gradient(var(--gradient-dir, to top), ${hsbToCss(userColor.h, 0, 100)} 0%, ${hsbToCss(userColor.h, 100, 100)} 100%)` 
                    }}
                  ></div>
                  <span className="slider-tag">S</span>
                </div>
                <div className="slider-wrapper">
                  <input 
                    type="range" className="slider-input" min="0" max="100" 
                    value={userColor.b} onChange={(e) => setUserColor({...userColor, b: parseInt(e.target.value)})}
                  />
                  <div 
                    className="slider-track bri-bg" 
                    style={{ 
                      background: `linear-gradient(var(--gradient-dir, to top), ${hsbToCss(userColor.h, userColor.s, 0)} 0%, ${hsbToCss(userColor.h, userColor.s, 100)} 100%)` 
                    }}
                  ></div>
                  <span className="slider-tag">B</span>
                </div>
              </div>

              <div className={`overlay-content ${screen === "prediction" ? "prediction-overlay" : ""}`}>
                <span className="round-info">{round}/{maxRounds}</span>
                
                <button className="action-circle" onClick={submitGuess}>
                  {renderIcon('check')}
                </button>
              </div>
            </div>
          </section>
        )}

        {screen === "result" && (
          <section className="screen">
            <div className="result-layout glass-card">
              <div className="result-section" style={{ backgroundColor: hsbToCss(userColor.h, userColor.s, userColor.b) }}>
                <div className="score-display">
                  <h2 className="score-value">{displayScore.toFixed(2)}</h2>
                  <p className="score-comment">{comment}</p>
                </div>
                <div className="hsb-label-group">
                  <span className="hsb-label">Your selection</span>
                  <span className="hsb-value">H{userColor.h} S{userColor.s} B{userColor.b}</span>
                </div>
              </div>
              <div className="result-section" style={{ backgroundColor: hsbToCss(targetColor.h, targetColor.s, targetColor.b) }}>
                <div className="hsb-label-group">
                  <span className="hsb-label">Original</span>
                  <span className="hsb-value">H{targetColor.h} S{targetColor.s} B{targetColor.b}</span>
                </div>
                <button className="next-action-btn" onClick={nextRound}>
                  {renderIcon('arrow')}
                </button>
              </div>
            </div>
          </section>
        )}
        {screen === "summary" && (
          <section className="screen">
            <div className="glass-card summary-card">
              <h1 className="logo syne-text">GAME OVER</h1>
              <div className="total-score-box">
                <span className="label">Total Score</span>
                <span className="value">{totalScore.toFixed(2)}</span>
              </div>
              <p className="summary-text">
                {totalScore > 400 ? "You're a human spectrometer!" : 
                 totalScore > 300 ? "Impressive eye for detail." : 
                 totalScore > 200 ? "Solid effort, but keep practicing." : 
                 "Are you sure you're not colorblind?"}
              </p>
              <button className="primary-btn" onClick={() => setScreen("splash")}>
                MAIN MENU
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
