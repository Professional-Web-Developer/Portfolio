'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Download,
  List,
  Mail,
  Moon,
  Navigation,
  PartyPopper,
  Play,
  RotateCcw,
  Square,
  Sun,
  X,
} from 'lucide-react';
import { CONTACT_EMAIL, RESUME_URL, STOPS, STOP_BY_ID } from './stops';
import StopContent from './StopCard';
import './CareerCity.css';

// All of three.js lives in this chunk; it is only fetched on /city, and only
// when the 3D version is actually going to run.
const CityScene = dynamic(() => import('./CityScene'), { ssr: false, loading: () => null });

const TOTAL = STOPS.length;

function hasWebGL2() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return false;
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
    return true;
  } catch (e) {
    return false;
  }
}

/* Focus handling shared by the dialogs: focus on open, Escape to close,
   Tab stays inside, focus returns to where it was on close. */
function useDialog(ref, onClose) {
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const previous = document.activeElement;
    const target = node.querySelector('[data-autofocus]') || node;
    target.focus({ preventScroll: true });

    const onKey = (event) => {
      if (event.key === 'Escape' && closeRef.current) {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = Array.from(node.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]'));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === node)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (!node.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true });
    };
  }, [ref]);
}

/* ---- Touch pad: one big control, push it the way you want to go ------ */
function TouchPad({ apiRef, disabled }) {
  const padRef = useRef(null);
  const knobRef = useRef(null);

  useEffect(() => {
    const pad = padRef.current;
    const knob = knobRef.current;
    if (!pad || !knob) return undefined;
    let active = null;

    const set = (x, z) => {
      knob.style.transform = `translate(${(x * 34).toFixed(1)}px, ${(z * 34).toFixed(1)}px)`;
      if (apiRef.current) apiRef.current.setPad(x, z);
    };
    const move = (event) => {
      const box = pad.getBoundingClientRect();
      let x = (event.clientX - (box.left + box.width / 2)) / (box.width / 2);
      let z = (event.clientY - (box.top + box.height / 2)) / (box.height / 2);
      const mag = Math.hypot(x, z);
      if (mag < 0.18) {
        set(0, 0);
        return;
      }
      // Anything past a light push is full speed, so no precision is needed.
      const scale = Math.min(1, mag / 0.45) / mag;
      x *= scale;
      z *= scale;
      set(x, z);
    };
    const down = (event) => {
      if (disabled) return;
      active = event.pointerId;
      try {
        pad.setPointerCapture(active);
      } catch (e) {
        /* capture is a nicety */
      }
      pad.classList.add('is-active');
      move(event);
      event.preventDefault();
    };
    const drag = (event) => {
      if (event.pointerId !== active) return;
      move(event);
      event.preventDefault();
    };
    const up = (event) => {
      if (event.pointerId !== active) return;
      active = null;
      pad.classList.remove('is-active');
      set(0, 0);
    };
    pad.addEventListener('pointerdown', down);
    pad.addEventListener('pointermove', drag);
    pad.addEventListener('pointerup', up);
    pad.addEventListener('pointercancel', up);
    return () => {
      pad.removeEventListener('pointerdown', down);
      pad.removeEventListener('pointermove', drag);
      pad.removeEventListener('pointerup', up);
      pad.removeEventListener('pointercancel', up);
      set(0, 0);
    };
  }, [apiRef, disabled]);

  return (
    <div ref={padRef} className="city-pad" aria-hidden="true">
      <span className="city-pad__arrow city-pad__arrow--up">▲</span>
      <span className="city-pad__arrow city-pad__arrow--left">◀</span>
      <span className="city-pad__arrow city-pad__arrow--right">▶</span>
      <span className="city-pad__arrow city-pad__arrow--down">▼</span>
      <span ref={knobRef} className="city-pad__knob" />
    </div>
  );
}

function ControlsDiagram() {
  return (
    <div className="city-howto" aria-label="How to play">
      <div className="city-howto__item city-only-keys">
        <div className="city-keys" aria-hidden="true">
          <kbd className="city-keys__up">↑</kbd>
          <kbd>←</kbd>
          <kbd>↓</kbd>
          <kbd>→</kbd>
        </div>
        <p>
          <strong>Arrow keys</strong> (or W A S D) drive the car
        </p>
      </div>
      <div className="city-howto__item city-only-touch">
        <div className="city-minipad" aria-hidden="true">
          <span />
        </div>
        <p>
          <strong>Push the round pad</strong> the way you want to go
        </p>
      </div>
      <div className="city-howto__item">
        <div className="city-miniring" aria-hidden="true">
          <span />
        </div>
        <p>
          <strong>Drive into a glowing ring</strong> to read that stop
        </p>
      </div>
    </div>
  );
}

function Intro({ onDrive, onTour, onList }) {
  const ref = useRef(null);
  useDialog(ref, null);
  return (
    <div className="city-overlay">
      <div
        ref={ref}
        className="city-intro"
        role="dialog"
        aria-modal="true"
        aria-labelledby="city-intro-title"
        tabIndex={-1}
      >
        <p className="city-eyebrow">Kavin Pasupathy · interactive resume</p>
        <h2 id="city-intro-title">Welcome to Career City</h2>
        <p className="city-intro__lead">
          Drive a little car around a tiny city. Each of the six buildings is one part of Kavin’s resume.
        </p>
        <ControlsDiagram />
        <div className="city-intro__actions">
          <button type="button" className="city-btn city-btn--primary city-btn--big" onClick={onDrive} data-autofocus>
            <Navigation size={18} aria-hidden="true" /> Drive myself
          </button>
          <button type="button" className="city-btn city-btn--big" onClick={onTour}>
            <Play size={18} aria-hidden="true" /> Take the auto tour
          </button>
        </div>
        <p className="city-intro__note">
          The auto tour drives for you. You only press “Next stop”.{' '}
          <button type="button" className="city-textbtn" onClick={onList}>
            Or read it as a simple list
          </button>
        </p>
      </div>
    </div>
  );
}

function InfoCard({ stop, index, tour, nextStop, suggestion, onClose, onNext, onGo }) {
  const ref = useRef(null);
  useDialog(ref, onClose);
  return (
    <div
      ref={ref}
      className="city-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="city-card-title"
      tabIndex={-1}
      data-stop={stop.id}
    >
      <header className="city-card__head">
        <div>
          <p className="city-eyebrow">
            Stop {index + 1} of {TOTAL} · {stop.name}
          </p>
          <h2 id="city-card-title">{stop.title}</h2>
          <p className="city-card__kicker">{stop.kicker}</p>
        </div>
        <button type="button" className="city-iconbtn" onClick={onClose} aria-label="Close this card and keep driving">
          <X size={20} aria-hidden="true" />
        </button>
      </header>
      <div className="city-card__body" tabIndex={0} role="group" aria-label={`${stop.name} details`}>
        <StopContent stop={stop} headingLevel={3} />
        <Link href={stop.sectionHref} className="city-sectionlink">
          {stop.sectionLabel} on the main site <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
      <footer className="city-card__foot">
        {tour && nextStop && (
          <button type="button" className="city-btn city-btn--primary" onClick={onNext} data-autofocus>
            Next stop: {nextStop.name} <ArrowRight size={16} aria-hidden="true" />
          </button>
        )}
        {tour && !nextStop && (
          <button type="button" className="city-btn city-btn--primary" onClick={onClose} data-autofocus>
            <Check size={16} aria-hidden="true" /> Finish the tour
          </button>
        )}
        {!tour && (
          <button type="button" className="city-btn city-btn--primary" onClick={onClose} data-autofocus>
            Keep driving
          </button>
        )}
        {!tour && suggestion && (
          <button type="button" className="city-btn" onClick={() => onGo(suggestion.id)}>
            Take me to {suggestion.name} <ArrowRight size={16} aria-hidden="true" />
          </button>
        )}
        {tour && nextStop && (
          <button type="button" className="city-btn" onClick={onClose}>
            Drive myself
          </button>
        )}
      </footer>
    </div>
  );
}

function Celebration({ onClose }) {
  const ref = useRef(null);
  useDialog(ref, onClose);
  return (
    <div className="city-overlay city-overlay--light">
      <div
        ref={ref}
        className="city-intro city-party"
        role="dialog"
        aria-modal="true"
        aria-labelledby="city-party-title"
        tabIndex={-1}
      >
        <div className="city-party__confetti" aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => (
            <i key={i} style={{ '--i': i }} />
          ))}
        </div>
        <div className="city-party__icon" aria-hidden="true">
          <PartyPopper size={28} />
        </div>
        <h2 id="city-party-title">You visited all six stops!</h2>
        <p className="city-intro__lead">
          That is Kavin’s whole resume. If you liked what you saw, he would love to hear from you.
        </p>
        <div className="city-intro__actions">
          <a className="city-btn city-btn--primary city-btn--big" href={`mailto:${CONTACT_EMAIL}`} data-autofocus>
            <Mail size={18} aria-hidden="true" /> Email Kavin
          </a>
          <a className="city-btn city-btn--big" href={RESUME_URL} target="_blank" rel="noopener noreferrer">
            <Download size={18} aria-hidden="true" /> Download resume
            <span className="city-sr"> (opens in a new tab)</span>
          </a>
        </div>
        <p className="city-intro__note">
          <button type="button" className="city-textbtn" onClick={onClose}>
            Keep driving
          </button>{' '}
          ·{' '}
          <Link href="/" className="city-textbtn">
            Back to portfolio
          </Link>
        </p>
      </div>
    </div>
  );
}

function PlainList({ reason, canStart3d, onStart3d }) {
  return (
    <main className="city-list" id="city-list">
      <p className="city-eyebrow">Kavin Pasupathy · interactive resume</p>
      <h1>Career City</h1>
      <p className="city-list__lead">
        {reason === 'nowebgl' &&
          'Career City is a small 3D driving game, but 3D graphics are not available in this browser. Here are the same six stops as a simple list.'}
        {reason === 'reduced' &&
          'Career City is a small 3D driving game. Your device asks for reduced motion, so here are the same six stops as a simple list.'}
        {reason === 'choice' && 'The six stops of Career City as a simple list, with the same content as the game.'}
      </p>
      {canStart3d && (
        <button type="button" className="city-btn city-btn--primary" onClick={onStart3d}>
          <Play size={16} aria-hidden="true" /> {reason === 'reduced' ? 'Start the 3D version anyway' : 'Start the 3D version'}
        </button>
      )}
      <ol className="city-list__stops">
        {STOPS.map((stop, index) => (
          <li key={stop.id}>
            <article className="city-listcard" aria-labelledby={`city-list-${stop.id}`} data-stop={stop.id}>
              <p className="city-eyebrow">
                Stop {index + 1} of {TOTAL} · {stop.place}
              </p>
              <h2 id={`city-list-${stop.id}`}>
                {stop.name}: {stop.title}
              </h2>
              <p className="city-card__kicker">{stop.kicker}</p>
              <StopContent stop={stop} headingLevel={3} />
              <Link href={stop.sectionHref} className="city-sectionlink">
                {stop.sectionLabel} on the main site <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </article>
          </li>
        ))}
      </ol>
      <div className="city-list__end">
        <a className="city-btn city-btn--primary" href={`mailto:${CONTACT_EMAIL}`}>
          <Mail size={16} aria-hidden="true" /> Email Kavin
        </a>
        <a className="city-btn" href={RESUME_URL} target="_blank" rel="noopener noreferrer">
          <Download size={16} aria-hidden="true" /> Download resume
          <span className="city-sr"> (opens in a new tab)</span>
        </a>
        <Link className="city-btn" href="/">
          <ArrowLeft size={16} aria-hidden="true" /> Back to portfolio
        </Link>
      </div>
    </main>
  );
}

export default function CareerCity() {
  const [phase, setPhase] = useState('pending'); // pending | intro | play | list
  const [listReason, setListReason] = useState('choice');
  const [webgl, setWebgl] = useState(true);
  const [use3d, setUse3d] = useState(false);
  const [ready, setReady] = useState(false);
  const [visited, setVisited] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [tour, setTour] = useState(false);
  const [driving, setDriving] = useState(null);
  const [nearest, setNearest] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const [theme, setTheme] = useState('dark');

  const apiRef = useRef(null);
  const pendingRef = useRef(null);
  const celebratedRef = useRef(false);
  const goToRef = useRef(() => {});

  // Decide between the game and the plain list once we can see the device.
  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') || 'dark');
    const ok = hasWebGL2();
    setWebgl(ok);
    if (!ok) {
      setListReason('nowebgl');
      setPhase('list');
    } else if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setListReason('reduced');
      setPhase('list');
    } else {
      setUse3d(true);
      setPhase('intro');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch (e) {
      /* storage unavailable: theme still applies for this visit */
    }
  };

  const onSceneEvent = useCallback((type, payload) => {
    if (type === 'ready') {
      setReady(true);
      if (pendingRef.current && apiRef.current) {
        apiRef.current.setPaused(false);
        apiRef.current.driveTo(pendingRef.current);
        pendingRef.current = null;
      }
    } else if (type === 'fail') {
      setUse3d(false);
      setReady(false);
      setWebgl(false);
      setOpenId(null);
      setDriving(null);
      setTour(false);
      setListReason('nowebgl');
      setPhase('list');
    } else if (type === 'arrive') {
      setDriving(null);
      setOpenId(payload);
      setVisited((list) => (list.includes(payload) ? list : [...list, payload]));
    } else if (type === 'nearest') {
      setNearest(payload);
    } else if (type === 'autoCancel') {
      setDriving(null);
      setTour(false);
    } else if (type === 'pick') {
      goToRef.current(payload);
    }
  }, []);

  const paused = phase !== 'play' || Boolean(openId) || celebrate;
  useEffect(() => {
    if (apiRef.current) apiRef.current.setPaused(paused);
  }, [paused, ready]);
  useEffect(() => {
    if (apiRef.current) apiRef.current.setVisited(visited);
  }, [visited, ready]);

  const driveTo = (id) => {
    setOpenId(null);
    setCelebrate(false);
    setPhase('play');
    setDriving(id);
    if (apiRef.current) {
      apiRef.current.setPaused(false);
      apiRef.current.driveTo(id);
    } else {
      pendingRef.current = id; // scene still loading: go as soon as it is ready
    }
  };
  const goTo = (id) => {
    setTour(false);
    driveTo(id);
  };
  goToRef.current = (id) => {
    if (phase === 'play' && !openId && !celebrate) goTo(id);
  };

  const startTour = () => {
    const first = STOPS.find((stop) => !visited.includes(stop.id)) || STOPS[0];
    setTour(true);
    driveTo(first.id);
  };
  const stopTour = () => {
    setTour(false);
    setDriving(null);
    pendingRef.current = null;
    if (apiRef.current) apiRef.current.cancelAuto();
  };
  const closeCard = () => {
    setOpenId(null);
    setTour(false);
    if (visited.length === TOTAL && !celebratedRef.current) {
      celebratedRef.current = true;
      setCelebrate(true);
    }
  };
  const resetCar = () => {
    setTour(false);
    setDriving(null);
    pendingRef.current = null;
    if (apiRef.current) apiRef.current.reset();
  };
  const showList = () => {
    setListReason('choice');
    setPhase('list');
    setUse3d(false);
    setReady(false);
    setOpenId(null);
    setTour(false);
    setDriving(null);
    pendingRef.current = null;
  };
  const start3d = () => {
    setUse3d(true);
    setPhase('intro');
  };

  const openStop = openId ? STOP_BY_ID[openId] : null;
  const openIndex = openStop ? STOPS.indexOf(openStop) : -1;
  const nextInTour = openIndex >= 0 ? STOPS[openIndex + 1] || null : null;
  const suggestion = STOPS.find((stop) => !visited.includes(stop.id) && stop.id !== openId) || null;
  const allDone = visited.length === TOTAL;
  const game = phase === 'intro' || phase === 'play';
  const hudHidden = phase !== 'play';

  return (
    <div className={`city ${game ? 'city--game' : 'city--list'}`} data-phase={phase}>
      <header className="city-bar">
        <Link href="/" className="city-back">
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Back to portfolio</span>
        </Link>
        {game ? <h1 className="city-bar__title">Career City</h1> : <span className="city-bar__title" aria-hidden="true" />}
        <button
          type="button"
          className="city-iconbtn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
        </button>
      </header>

      {phase === 'pending' && <p className="city-loading">Loading Career City…</p>}

      {phase === 'list' && <PlainList reason={listReason} canStart3d={webgl} onStart3d={start3d} />}

      {game && (
        <main className="city-game">
          <div
            className="city-stage"
            role="img"
            aria-label="A small 3D city with six landmark buildings: Home, Experience, Projects, Skills, Education and Contact. Use the list of stops to visit each one."
          >
            {use3d && <CityScene apiRef={apiRef} onEvent={onSceneEvent} />}
          </div>

          {!hudHidden && (
            <>
              <nav className="city-stops" aria-label="Stops">
                <div className="city-stops__head">
                  <p className="city-stops__count" aria-live="polite">
                    Visited <strong>{visited.length}</strong> of {TOTAL}
                  </p>
                  <div className="city-progress" aria-hidden="true">
                    <span style={{ width: `${(visited.length / TOTAL) * 100}%` }} />
                  </div>
                </div>
                <ol>
                  {STOPS.map((stop, index) => {
                    const done = visited.includes(stop.id);
                    const active = driving === stop.id || openId === stop.id;
                    return (
                      <li key={stop.id}>
                        <button
                          type="button"
                          className={`city-stop${done ? ' is-done' : ''}${active ? ' is-active' : ''}`}
                          onClick={() => goTo(stop.id)}
                          data-stop={stop.id}
                          aria-label={`${index + 1}. ${stop.name}${done ? ', visited' : ''}. Drive me there`}
                          title={`Drive me to ${stop.name}`}
                        >
                          <span className="city-stop__num" aria-hidden="true">
                            {done ? <Check size={14} /> : index + 1}
                          </span>
                          <span className="city-stop__name">{stop.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
                <p className="city-stops__tip">Click a stop and the car drives there.</p>
              </nav>

              <div className="city-actions">
                {tour || driving ? (
                  <button type="button" className="city-btn city-btn--primary" onClick={stopTour} data-action="stop-tour">
                    <Square size={15} aria-hidden="true" /> {tour ? 'Stop tour' : 'Stop'}
                  </button>
                ) : (
                  <button type="button" className="city-btn city-btn--primary" onClick={startTour} data-action="tour">
                    <Play size={15} aria-hidden="true" /> Auto tour
                  </button>
                )}
                <button type="button" className="city-btn" onClick={resetCar} data-action="reset">
                  <RotateCcw size={15} aria-hidden="true" /> Reset car
                </button>
                <button type="button" className="city-btn city-btn--quiet" onClick={showList} data-action="list">
                  <List size={15} aria-hidden="true" /> List view
                </button>
              </div>

              <p className="city-hint" role="status">
                {openStop && (
                  <>
                    <strong>You are at {openStop.name}.</strong>
                    <span>
                      {tour ? 'Press “Next stop” on the card when you are ready.' : 'Close the card (Esc) to keep driving.'}
                    </span>
                  </>
                )}
                {!openStop && driving && (
                  <>
                    <strong>Driving to {STOP_BY_ID[driving].name}…</strong>
                    <span className="city-only-keys">Press an arrow key to take over.</span>
                    <span className="city-only-touch">Touch the pad to take over.</span>
                  </>
                )}
                {!openStop && !driving && allDone && (
                  <>
                    <strong>All six stops visited.</strong>
                    <span>Drive around, or click a stop to read it again.</span>
                  </>
                )}
                {!openStop && !driving && !allDone && (
                  <>
                    <strong>
                      Follow the yellow arrow to {nearest ? STOP_BY_ID[nearest].name : 'the next stop'} and drive into
                      the glowing ring.
                    </strong>
                    <span className="city-only-keys">Drive with the arrow keys or W A S D.</span>
                    <span className="city-only-touch">Push the round pad to drive.</span>
                  </>
                )}
              </p>

              <TouchPad apiRef={apiRef} disabled={paused} />
            </>
          )}

          {phase === 'intro' && <Intro onDrive={() => setPhase('play')} onTour={startTour} onList={showList} />}

          {phase === 'play' && openStop && (
            <InfoCard
              key={openStop.id}
              stop={openStop}
              index={openIndex}
              tour={tour}
              nextStop={nextInTour}
              suggestion={suggestion}
              onClose={closeCard}
              onNext={() => driveTo(nextInTour.id)}
              onGo={goTo}
            />
          )}

          {phase === 'play' && celebrate && !openStop && <Celebration onClose={() => setCelebrate(false)} />}
        </main>
      )}

      {phase === 'list' && (
        <p className="city-foot">
          <ArrowUpRight size={14} aria-hidden="true" /> Career City is part of{' '}
          <Link href="/">Kavin Pasupathy’s portfolio</Link>.
        </p>
      )}
    </div>
  );
}
