import type { Cut } from "../timeline";

export type SceneProps = {
  cut: Cut;
  /** Duração da cena nesta versão. */
  seconds: number;
};

/** Escolhe o valor da versão atual. */
export const pick = <T,>(cut: Cut, values: Record<Cut, T>) => values[cut];
