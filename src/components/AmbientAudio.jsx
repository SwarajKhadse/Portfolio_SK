import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

function createPinkNoiseBuffer(context, duration = 3) {
  const length = Math.floor(context.sampleRate * duration);

  const buffer = context.createBuffer(
    1,
    length,
    context.sampleRate
  );

  const data = buffer.getChannelData(0);

  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let b3 = 0;
  let b4 = 0;
  let b5 = 0;
  let b6 = 0;

  for (let index = 0; index < length; index += 1) {
    const white = Math.random() * 2 - 1;

    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;

    data[index] =
      (
        b0 +
        b1 +
        b2 +
        b3 +
        b4 +
        b5 +
        b6 +
        white * 0.5362
      ) * 0.11;

    b6 = white * 0.115926;
  }

  return buffer;
}

function addNoiseLayer(
  context,
  buffer,
  master,
  type,
  frequency,
  q,
  gainValue
) {
  const source = context.createBufferSource();

  source.buffer = buffer;
  source.loop = true;

  const filter = context.createBiquadFilter();

  filter.type = type;
  filter.frequency.value = frequency;
  filter.Q.value = q;

  const gain = context.createGain();
  gain.gain.value = gainValue;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);

  source.start();

  return { source, filter, gain };
}

function createAmbience() {
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error(
      "Web Audio API is not supported in this browser."
    );
  }

  const context = new AudioContextClass();

  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);

  const noise = createPinkNoiseBuffer(context);

  const terminal = addNoiseLayer(
    context,
    noise,
    master,
    "bandpass",
    760,
    0.45,
    0.028
  );

  const lowRumble = addNoiseLayer(
    context,
    noise,
    master,
    "lowpass",
    220,
    0.35,
    0.024
  );

  const turbineRumble = addNoiseLayer(
    context,
    noise,
    master,
    "lowpass",
    410,
    0.55,
    0.004
  );

  const airRush = addNoiseLayer(
    context,
    noise,
    master,
    "highpass",
    1050,
    0.25,
    0.002
  );

  const hum = context.createOscillator();

  hum.type = "sine";
  hum.frequency.value = 48;

  const humGain = context.createGain();
  humGain.gain.value = 0.009;

  hum.connect(humGain);
  humGain.connect(master);
  hum.start();

  const turbineTone = context.createOscillator();

  turbineTone.type = "sawtooth";
  turbineTone.frequency.value = 62;

  const turbineFilter = context.createBiquadFilter();

  turbineFilter.type = "lowpass";
  turbineFilter.frequency.value = 190;

  const turbineToneGain = context.createGain();
  turbineToneGain.gain.value = 0.001;

  turbineTone.connect(turbineFilter);
  turbineFilter.connect(turbineToneGain);
  turbineToneGain.connect(master);
  turbineTone.start();

  let lastUpdate = 0;
  let lastProgress = -1;
  let lastActive = null;
  let lastEnabled = null;

  const update = (progress, active, enabled) => {
    const now = context.currentTime;

    if (
      now - lastUpdate < 0.075 &&
      Math.abs(progress - lastProgress) < 0.012 &&
      active === lastActive &&
      enabled === lastEnabled
    ) {
      return;
    }

    lastUpdate = now;
    lastProgress = progress;
    lastActive = active;
    lastEnabled = enabled;

    const takeoff = Math.min(
      1,
      Math.max(0, (progress - 0.65) / 0.18)
    );

    const airborne = Math.min(
      1,
      Math.max(0, (progress - 0.8) / 0.2)
    );

    const departure = Math.min(
      1,
      Math.max(0, progress / 0.4)
    );

    const masterVolume =
      enabled && active && progress < 0.995 ? 0.62 : 0;

    master.gain.setTargetAtTime(
      masterVolume,
      now,
      enabled && active ? 0.28 : 0.1
    );

    terminal.gain.gain.setTargetAtTime(
      0.006 + 0.022 * (1 - departure),
      now,
      0.22
    );

    lowRumble.gain.gain.setTargetAtTime(
      0.022 +
        0.018 * Math.min(1, progress / 0.5) +
        0.012 * takeoff,
      now,
      0.18
    );

    turbineRumble.gain.gain.setTargetAtTime(
      0.003 + 0.035 * takeoff + 0.014 * airborne,
      now,
      0.2
    );

    airRush.gain.gain.setTargetAtTime(
      0.0015 + 0.01 * takeoff + 0.008 * airborne,
      now,
      0.24
    );

    hum.frequency.setTargetAtTime(
      47 + 4 * departure + 2 * takeoff,
      now,
      0.25
    );

    turbineTone.frequency.setTargetAtTime(
      60 + 32 * departure + 72 * takeoff + 20 * airborne,
      now,
      0.22
    );

    turbineToneGain.gain.setTargetAtTime(
      0.001 + 0.008 * takeoff + 0.003 * airborne,
      now,
      0.2
    );
  };

  return {
    context,
    master,
    update,

    async dispose() {
      try {
        await context.close();
      } catch {
        // The browser may already have closed the audio context.
      }
    },
  };
}

function getJourneyProgress(scrollPositionRef, journeyRef) {
  const section = journeyRef?.current;
  if (!section) return 0;

  const scroll = scrollPositionRef?.current ?? window.scrollY ?? 0;
  const top = section.getBoundingClientRect().top + scroll;

  const distance = Math.max(
    1,
    section.offsetHeight - window.innerHeight
  );

  return Math.min(
    1,
    Math.max(0, (scroll - top) / distance)
  );
}

export default function AmbientAudio({
  active,
  scrollPositionRef,
  journeyRef,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const engineRef = useRef(null);
  const activeRef = useRef(active);
  const enabledRef = useRef(false);
  const suspendTimerRef = useRef(null);

  activeRef.current = active;

  useEffect(() => {
    let frame;

    const tick = () => {
      const progress = getJourneyProgress(
        scrollPositionRef,
        journeyRef
      );

      engineRef.current?.update(
        progress,
        activeRef.current,
        enabledRef.current
      );

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [scrollPositionRef, journeyRef]);

  useEffect(
    () => () => {
      if (suspendTimerRef.current) {
        window.clearTimeout(suspendTimerRef.current);
      }

      engineRef.current?.dispose();
      engineRef.current = null;
    },
    []
  );

  const toggle = useCallback(async () => {
    const nextEnabled = !enabledRef.current;

    if (suspendTimerRef.current) {
      window.clearTimeout(suspendTimerRef.current);
      suspendTimerRef.current = null;
    }

    if (nextEnabled) {
      try {
        if (!engineRef.current) {
          engineRef.current = createAmbience();
        }

        await engineRef.current.context.resume();

        enabledRef.current = true;
        setIsPlaying(true);
        setUnavailable(false);

        engineRef.current.update(
          getJourneyProgress(scrollPositionRef, journeyRef),
          activeRef.current,
          true
        );
      } catch (error) {
        console.warn(
          "Airport ambience could not start:",
          error
        );

        enabledRef.current = false;
        setIsPlaying(false);
        setUnavailable(true);
      }

      return;
    }

    enabledRef.current = false;
    setIsPlaying(false);

    const engine = engineRef.current;

    if (engine) {
      engine.master.gain.setTargetAtTime(
        0,
        engine.context.currentTime,
        0.08
      );

      suspendTimerRef.current = window.setTimeout(() => {
        if (!enabledRef.current) {
          engine.context.suspend().catch(() => {});
        }
      }, 400);
    }
  }, [journeyRef, scrollPositionRef]);

  return (
    <button
      type="button"
      className={`audio-toggle ${
        isPlaying ? "is-playing" : ""
      }`}
      data-cursor="interactive"
      data-cursor-label="Sound"
      onClick={toggle}
      aria-pressed={isPlaying}
      aria-label={
        isPlaying
          ? "Turn Airport Ambience Off"
          : "Turn Airport Ambience On"
      }
      title={
        unavailable
          ? "Audio Is Not Supported In This Browser"
          : "Toggle Airport Ambience"
      }
    >
      <span className="audio-bars" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>

      {unavailable
        ? "Audio N/A"
        : isPlaying
          ? "Sound On"
          : "Sound Off"}
    </button>
  );
}