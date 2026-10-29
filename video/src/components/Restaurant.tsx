import { useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { progress } from "./anim";

/*
 * Ilustração vetorial do pequeno restaurante da abertura ("Cantina da Vila",
 * o mesmo nome usado na captura). As camadas — estrutura, equipamentos,
 * mercadorias e equipe — entram em sequência; `light` controla a iluminação
 * interna (1 = acesa, 0 = penumbra). Nada de destruição ou desastre.
 */

export interface RestaurantTiming {
  structure: number;
  equipment: number;
  goods: number;
  staff: number;
}

function layer(frame: number, start: number) {
  const p = progress(frame, start, 1.1);
  return { opacity: p, transform: `translateY(${(1 - p) * 14}px)` };
}

const SKIN = ["#E7B48F", "#8D5A3B", "#C98E66"];

export function Restaurant({ timing, light }: { timing: RestaurantTiming; light: number }) {
  const frame = useCurrentFrame();
  const glow = 0.25 + 0.75 * light;

  return (
    <svg viewBox="0 0 1200 760" width={1200} height={760} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="interior" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF4C9" />
          <stop offset="1" stopColor="#F2D78A" />
        </linearGradient>
        <linearGradient id="facade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1B2F78" />
          <stop offset="1" stopColor="#12225A" />
        </linearGradient>
        <radialGradient id="lamp">
          <stop offset="0" stopColor={C.sun} stopOpacity="0.9" />
          <stop offset="1" stopColor={C.sun} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="floorGlow" cx="0.5" cy="0" r="0.8">
          <stop offset="0" stopColor="#FCEE4F" stopOpacity="0.22" />
          <stop offset="1" stopColor="#FCEE4F" stopOpacity="0" />
        </radialGradient>
        <clipPath id="window">
          <rect x="220" y="340" width="540" height="300" rx="10" />
        </clipPath>
      </defs>

      {/* Estrutura física */}
      <g style={layer(frame, timing.structure)}>
        <ellipse cx="600" cy="712" rx="560" ry="40" fill="url(#floorGlow)" opacity={glow} />
        <line x1="40" y1="700" x2="1160" y2="700" stroke="rgba(198,206,255,0.25)" strokeWidth="2" />
        <rect x="180" y="150" width="840" height="550" rx="14" fill="url(#facade)" stroke="rgba(156,169,255,0.35)" strokeWidth="2" />
        <rect x="160" y="138" width="880" height="26" rx="8" fill="#22388C" />
        {/* Placa */}
        <rect x="420" y="176" width="360" height="62" rx="10" fill="#0B1640" stroke={C.sun} strokeOpacity={0.55} strokeWidth="2" />
        <text
          x="600"
          y="217"
          textAnchor="middle"
          fontFamily={FONT.display}
          fontWeight={600}
          fontSize="28"
          letterSpacing="5"
          fill={C.sun}
          opacity={0.6 + 0.4 * light}
        >
          CANTINA DA VILA
        </text>
        {/* Toldo listrado */}
        {Array.from({ length: 11 }, (_, i) => (
          <path
            key={i}
            d={`M${170 + i * 78} 258 h78 v52 a39 22 0 0 1 -78 0 z`}
            fill={i % 2 === 0 ? C.sun : "#2C46B8"}
            opacity={i % 2 === 0 ? 0.92 : 1}
          />
        ))}
        {/* Vitrine */}
        <rect x="214" y="334" width="552" height="312" rx="14" fill="#0B1640" />
        <rect x="220" y="340" width="540" height="300" rx="10" fill="url(#interior)" />
        {/* Porta */}
        <rect x="820" y="370" width="150" height="330" rx="10" fill="#0B1640" />
        <rect x="834" y="386" width="122" height="150" rx="8" fill="url(#interior)" opacity={0.85} />
        <circle cx="948" cy="560" r="6" fill={C.sun} />
        <rect x="852" y="436" width="86" height="34" rx="6" fill={C.sun} />
        <text x="895" y="459" textAnchor="middle" fontFamily={FONT.body} fontWeight={600} fontSize="16" fill={C.brand900}>
          ABERTO
        </text>
      </g>

      {/* Interior da vitrine */}
      <g clipPath="url(#window)">
        {/* Mercadorias: prateleiras com potes e caixas */}
        <g style={layer(frame, timing.goods)}>
          {[388, 446].map((y) => (
            <g key={y}>
              <rect x="420" y={y} width="200" height="8" rx="3" fill="#B9893F" />
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const colors = [C.coral, C.mint, "#5A6FFF", "#F2994A", C.coral, "#6AB04C"];
                return i % 2 === 0 ? (
                  <rect key={i} x={428 + i * 32} y={y - 30} width="24" height="30" rx="4" fill={colors[(i + y) % 6]} />
                ) : (
                  <g key={i}>
                    <rect x={430 + i * 32} y={y - 26} width="20" height="26" rx="8" fill={colors[(i + 2) % 6]} opacity={0.9} />
                    <rect x={433 + i * 32} y={y - 30} width="14" height="6" rx="2" fill="#7A5A2A" />
                  </g>
                );
              })}
            </g>
          ))}
        </g>

        {/* Equipe */}
        <g style={layer(frame, timing.staff)}>
          {/* Cozinheira */}
          <rect x="452" y="500" width="76" height="110" rx="34" fill="#FFFFFF" />
          <circle cx="490" cy="478" r="26" fill={SKIN[1]} />
          <ellipse cx="490" cy="446" rx="30" ry="16" fill="#FFFFFF" />
          <rect x="470" y="446" width="40" height="14" fill="#FFFFFF" />
          {/* Atendente */}
          <rect x="552" y="508" width="70" height="104" rx="32" fill={C.coral} />
          <rect x="570" y="530" width="34" height="80" rx="8" fill="#FFFFFF" opacity={0.9} />
          <circle cx="587" cy="486" r="24" fill={SKIN[0]} />
          <path d="M563 482 a24 24 0 0 1 48 -6 q-14 -10 -30 -6 q-12 4 -18 12z" fill="#3B2A1E" />
        </g>

        {/* Equipamentos */}
        <g style={layer(frame, timing.equipment)}>
          {/* Forno */}
          <rect x="246" y="452" width="132" height="188" rx="10" fill="#33415F" />
          <rect x="262" y="484" width="100" height="70" rx="8" fill="#1C2438" />
          <rect x="268" y="490" width="88" height="58" rx="6" fill="#F2994A" opacity={0.35 + 0.65 * light} />
          {[278, 304, 330].map((x) => (
            <circle key={x} cx={x} cy="470" r="6" fill="#C6CEFF" />
          ))}
          <rect x="262" y="570" width="100" height="10" rx="4" fill="#C6CEFF" opacity={0.6} />
          {/* Geladeira */}
          <rect x="646" y="392" width="100" height="248" rx="10" fill="#E5E8FF" />
          <line x1="646" y1="486" x2="746" y2="486" stroke="#9CA9FF" strokeWidth="3" />
          <rect x="730" y="420" width="6" height="40" rx="3" fill="#9CA9FF" />
          <rect x="730" y="510" width="6" height="60" rx="3" fill="#9CA9FF" />
          {/* Balcão */}
          <rect x="420" y="586" width="226" height="54" rx="6" fill="#B9893F" />
          <rect x="420" y="586" width="226" height="10" rx="4" fill="#D9A95A" />
          {/* Máquina de café */}
          <rect x="430" y="548" width="44" height="40" rx="6" fill="#33415F" />
          <rect x="440" y="572" width="14" height="14" rx="3" fill="#FFFFFF" />
        </g>

        {/* Luminárias e penumbra */}
        <g style={layer(frame, timing.structure + 0.4)}>
          {[330, 500, 670].map((x) => (
            <g key={x}>
              <line x1={x} y1="340" x2={x} y2="372" stroke="#33415F" strokeWidth="3" />
              <path d={`M${x - 20} 386 q20 -26 40 0 z`} fill="#33415F" />
              <circle cx={x} cy="400" r="90" fill="url(#lamp)" opacity={0.5 * glow} />
              <circle cx={x} cy="388" r="7" fill={C.sun} opacity={glow} />
            </g>
          ))}
        </g>
        <rect x="220" y="340" width="540" height="300" fill="#06102E" opacity={0.62 * (1 - light)} />
      </g>

      {/* Mercadorias do lado de fora: caixotes e plantas */}
      <g style={layer(frame, timing.goods + 0.25)}>
        <rect x="992" y="640" width="96" height="60" rx="6" fill="#B9893F" />
        <rect x="992" y="640" width="96" height="10" rx="4" fill="#D9A95A" />
        {[1006, 1030, 1054, 1078].map((x, i) => (
          <circle key={x} cx={x} cy="634" r="12" fill={[C.coral, "#6AB04C", "#F2994A", C.coral][i]} />
        ))}
        <rect x="112" y="636" width="56" height="64" rx="8" fill="#2C46B8" />
        <path d="M140 640 q-30 -40 -8 -78 q8 30 8 78 q0 -50 22 -70 q8 40 -22 70" fill="#6AB04C" />
      </g>
    </svg>
  );
}
