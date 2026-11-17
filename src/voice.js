// Speaks sentences one after another. Fast taps queue: each sentence waits for
// the one before it, and none is cut off.
// say(text, onStart) resolves when that sentence has finished; onStart runs when
// its own voice begins, so the picture never runs ahead of the voice.
export function createVoice(rate = 0.85) {
  const synth = window.speechSynthesis;
  const live = new Set(); // keeps utterances alive so iOS still fires their events
  let voice = null;

  function pickVoice() {
    const voices = synth.getVoices().filter(v => v.lang && v.lang.toLowerCase().startsWith("en"));
    voice = voices.find(v => v.default) || voices.find(v => /en[-_]US/i.test(v.lang))
         || voices.find(v => /en[-_]CA/i.test(v.lang)) || voices[0] || null;
  }
  if (synth) {
    pickVoice();
    synth.addEventListener?.("voiceschanged", pickVoice);
    // iOS can leave the voice paused after the app has been in the background.
    document.addEventListener("visibilitychange", () => { if (!document.hidden) synth.resume(); });
  }

  function say(text, onStart = () => {}) {
    return new Promise(resolve => {
      if (!synth) { onStart(); resolve(); return; }
      const u = new SpeechSynthesisUtterance(text);
      if (voice) { u.voice = voice; u.lang = voice.lang; } else { u.lang = "en-US"; }
      u.rate = rate;
      let started = false;
      const start = () => { if (!started) { started = true; onStart(); } };
      if (!synth.speaking && !synth.pending) start(); // nothing ahead of it: show at once
      u.onstart = start;
      u.onend = u.onerror = () => { live.delete(u); resolve(); };
      live.add(u);
      synth.speak(u);
    });
  }

  // Drops everything still waiting, for when the page changes.
  // (Cancelling an idle voice can make some browsers swallow the next sentence, so check first.)
  function stop() {
    live.forEach(u => { u.onstart = null; });
    if (synth && (synth.speaking || synth.pending)) synth.cancel();
  }

  return { say, stop };
}
