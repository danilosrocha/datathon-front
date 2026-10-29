"use client";

import { createContext, useContext, type ReactNode } from "react";
import { motion, type TargetAndTransition } from "motion/react";
import {
  BriefcaseBusiness, Check, CheckCheck, Coffee, Flame, Headset, KeyRound,
  Laptop, LockKeyhole, Monitor, Package, Scissors, ShieldCheck, Store,
  UserRound, UsersRound, UtensilsCrossed, Wrench, Zap,
} from "lucide-react";

export type SceneKind = "property" | "electrical" | "theft" | "equipment" | "liability" | "activity" | "assistance" | "support";
const PlayingContext = createContext(false);

// Every scene has a complete static composition. Loops only run while its card is visible.
function Loop({ children, frames, className, duration = 5, delay = 0 }: {
  children?: ReactNode; frames: TargetAndTransition; className?: string; duration?: number; delay?: number;
}) {
  const playing = useContext(PlayingContext);
  return (
    <motion.div
      className={className}
      data-scene-motion=""
      initial={false}
      animate={playing ? frames : { x: 0, y: 0, rotate: 0, scale: 1, scaleX: 1, scaleY: 1, opacity: 1 }}
      transition={playing ? { duration, delay, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
    >
      {children}
    </motion.div>
  );
}

function PropertyScene() {
  return (
    <div className="store-scene">
      <div className="store-ground" />
      <Loop className="protection-layer layer-back" frames={{ scale: [0.95, 1.04, 0.95], opacity: [0.35, 0.7, 0.35] }} duration={7} />
      <Loop className="protection-layer layer-front" frames={{ scale: [1, 1.05, 1], opacity: [0.65, 1, 0.65] }} duration={7} delay={0.4} />
      <Loop className="store-building" frames={{ y: [0, -5, 0] }} duration={7}>
        <div className="store-sign">Seu negócio</div>
        <div className="store-awning">{Array.from({ length: 7 }, (_, i) => <i key={i} />)}</div>
        <div className="store-front">
          <div className="store-window"><Coffee size={30} strokeWidth={1.5} /><span /></div>
          <div className="store-door"><i /></div>
        </div>
      </Loop>
      <Loop className="scene-token store-risk" frames={{ y: [0, -8, 0], rotate: [-6, 3, -6] }} duration={6}><Flame size={25} /></Loop>
      <Loop className="scene-token store-shield" frames={{ y: [0, -6, 0], scale: [1, 1.06, 1] }} duration={6} delay={0.6}><ShieldCheck size={33} strokeWidth={1.7} /></Loop>
    </div>
  );
}

function ElectricalScene() {
  return (
    <div className="electric-scene">
      <div className="electric-wire" />
      <div className="electric-wave">
        {[18, 32, 52, 30, 66, 40, 22, 50, 32, 18].map((height, index) => (
          <Loop key={index} className="electric-bar" frames={{ scaleY: [0.45, 1, 0.45] }} duration={2.8} delay={index * 0.12}>
            <span style={{ height }} />
          </Loop>
        ))}
      </div>
      <Loop className="electric-switch" frames={{ y: [0, -5, 0] }} duration={5.5}>
        <div className="electric-switch-top"><span /><span /></div>
        <Zap size={48} strokeWidth={1.4} />
        <div className="electric-switch-bottom"><ShieldCheck size={16} /> Cuidado com a energia</div>
      </Loop>
      <Loop className="scene-token electric-check" frames={{ scale: [0.9, 1.06, 0.9] }} duration={4}><Check size={24} /></Loop>
    </div>
  );
}

function TheftScene() {
  return (
    <div className="theft-scene">
      <div className="security-boundary" />
      <Loop className="goods goods-back" frames={{ y: [0, -5, 0], rotate: [-8, -4, -8] }} duration={6}><Package size={50} strokeWidth={1.3} /></Loop>
      <Loop className="goods goods-front" frames={{ y: [0, -4, 0] }} duration={6} delay={0.5}><Package size={60} strokeWidth={1.3} /></Loop>
      <Loop className="scene-token goods-lock" frames={{ y: [0, -6, 0], rotate: [4, -3, 4] }} duration={5}><LockKeyhole size={30} strokeWidth={1.6} /></Loop>
      <Loop className="security-scan" frames={{ y: [-50, 65, -50], opacity: [0.15, 0.7, 0.15] }} duration={6} />
    </div>
  );
}

function EquipmentScene() {
  return (
    <div className="equipment-scene">
      <Loop className="equipment-monitor" frames={{ y: [0, -4, 0] }} duration={6}>
        <Monitor size={130} strokeWidth={0.8} />
        <Loop className="equipment-check" frames={{ scale: [0.9, 1.08, 0.9], opacity: [0.65, 1, 0.65] }} duration={4}><ShieldCheck size={35} strokeWidth={1.5} /></Loop>
      </Loop>
      <Loop className="equipment-laptop" frames={{ y: [0, -7, 0] }} duration={6} delay={0.7}><Laptop size={76} strokeWidth={1.1} /></Loop>
      <div className="equipment-link" />
      <Loop className="scene-token equipment-badge" frames={{ scale: [1, 1.08, 1] }} duration={4} delay={0.8}><Check size={20} /></Loop>
    </div>
  );
}

function LiabilityScene() {
  return (
    <div className="liability-scene">
      <div className="people-orbit" />
      <Loop className="person person-one" frames={{ y: [0, -5, 0] }} duration={5}><UserRound size={28} strokeWidth={1.5} /></Loop>
      <Loop className="person person-two" frames={{ y: [0, 5, 0] }} duration={5} delay={0.5}><UsersRound size={30} strokeWidth={1.5} /></Loop>
      <Loop className="person person-three" frames={{ y: [0, -4, 0] }} duration={5} delay={1}><UserRound size={27} strokeWidth={1.5} /></Loop>
      <Loop className="scene-token people-shield" frames={{ scale: [1, 1.07, 1] }} duration={5}><ShieldCheck size={44} strokeWidth={1.3} /></Loop>
    </div>
  );
}

function ActivityScene() {
  return (
    <div className="activity-scene">
      {[{ Icon: UtensilsCrossed, label: "Alimentação" }, { Icon: Store, label: "Comércio" }, { Icon: BriefcaseBusiness, label: "Serviços" }, { Icon: Scissors, label: "Seu jeito" }].map(({ Icon, label }, index) => (
        <Loop key={label} className={`activity-tile activity-tile-${index}`} frames={{ y: [0, -9, 0], rotate: [0, index % 2 ? 3 : -3, 0] }} duration={6} delay={index * 0.5}>
          <Icon size={30} strokeWidth={1.4} /><span>{label}</span>
        </Loop>
      ))}
      <Loop className="activity-selection" frames={{ x: [0, 78, 78, 0, 0], opacity: [1, 0.5, 1, 0.5, 1] }} duration={9}><Check size={17} /></Loop>
    </div>
  );
}

function AssistanceScene() {
  return (
    <div className="assistance-scene">
      <div className="tool-orbit" />
      <Loop className="tool tool-key" frames={{ y: [0, -6, 0], rotate: [-12, -4, -12] }} duration={6}><KeyRound size={32} strokeWidth={1.5} /></Loop>
      <Loop className="tool tool-wrench" frames={{ y: [0, -5, 0], rotate: [8, -4, 8] }} duration={6} delay={0.6}><Wrench size={48} strokeWidth={1.4} /></Loop>
      <Loop className="tool tool-zap" frames={{ y: [0, 5, 0] }} duration={6} delay={1}><Zap size={26} strokeWidth={1.5} /></Loop>
    </div>
  );
}

function SupportScene() {
  return (
    <div className="support-scene">
      <Loop className="support-bubble support-question" frames={{ y: [0, -4, 0] }} duration={6}><span>O que faz sentido para mim?</span></Loop>
      <Loop className="support-bubble support-answer" frames={{ y: [0, -5, 0] }} duration={6} delay={0.6}><Headset size={22} /><span>Vamos entender juntos.</span><CheckCheck size={15} /></Loop>
      <div className="support-typing">{[0, 1, 2].map(i => <Loop key={i} frames={{ y: [0, -3, 0], opacity: [0.35, 1, 0.35] }} duration={1.8} delay={i * 0.2}><span /></Loop>)}</div>
    </div>
  );
}

const SCENES = { property: PropertyScene, electrical: ElectricalScene, theft: TheftScene, equipment: EquipmentScene, liability: LiabilityScene, activity: ActivityScene, assistance: AssistanceScene, support: SupportScene };

export function ProtectionScene({ kind, playing }: { kind: SceneKind; playing: boolean }) {
  const Scene = SCENES[kind];
  return (
    <PlayingContext value={playing}>
      <div className="protection-scene" aria-hidden="true"><Scene /></div>
    </PlayingContext>
  );
}
