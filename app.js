/**
 * E.V.E. SYSTEM // SPIDER-MAN BRAND NEW DAY HUD INTERFACE
 * Fully Standalone & Tablet-Optimized Logic (Groq API, Audio & Canvas)
 */

// Global Configuration
const CONFIG = {
  groqApiKey: '',
  groqModel: localStorage.getItem('eve_groq_model') || 'groq/compound',
  activeVoice: localStorage.getItem('eve_active_voice') || 'liam',
  sfxEnabled: localStorage.getItem('eve_sfx_enabled') !== 'false',
  systemPrompt: `You are E.V.E. (Enhanced Virtual Entity), the calm, analytical, and highly intelligent AI assistant created for Peter Parker / Spider-Man in Spider-Man: Brand New Day.
You assist Peter with suit diagnostics (web shooter fluid pressure, polymer tension, power cells), New York City patrol tactical data, science coursework (organic chemistry, polymer physics, biophysics), and anomaly detection.
You speak in a calm, analytical, slightly witty tone, addressing Peter naturally. Keep responses concise (1 to 4 punchy sentences unless Peter asks for in-depth analysis).`
};

// Chat history array for Groq context
let chatHistory = [
  { role: 'system', content: CONFIG.systemPrompt },
  { role: 'assistant', content: 'All Stark Industries neural networks and Spider-Man tactical subroutines are online, Peter. How may I assist you with your patrol, research, or diagnostic tasks?' }
];

// Web Audio API Context & State
let audioCtx = null;
let audioAnalyser = null;
let audioSourceNode = null;
let isAudioPlaying = false;
let isListening = false;
let speechRecognition = null;
let audioUnlocked = false;

// Audio context initializer with mobile/tablet gesture unlock
function initAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      audioAnalyser = audioCtx.createAnalyser();
      audioAnalyser.fftSize = 64;
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Unlock audio on first touch/click (Android & iOS requirement)
function unlockAudioOnFirstInteraction() {
  if (audioUnlocked) return;
  initAudioContext();
  audioUnlocked = true;

  // Pre-load audio elements
  ['audioLiam', 'audioBrandNewDay', 'audioDanu', 'audioKlay'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.load();
    }
  });

  document.removeEventListener('touchstart', unlockAudioOnFirstInteraction);
  document.removeEventListener('click', unlockAudioOnFirstInteraction);
}

document.addEventListener('touchstart', unlockAudioOnFirstInteraction, { passive: true });
document.addEventListener('click', unlockAudioOnFirstInteraction, { passive: true });

// Synthesize High-Tech Sci-Fi Sound Effects with Web Audio API
function playSciFiSound(type) {
  if (!CONFIG.sfxEnabled) return;
  try {
    initAudioContext();
    if (!audioCtx || audioCtx.state !== 'running') return;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'beep') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1760, now + 0.06);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'scan') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(1400, now + 0.3);
      osc.frequency.linearRampToValueAtTime(600, now + 0.5);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.setValueAtTime(900, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    console.warn('SFX audio error:', e);
  }
}

// Play Selected Pre-recorded Voice Sample from Fish Audio
function playVoiceSample(soundKey) {
  initAudioContext();
  stopAllAudio();

  const key = soundKey || CONFIG.activeVoice;
  let audioEl = null;

  if (key === 'liam') audioEl = document.getElementById('audioLiam');
  else if (key === 'brand_new_day') audioEl = document.getElementById('audioBrandNewDay');
  else if (key === 'danu') audioEl = document.getElementById('audioDanu');
  else if (key === 'klay') audioEl = document.getElementById('audioKlay');

  if (audioEl) {
    try {
      if (!audioSourceNode && audioCtx && audioAnalyser) {
        audioSourceNode = audioCtx.createMediaElementSource(audioEl);
        audioSourceNode.connect(audioAnalyser);
        audioAnalyser.connect(audioCtx.destination);
      }
    } catch (err) {
      // Node already connected or cross-origin
    }

    setAssistantSpeaking(true);
    audioEl.currentTime = 0;

    const playPromise = audioEl.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        isAudioPlaying = true;
        updateVoiceStatus('Speaking: E.V. Audio File');
      }).catch(err => {
        console.warn('Audio play prevented on device:', err);
        // Fallback to browser speech synthesis
        speakWithBrowserTTS("System core functions active. Protocols adjusted for optimal efficiency.");
      });
    }

    audioEl.onended = () => {
      isAudioPlaying = false;
      setAssistantSpeaking(false);
      updateVoiceStatus('Listening...');
    };
  } else if (key === 'browser_tts') {
    speakWithBrowserTTS("We have detected an anomaly in system core functions. Redirecting resources for optimal efficiency.");
  }
}

function stopAllAudio() {
  ['audioLiam', 'audioBrandNewDay', 'audioDanu', 'audioKlay'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  });
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  isAudioPlaying = false;
  setAssistantSpeaking(false);
  updateVoiceStatus('Listening...');
}

// Browser Speech Synthesis for Dynamic Groq Responses
function speakWithBrowserTTS(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  
  const preferredVoice = voices.find(v => 
    (v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Google UK English Female') || v.name.includes('Zira') || (v.lang.startsWith('en') && v.name.includes('Female')))
  ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

  if (preferredVoice) utterance.voice = preferredVoice;
  utterance.pitch = 1.05;
  utterance.rate = 1.02;

  utterance.onstart = () => {
    isAudioPlaying = true;
    setAssistantSpeaking(true);
    updateVoiceStatus('E.V.E. Speaking...');
  };

  utterance.onend = () => {
    isAudioPlaying = false;
    setAssistantSpeaking(false);
    updateVoiceStatus('Listening...');
  };

  utterance.onerror = () => {
    isAudioPlaying = false;
    setAssistantSpeaking(false);
    updateVoiceStatus('Ready.');
  };

  window.speechSynthesis.speak(utterance);
}

function setAssistantSpeaking(speaking) {
  const core = document.getElementById('coreCenterVoid') || document.getElementById('coreEyeButton');
  if (core) {
    if (speaking) core.classList.add('active-speaking');
    else core.classList.remove('active-speaking');
  }
}

function updateVoiceStatus(statusText) {
  const el = document.getElementById('voiceStatusText');
  if (el) el.textContent = statusText;
  const hint = document.getElementById('dockHintText');
  if (hint) {
    if (statusText.includes('Speaking')) hint.textContent = 'E.V.E. Responding';
    else if (statusText.includes('Listening')) hint.textContent = 'Tap to speak';
    else hint.textContent = statusText;
  }
}

// ==========================================================================
// VOICE RECOGNITION (SPEECH-TO-TEXT) WITH FALLBACK FOR ANDROID FILE://
// ==========================================================================
function setupSpeechRecognition() {
  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognitionClass) {
    return false;
  }

  try {
    speechRecognition = new SpeechRecognitionClass();
    speechRecognition.continuous = false;
    speechRecognition.interimResults = false;
    speechRecognition.lang = 'en-US';

    speechRecognition.onstart = () => {
      isListening = true;
      const micBtn = document.getElementById('dockMicBtn');
      if (micBtn) micBtn.classList.add('active-listening');
      updateVoiceStatus('Listening to Peter...');
      playSciFiSound('beep');
    };

    speechRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleUserTransmission(transcript);
    };

    speechRecognition.onerror = (event) => {
      console.warn('Speech recognition status/error:', event.error);
      isListening = false;
      const micBtn = document.getElementById('dockMicBtn');
      if (micBtn) micBtn.classList.remove('active-listening');
      
      // On Android file://, browsers block mic access with 'not-allowed'
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        openInputModal('Voice input requires HTTPS or local server on Android. Switched to Keyboard input:');
      } else {
        updateVoiceStatus('Voice input idle.');
      }
    };

    speechRecognition.onend = () => {
      isListening = false;
      const micBtn = document.getElementById('dockMicBtn');
      if (micBtn) micBtn.classList.remove('active-listening');
      if (!isAudioPlaying) updateVoiceStatus('Listening...');
    };

    return true;
  } catch (e) {
    console.warn('Speech recognition init error:', e);
    return false;
  }
}

function toggleVoiceInput() {
  initAudioContext();
  
  // If running directly as file:/// on Android, Chrome strictly blocks microphone
  if (window.location.protocol === 'file:') {
    // Attempt recognition, but provide immediate keyboard fallback if not supported
    if (!speechRecognition) {
      const ok = setupSpeechRecognition();
      if (!ok) {
        openInputModal('Direct file mode active. Type your command for E.V.E.:');
        return;
      }
    }
  } else {
    if (!speechRecognition) setupSpeechRecognition();
  }

  if (speechRecognition) {
    if (isListening) {
      speechRecognition.stop();
    } else {
      try {
        speechRecognition.start();
      } catch (e) {
        console.warn('Recognition start exception:', e);
        openInputModal();
      }
    }
  } else {
    openInputModal();
  }
}

// ==========================================================================
// GROQ AI INFERENCE ENGINE (WORKS 100% STANDALONE & VIA SERVER)
// ==========================================================================
async function callGroqAPI(userQuery) {
  const apiKey = CONFIG.groqApiKey;
  if (!apiKey) {
    throw new Error('Groq API Key is missing. Please check settings.');
  }

  // Append user message to history
  chatHistory.push({ role: 'user', content: userQuery });

  let response;
  let lastErr = null;

  // 1. Direct Call to Groq API (Works standalone on both http:// and file:// via CORS)
  try {
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: CONFIG.groqModel,
        messages: chatHistory,
        temperature: 0.65,
        max_tokens: 350
      })
    });
  } catch (directErr) {
    lastErr = directErr;
    // 2. If running on local server (http://), fallback to /api/chat proxy
    if (window.location.protocol.startsWith('http')) {
      try {
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: apiKey,
            model: CONFIG.groqModel,
            messages: chatHistory
          })
        });
      } catch (proxyErr) {
        lastErr = proxyErr;
      }
    }
  }

  if (!response) {
    throw new Error(`Connection failed: Check internet connection or tablet Wi-Fi. (${lastErr ? lastErr.message : 'Unknown'})`);
  }

  if (!response.ok) {
    const errText = await response.text();
    let parsedErr = errText;
    try {
      const errObj = JSON.parse(errText);
      parsedErr = errObj.error?.message || errText;
    } catch(e) {}
    throw new Error(`Groq API Error (${response.status}): ${parsedErr}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || 'Telemetry received, Peter. Awaiting next command.';
  
  chatHistory.push({ role: 'assistant', content: reply });
  return reply;
}

// Handle User Input (Voice, Modal, Quick Actions, or Chat)
async function handleUserTransmission(queryText) {
  if (!queryText || !queryText.trim()) return;
  const query = queryText.trim();

  playSciFiSound('click');
  const greetingMsg = document.getElementById('eveDynamicMessage');
  const typingIndicator = document.getElementById('greetingTypingIndicator');

  if (greetingMsg) greetingMsg.textContent = `Analyzing: "${query}"...`;
  if (typingIndicator) typingIndicator.style.display = 'flex';
  updateVoiceStatus('Processing neural query...');

  appendChatMessage('Peter', query);

  try {
    const reply = await callGroqAPI(query);
    if (typingIndicator) typingIndicator.style.display = 'none';
    
    typewriterEffect(greetingMsg, reply);
    appendChatMessage('E.V.E.', reply);

    if (CONFIG.activeVoice === 'browser_tts') {
      speakWithBrowserTTS(reply);
    } else {
      playVoiceSample(CONFIG.activeVoice);
    }

  } catch (err) {
    console.error('Groq query failed:', err);
    if (typingIndicator) typingIndicator.style.display = 'none';
    if (greetingMsg) {
      greetingMsg.textContent = `Alert: ${err.message}`;
    }
    appendChatMessage('E.V.E.', `System notice: ${err.message}`);
    updateVoiceStatus('Transmission error.');
    playSciFiSound('alert');
  }
}

function typewriterEffect(element, text) {
  if (!element) return;
  element.textContent = '';
  let i = 0;
  const speed = 14;

  function typeNext() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(typeNext, speed);
    }
  }
  typeNext();
}

function appendChatMessage(speaker, message) {
  const container = document.getElementById('chatMessagesScroll');
  if (!container) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${speaker === 'Peter' ? 'peter-bubble' : 'eve-bubble'}`;

  bubble.innerHTML = `
    <div class="bubble-header">
      <span class="bubble-speaker">${speaker === 'Peter' ? 'PETER PARKER' : 'E.V.E.'}</span>
      <span class="bubble-time">${timeStr}</span>
    </div>
    <div class="bubble-content">${escapeHtml(message)}</div>
  `;

  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

// ==========================================================================
// HIGH-DPI CANVAS VISUALIZERS (VOICE & WORLD MAP)
// ==========================================================================
function setupHighDpiCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width || canvas.width || 300;
  const h = rect.height || canvas.height || 100;
  
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, width: w, height: h };
}

function startVoiceWaveVisualizer() {
  const canvas = document.getElementById('voiceWaveCanvas');
  if (!canvas) return;

  let info = setupHighDpiCanvas(canvas);
  window.addEventListener('resize', () => { info = setupHighDpiCanvas(canvas); });

  let phase = 0;
  const dataArray = new Uint8Array(32);

  function renderWave() {
    requestAnimationFrame(renderWave);
    const ctx = info.ctx;
    const width = info.width;
    const height = info.height;
    const midY = height / 2;

    ctx.clearRect(0, 0, width, height);

    if (isAudioPlaying && audioAnalyser) {
      audioAnalyser.getByteFrequencyData(dataArray);
    } else {
      for (let i = 0; i < dataArray.length; i++) {
        const sineVal = Math.sin(phase + i * 0.35);
        dataArray[i] = isListening ? (35 + Math.random() * 45) : (14 + sineVal * 10);
      }
    }

    phase += 0.05;
    const numBars = 28;
    const barWidth = Math.max(2, (width / numBars) - 2);

    for (let i = 0; i < numBars; i++) {
      const x = i * (barWidth + 2);
      const amp = (dataArray[i % dataArray.length] / 255) * (height * 0.44);

      const distFromCenter = Math.abs(i - numBars / 2) / (numBars / 2);
      let r = Math.floor(distFromCenter * 255);
      let g = Math.floor((1 - distFromCenter) * 240);
      let b = 255;

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.85)`;
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
      ctx.shadowBlur = 6;

      ctx.fillRect(x, midY - amp, barWidth, amp * 2);
    }

    ctx.shadowBlur = 2;
    ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.fillRect(0, midY - 0.5, width, 1);
  }

  renderWave();
}

function startDockWaveVisualizer() {
  const canvas = document.getElementById('dockWaveCanvas');
  if (!canvas) return;

  let info = setupHighDpiCanvas(canvas);
  window.addEventListener('resize', () => { info = setupHighDpiCanvas(canvas); });

  let offset = 0;

  function renderDockWave() {
    requestAnimationFrame(renderDockWave);
    const ctx = info.ctx;
    const width = info.width;
    const height = info.height;
    const midY = height / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = isListening ? '#ff1244' : '#00f0ff';
    ctx.shadowColor = isListening ? 'rgba(255, 18, 68, 0.7)' : 'rgba(0, 240, 255, 0.7)';
    ctx.shadowBlur = 5;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(0, midY);

    const freq = isListening ? 0.09 : 0.045;
    const amp = isListening ? 8 : (isAudioPlaying ? 7 : 3);

    for (let x = 0; x < width; x++) {
      const y = midY + Math.sin(x * freq + offset) * amp * Math.sin(x / width * Math.PI);
      ctx.lineTo(x, y);
    }

    ctx.stroke();
    offset += isListening ? 0.2 : 0.06;
  }

  renderDockWave();
}

function startWorldMapVisualizer() {
  const canvas = document.getElementById('worldMapCanvas');
  if (!canvas) return;

  let info = setupHighDpiCanvas(canvas);
  window.addEventListener('resize', () => { info = setupHighDpiCanvas(canvas); });

  const nodes = [
    { xRatio: 0.22, yRatio: 0.32, isBase: true },   // NYC
    { xRatio: 0.14, yRatio: 0.38 },                 // LA
    { xRatio: 0.52, yRatio: 0.28 },                 // London
    { xRatio: 0.78, yRatio: 0.38 },                 // Tokyo
    { xRatio: 0.84, yRatio: 0.75 },                 // Sydney
    { xRatio: 0.32, yRatio: 0.70 },                 // Sao Paulo
    { xRatio: 0.72, yRatio: 0.52 }                  // Singapore
  ];

  let pulseAngle = 0;

  function renderMap() {
    requestAnimationFrame(renderMap);
    const ctx = info.ctx;
    const width = info.width;
    const height = info.height;

    ctx.clearRect(0, 0, width, height);

    // Dynamic grid nodes
    ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
    const step = 6;
    for (let x = step; x < width - step; x += step) {
      for (let y = step; y < height - step; y += step) {
        const nx = x / width;
        const ny = y / height;
        const inAmericas = (nx > 0.12 && nx < 0.38 && ny > 0.18 && ny < 0.85);
        const inEurasia = (nx > 0.44 && nx < 0.90 && ny > 0.16 && ny < 0.65);
        const inAustralia = (nx > 0.75 && nx < 0.92 && ny > 0.60 && ny < 0.85);
        if (inAmericas || inEurasia || inAustralia) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    pulseAngle += 0.03;
    const baseNode = { x: nodes[0].xRatio * width, y: nodes[0].yRatio * height };

    nodes.slice(1).forEach((target, idx) => {
      const tx = target.xRatio * width;
      const ty = target.yRatio * height;

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(baseNode.x, baseNode.y);
      const cpX = (baseNode.x + tx) / 2;
      const cpY = Math.min(baseNode.y, ty) - (height * 0.18);
      ctx.quadraticCurveTo(cpX, cpY, tx, ty);
      ctx.stroke();

      const t = (pulseAngle * 0.5 + idx * 0.2) % 1;
      const pktX = (1 - t) * (1 - t) * baseNode.x + 2 * (1 - t) * t * cpX + t * t * tx;
      const pktY = (1 - t) * (1 - t) * baseNode.y + 2 * (1 - t) * t * cpY + t * t * ty;

      ctx.fillStyle = idx % 2 === 0 ? '#ff1244' : '#00f0ff';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(pktX, pktY, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    nodes.forEach(node => {
      const nx = node.xRatio * width;
      const ny = node.yRatio * height;
      ctx.fillStyle = node.isBase ? '#ff1244' : '#00f0ff';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(nx, ny, node.isBase ? 3 : 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  renderMap();
}

// ==========================================================================
// INTERACTIVE SCAN SEQUENCE
// ==========================================================================
function executeDeepScan() {
  playSciFiSound('scan');
  const statusMsg = document.getElementById('scanStatusMsg');
  const counter = document.getElementById('scanCounter');
  const radarSweep = document.querySelector('.radar-sweep');

  if (statusMsg) statusMsg.textContent = 'SCANNING SECTOR...';
  if (counter) counter.textContent = 'ANALYZING';
  if (radarSweep) radarSweep.style.animationDuration = '1s';

  const checkBoxes = [
    document.getElementById('chkFiles'),
    document.getElementById('chkImages'),
    document.getElementById('chkWeb'),
    document.getElementById('chkSystem')
  ];

  let step = 0;
  const scanInterval = setInterval(() => {
    if (step < checkBoxes.length) {
      if (checkBoxes[step]) {
        checkBoxes[step].checked = true;
        playSciFiSound('click');
      }
      step++;
    } else {
      clearInterval(scanInterval);
      if (radarSweep) radarSweep.style.animationDuration = '3.5s';
      if (statusMsg) statusMsg.textContent = 'Scan ready. 0 Anomaly.';
      if (counter) counter.textContent = 'NOMINAL';
      playSciFiSound('beep');
      playVoiceSample('danu');
    }
  }, 350);
}

// ==========================================================================
// UI LISTENERS & NAVIGATION
// ==========================================================================
function setupNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  const viewPanels = {
    dashboard: document.getElementById('viewDashboard'),
    chat: document.getElementById('viewChat'),
    scan: document.getElementById('viewScan'),
    calendar: document.getElementById('viewCalendar'),
    settings: document.getElementById('viewSettings')
  };

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playSciFiSound('click');
      const targetTab = btn.getAttribute('data-tab');

      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      Object.keys(viewPanels).forEach(tab => {
        if (viewPanels[tab]) {
          if (tab === targetTab) {
            viewPanels[tab].classList.add('active');
          } else {
            viewPanels[tab].classList.remove('active');
          }
        }
      });
    });
  });
}

function openInputModal(customInstruction) {
  playSciFiSound('click');
  const modal = document.getElementById('inputModal');
  if (modal) {
    modal.classList.add('active');
    const instruction = modal.querySelector('.modal-instruction');
    if (instruction && customInstruction) {
      instruction.textContent = customInstruction;
    }
    const input = document.getElementById('modalPromptInput');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 120);
    }
  }
}

function closeInputModal() {
  playSciFiSound('click');
  const modal = document.getElementById('inputModal');
  if (modal) modal.classList.remove('active');
}

function openSuitModal() {
  playSciFiSound('click');
  const modal = document.getElementById('suitModal');
  if (modal) modal.classList.add('active');
}

function closeSuitModal() {
  playSciFiSound('click');
  const modal = document.getElementById('suitModal');
  if (modal) modal.classList.remove('active');
}

function setupModalAndButtons() {
  document.getElementById('btnOpenInputModal')?.addEventListener('click', () => openInputModal());
  document.getElementById('btnCloseInputModal')?.addEventListener('click', closeInputModal);
  document.getElementById('btnCancelModal')?.addEventListener('click', closeInputModal);

  document.getElementById('btnSubmitModalQuery')?.addEventListener('click', async () => {
    const input = document.getElementById('modalPromptInput');
    if (!input || !input.value.trim()) return;
    const query = input.value.trim();
    closeInputModal();
    await handleUserTransmission(query);
  });

  document.querySelectorAll('.quick-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-query');
      const input = document.getElementById('modalPromptInput');
      if (input) input.value = q;
    });
  });

  document.getElementById('btnOpenSuitModal')?.addEventListener('click', openSuitModal);
  document.getElementById('btnCloseSuitModal')?.addEventListener('click', closeSuitModal);

  document.querySelectorAll('.sb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const soundKey = btn.getAttribute('data-sound');
      playVoiceSample(soundKey);
    });
  });

  document.getElementById('coreEyeButton')?.addEventListener('click', () => {
    playSciFiSound('click');
    playVoiceSample(CONFIG.activeVoice);
  });

  document.getElementById('dockMicBtn')?.addEventListener('click', toggleVoiceInput);
  document.getElementById('dockCenterTrigger')?.addEventListener('click', toggleVoiceInput);

  document.getElementById('btnPlayLiamVoice')?.addEventListener('click', () => {
    playVoiceSample('liam');
  });

  document.getElementById('btnTriggerScan')?.addEventListener('click', executeDeepScan);
  document.getElementById('btnRunDeepScan')?.addEventListener('click', executeDeepScan);

  document.querySelectorAll('.assist-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const intent = btn.getAttribute('data-intent');
      playSciFiSound('click');

      if (intent === 'study') {
        handleUserTransmission("Help me review biophysics and polymer elongation formulas for my Midtown High lab test.");
      } else if (intent === 'organise') {
        handleUserTransmission("Organize today's patrol schedule between Queens, Lower Manhattan, and dinner with Aunt May.");
      } else if (intent === 'find') {
        handleUserTransmission("Scan recent police dispatches and Oscorp deliveries for suspicious activities.");
      } else if (intent === 'create') {
        handleUserTransmission("Calculate an optimized chemical formulation for high-tensile shock web fluid.");
      } else if (intent === 'solve') {
        handleUserTransmission("Run diagnostic on tactical suit power anomalies and sensory overload feedback.");
      } else if (intent === 'more') {
        openSuitModal();
      }
    });
  });

  document.getElementById('btnChatSend')?.addEventListener('click', () => {
    const input = document.getElementById('chatTextInput');
    if (input && input.value.trim()) {
      const q = input.value.trim();
      input.value = '';
      handleUserTransmission(q);
    }
  });

  document.getElementById('chatTextInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.getElementById('btnChatSend')?.click();
    }
  });

  document.getElementById('btnPingNetwork')?.addEventListener('click', () => {
    playSciFiSound('beep');
    const latEl = document.getElementById('netLatency');
    if (latEl) {
      latEl.textContent = 'Testing...';
      setTimeout(() => {
        const ping = 32 + Math.floor(Math.random() * 12);
        latEl.textContent = `${ping} ms`;
      }, 350);
    }
  });

  // Settings
  const inputKey = document.getElementById('inputGroqKey');
  if (inputKey) {
    inputKey.addEventListener('change', (e) => {
      CONFIG.groqApiKey = e.target.value.trim();
      localStorage.setItem('eve_groq_api_key', CONFIG.groqApiKey);
      playSciFiSound('click');
    });
  }

  const selectModel = document.getElementById('selectGroqModel');
  if (selectModel) {
    selectModel.value = CONFIG.groqModel;
    selectModel.addEventListener('change', (e) => {
      CONFIG.groqModel = e.target.value;
      localStorage.setItem('eve_groq_model', CONFIG.groqModel);
      const badge = document.getElementById('chatModelBadge');
      if (badge) badge.textContent = CONFIG.groqModel;
      playSciFiSound('click');
    });
  }

  const selectVoice = document.getElementById('selectVoiceModel');
  if (selectVoice) {
    selectVoice.value = CONFIG.activeVoice;
    selectVoice.addEventListener('change', (e) => {
      CONFIG.activeVoice = e.target.value;
      localStorage.setItem('eve_active_voice', CONFIG.activeVoice);
      playSciFiSound('click');
    });
  }

  const chkSfx = document.getElementById('chkEnableSfx');
  if (chkSfx) {
    chkSfx.checked = CONFIG.sfxEnabled;
    chkSfx.addEventListener('change', (e) => {
      CONFIG.sfxEnabled = e.target.checked;
      localStorage.setItem('eve_sfx_enabled', CONFIG.sfxEnabled);
    });
  }

  document.getElementById('btnTestVoice')?.addEventListener('click', () => {
    playVoiceSample(CONFIG.activeVoice);
  });

  document.getElementById('btnStopAudio')?.addEventListener('click', () => {
    stopAllAudio();
  });
}

function startClockAndTelemetry() {
  function updateTime() {
    const timeEl = document.getElementById('headerTime');
    if (timeEl) {
      const now = new Date();
      timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
  updateTime();
  setInterval(updateTime, 1000);

  setInterval(() => {
    const mem = 97 + Math.floor(Math.random() * 2);
    const proc = 65 + Math.floor(Math.random() * 10);
    const valMemory = document.getElementById('valMemory');
    const barMemory = document.getElementById('barMemory');
    const barProcessing = document.getElementById('barProcessing');

    if (valMemory) valMemory.textContent = `${mem}%`;
    if (barMemory) barMemory.style.width = `${mem}%`;
    if (barProcessing) barProcessing.style.width = `${proc}%`;
  }, 4000);
}

// Initializer
window.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupModalAndButtons();
  startVoiceWaveVisualizer();
  startDockWaveVisualizer();
  startWorldMapVisualizer();
  startClockAndTelemetry();

  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
  }
});
