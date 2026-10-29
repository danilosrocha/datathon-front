"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import manifest from "@/public/genio_bb_frames_hd/manifest.json";

export type GenioMood = "IDLE" | "GREETING" | "LISTENING" | "THINKING" | "EXPLAINING" | "IDEA" | "CELEBRATING";
export type GenioScene = "welcome" | "conversation" | "analysis" | "result";

export interface GenioSignal {
  scene: GenioScene;
  questionId?: string | null;
  processing?: boolean;
  ready?: boolean;
  milestoneId?: string;
  discoveredNeed?: string;
}

const animations: Record<GenioMood, string> = {
  IDLE: "01_flutuando",
  GREETING: "02_acenando",
  LISTENING: "01_flutuando",
  THINKING: "03_pensando",
  EXPLAINING: "05_apresentando",
  IDEA: "04_ideia",
  CELEBRATING: "06_comemorando",
};
const policy: Record<GenioMood, { loop: boolean; priority: number }> = {
  IDLE: { loop: true, priority: 0 },
  LISTENING: { loop: true, priority: 1 },
  GREETING: { loop: false, priority: 2 },
  THINKING: { loop: true, priority: 3 },
  EXPLAINING: { loop: false, priority: 2 },
  IDEA: { loop: false, priority: 3 },
  CELEBRATING: { loop: false, priority: 4 },
};
const details = Object.fromEntries(manifest.animacoes.map((animation) => [animation.id, animation]));
const frameCache = new Map<string, Promise<string[]>>();
const celebrated = new Set<string>();

// Offsets measured from the blue turban centroid across all 12 frames at 400×275.
// Arms and tail remain at their native scale; only the whole transparent canvas moves.
const alignment: Record<string, [number, number]> = {
  "01_flutuando": [6, 2],
  "02_acenando": [-1, -1],
  "03_pensando": [-31, -5],
  "04_ideia": [-27, -4],
  "05_apresentando": [6, 2],
  "06_comemorando": [-3, 2],
};

function framePath(id: string, index: number) {
  return `/genio_bb_frames_webp/${id}/frame_${String(index).padStart(3, "0")}.webp`;
}

export function firstGenioFrame() {
  return framePath(animations.LISTENING, 1);
}

function preload(id: string): Promise<string[]> {
  const cached = frameCache.get(id);
  if (cached) return cached;
  const frames = Promise.all(Array.from({ length: details[id].frames }, (_, index) => {
    const src = framePath(id, index + 1);
    const image = new Image();
    image.src = src;
    return image.decode().then(() => src);
  })).catch((error) => {
    frameCache.delete(id);
    throw error;
  });
  frameCache.set(id, frames);
  return frames;
}

class GenioController {
  private active: GenioMood = "LISTENING";
  private requested: GenioMood = "LISTENING";
  private token = 0;
  private frameTween?: gsap.core.Tween;
  private transition?: gsap.core.Timeline;
  private floatTween?: gsap.core.Tween;
  private entranceTween?: gsap.core.Tween;
  private thinkingDelay?: gsap.core.Tween;
  private settleDelay?: gsap.core.Tween;
  private destroyed = false;
  private lastScene?: GenioScene;
  private lastQuestionId?: string | null;
  private lastReady = false;
  private lastMilestone?: string;
  private lastDiscoveredNeed?: string;
  private lastCelebrationAt = -Infinity;
  private reducedMotion: boolean;

  constructor(
    private stage: HTMLDivElement,
    private image: HTMLImageElement,
    reducedMotion: boolean,
    private emit: (mood: GenioMood) => void,
  ) {
    this.reducedMotion = reducedMotion;
    this.align(animations.LISTENING);
    if (!reducedMotion) {
      // Loop de flutuação suave e contínuo no stage
      this.floatTween = gsap.to(stage, {
        y: -6,
        duration: 3.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      void preload(animations.LISTENING).then((frames) => {
        if (!this.destroyed && this.requested === "LISTENING" && !this.frameTween) {
          this.play(animations.LISTENING, frames, "LISTENING");
        }
      }).catch(() => {});
    }
  }

  private align(id: string) {
    const [x, y] = alignment[id] ?? [0, 0];
    gsap.set(this.image, { x: this.image.clientWidth * x / 400, y: this.image.clientHeight * y / 275 });
  }

  resize = () => this.align(animations[this.active]);

  private play(id: string, frames: string[], mood: GenioMood) {
    this.frameTween?.kill();
    this.image.src = frames[0];
    this.align(id);
    this.active = mood;
    this.emit(mood);
    const cursor = { index: 0 };
    const loop = policy[mood].loop;
    this.frameTween = gsap.to(cursor, {
      index: frames.length,
      duration: details[id].duracao_s_sugerida,
      ease: "none",
      repeat: loop ? -1 : 0,
      onUpdate: () => {
        const src = frames[Math.min(frames.length - 1, Math.floor(cursor.index))];
        if (!this.image.src.endsWith(src)) this.image.src = src;
      },
      onComplete: loop ? undefined : () => {
        if (this.active === mood && this.requested === mood) this.transitionTo("LISTENING", true);
      },
    });
  }

  transitionTo(next: GenioMood, urgent = false) {
    if (next === this.requested) return;
    if (!urgent && !policy[this.requested].loop && policy[next].priority < policy[this.requested].priority) return;
    if (next === "CELEBRATING") {
      if (Date.now() - this.lastCelebrationAt < 5000) return;
      this.lastCelebrationAt = Date.now();
    }
    this.requested = next;
    const request = ++this.token;
    this.settleDelay?.kill();
    const id = animations[next];
    this.transition?.kill();

    if (animations[this.active] === id) {
      this.active = next;
      this.emit(next);
      if (!this.frameTween && !this.reducedMotion) {
        void preload(id).then((frames) => {
          if (!this.destroyed && request === this.token) this.play(id, frames, next);
        }).catch(() => {});
      }
      return;
    }

    if (this.reducedMotion) {
      this.frameTween?.kill();
      this.image.src = framePath(id, 1);
      this.align(id);
      this.active = next;
      this.emit(next);
      if (!policy[next].loop) {
        this.settleDelay = gsap.delayedCall(details[id].duracao_s_sugerida, () => {
          if (request === this.token) this.transitionTo("LISTENING", true);
        });
      }
      return;
    }

    // Keep the current decoded sequence visible until the new animation frames are ready,
    // avoiding flashes or empty jumps.
    preload(id).then((frames) => {
      if (this.destroyed || request !== this.token) return;
      this.play(id, frames, next);
    }).catch(() => {
      if (request !== this.token) return;
      this.requested = this.active;
    });
  }

  handle(signal: GenioSignal) {
    const newScene = signal.scene !== this.lastScene;
    this.lastScene = signal.scene;

    // 1. Apresentação inicial
    if (signal.scene === "welcome") {
      if (newScene) this.transitionTo("GREETING");
      return;
    }

    // Processamento da análise e recomendação (onde o processamento é realmente demorado)
    if (signal.scene === "analysis") {
      this.thinkingDelay?.kill();
      if (signal.ready && !this.lastReady) this.transitionTo("IDEA");
      else if (!signal.ready && newScene) this.transitionTo("THINKING");
      this.lastReady = Boolean(signal.ready);
      return;
    }

    // Conclusão do perfil / tela de resultado
    if (signal.scene === "result") {
      if (signal.milestoneId && signal.milestoneId !== this.lastMilestone && !celebrated.has(signal.milestoneId)) {
        this.lastMilestone = signal.milestoneId;
        celebrated.add(signal.milestoneId);
        this.transitionTo("CELEBRATING");
      }
      return;
    }

    // 2. Durante o formulário ("conversation"):
    // Estado padrão é LISTENING constante e calmo.
    // Não troca para THINKING e não troca para EXPLAINING a cada pergunta normal.
    // Aciona IDEA pontualmente caso seja descoberta uma necessidade importante de proteção.
    if (signal.discoveredNeed && signal.discoveredNeed !== this.lastDiscoveredNeed) {
      this.lastDiscoveredNeed = signal.discoveredNeed;
      this.transitionTo("IDEA");
      return;
    }

    // THINKING apenas em processamentos explicitamente longos (após 3.5s se a flag processing ainda persistir)
    this.thinkingDelay?.kill();
    if (signal.processing) {
      this.thinkingDelay = gsap.delayedCall(3.5, () => {
        if (!this.destroyed && this.requested === "LISTENING") {
          this.transitionTo("THINKING");
        }
      });
    } else if (this.requested === "THINKING") {
      this.transitionTo("LISTENING", true);
    } else if (this.requested === "IDLE" || newScene) {
      this.transitionTo("LISTENING");
    }
  }

  destroy() {
    this.destroyed = true;
    this.token += 1;
    this.thinkingDelay?.kill();
    this.settleDelay?.kill();
    this.transition?.kill();
    this.frameTween?.kill();
    this.floatTween?.kill();
    this.entranceTween?.kill();
    gsap.set([this.stage, this.image], { clearProps: "all" });
  }
}

export function useGenioAnimation(signal: GenioSignal, reducedMotion: boolean, enabled: boolean) {
  const { scene, questionId, processing, ready, milestoneId, discoveredNeed } = signal;
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const controllerRef = useRef<GenioController | null>(null);
  const [activeMood, setActiveMood] = useState<GenioMood>("LISTENING");

  useEffect(() => {
    if (!enabled || !stageRef.current || !imageRef.current) return;
    const controller = new GenioController(stageRef.current, imageRef.current, reducedMotion, setActiveMood);
    controllerRef.current = controller;
    window.addEventListener("resize", controller.resize);
    return () => {
      window.removeEventListener("resize", controller.resize);
      controller.destroy();
      controllerRef.current = null;
    };
  }, [enabled, reducedMotion]);

  useEffect(() => {
    controllerRef.current?.handle({ scene, questionId, processing, ready, milestoneId, discoveredNeed });
  }, [scene, questionId, processing, ready, milestoneId, discoveredNeed, enabled, reducedMotion]);

  return { stageRef, imageRef, activeMood };
}
