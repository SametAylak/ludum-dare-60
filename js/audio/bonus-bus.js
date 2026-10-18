const impulses = new WeakMap();

function hall(ctx) {
  if (impulses.has(ctx)) return impulses.get(ctx);
  const buffer = ctx.createBuffer(2, Math.ceil(ctx.sampleRate * 2.4), ctx.sampleRate);
  let seed = 1844;
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let smooth = 0;
    for (let i = 0; i < data.length; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
      smooth = smooth * .55 + (seed / 2147483648) * .45;
      const seconds = i / ctx.sampleRate;
      data[i] = smooth * Math.exp(-seconds * 3.4) * Math.min(1, seconds / .025);
    }
  }
  impulses.set(ctx, buffer);
  return buffer;
}

// Each show owns its echoes, so cancelling cannot spill old phrases into a replay.
export function createBonusBus(ctx, destination) {
  const nodes = [];
  const gain = (value = 1) => { const n = ctx.createGain(); n.gain.value = value; nodes.push(n); return n; };
  const pan = (value, dest) => {
    const n = ctx.createStereoPanner(); n.pan.value = value; n.connect(dest); nodes.push(n); return n;
  };
  const output = gain(.9), music = gain(), duck = gain(), bass = gain(), drums = gain();
  // The sweep closes during the builds and opens on the drop; the compressor glues drums and music together.
  const sweep = ctx.createBiquadFilter(); sweep.type = "lowpass"; sweep.frequency.value = 20000; sweep.Q.value = 1.1;
  const glue = ctx.createDynamicsCompressor();
  glue.threshold.value = -16; glue.knee.value = 10; glue.ratio.value = 2.5; glue.attack.value = .012; glue.release.value = .16;
  output.connect(glue); glue.connect(destination);
  music.connect(duck); duck.connect(sweep); sweep.connect(output); bass.connect(output); drums.connect(output);
  const left = pan(-.45, music), right = pan(.45, music);
  const lead = gain(); lead.connect(music);
  const reverb = ctx.createConvolver(); reverb.buffer = hall(ctx);
  const predelay = ctx.createDelay(.1); predelay.delayTime.value = .027;
  const highpass = ctx.createBiquadFilter(); highpass.type = "highpass"; highpass.frequency.value = 380;
  const lowpass = ctx.createBiquadFilter(); lowpass.type = "lowpass"; lowpass.frequency.value = 5200;
  const wet = gain(.24);
  music.connect(predelay); predelay.connect(reverb); reverb.connect(highpass); highpass.connect(lowpass); lowpass.connect(wet); wet.connect(duck);
  const delays = [ctx.createDelay(2), ctx.createDelay(2)];
  const echoFilter = ctx.createBiquadFilter(); echoFilter.type = "lowpass"; echoFilter.frequency.value = 2700;
  const send = gain(.22), feedback = gain(.27);
  lead.connect(send); send.connect(delays[0]); delays[0].connect(pan(-.65, music));
  delays[0].connect(delays[1]); delays[1].connect(pan(.65, music));
  delays[1].connect(echoFilter); echoFilter.connect(feedback); feedback.connect(delays[0]);
  nodes.push(sweep, glue, reverb, predelay, highpass, lowpass, echoFilter, ...delays);
  return { output, music, duck, sweep, bass, drums, left, right, lead, delays,
    stop(t) {
      output.gain.cancelScheduledValues(t);
      output.gain.setTargetAtTime(0, t, .025);
      setTimeout(() => nodes.forEach(node => node.disconnect()), 500);
    },
  };
}
