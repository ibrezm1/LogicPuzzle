// Audio Context & Sounds Synthesis (Web Audio API)
(function() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let isMuted = false;

  function playSound(type) {
    if (isMuted) return;
    
    // Resume context if suspended (browser security)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    if (type === 'pickup') {
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'snap') {
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'lock') {
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.setValueAtTime(554.37, now + 0.06); // C#5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.18);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'win') {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const oscN = audioCtx.createOscillator();
        const gainN = audioCtx.createGain();
        oscN.connect(gainN);
        gainN.connect(audioCtx.destination);
        
        const time = now + idx * 0.07;
        oscN.frequency.setValueAtTime(freq, time);
        gainN.gain.setValueAtTime(0.08, time);
        gainN.gain.linearRampToValueAtTime(0, time + 0.35);
        
        oscN.start(time);
        oscN.stop(time + 0.35);
      });
    }
  }

  function toggleMute() {
    isMuted = !isMuted;
    return isMuted;
  }

  function getMuted() {
    return isMuted;
  }

  // Export globally
  window.GameAudio = {
    playSound,
    toggleMute,
    getMuted
  };
})();
