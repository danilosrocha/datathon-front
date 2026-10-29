import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";

/*
 * Identidade do produto (frontend/app/globals.css e frontend/DESIGN.md):
 * azul-violeta de marca, amarelo de destaque, Poppins nos títulos e Inter no
 * corpo. Nos momentos cinematográficos o fundo é o azul institucional profundo.
 */

const poppins = loadPoppins("normal", { weights: ["500", "600", "700"], subsets: ["latin", "latin-ext"] });
const inter = loadInter("normal", { weights: ["400", "500", "600"], subsets: ["latin", "latin-ext"] });

export const FONT = {
  display: poppins.fontFamily,
  body: inter.fontFamily,
};

export const C = {
  night: "#040A1E",
  deep: "#071338",
  navy: "#001F5C",
  brand900: "#003087",
  brand600: "#465EFF",
  brand500: "#5A6FFF",
  brand300: "#9CA9FF",
  brand200: "#C6CEFF",
  brand100: "#E5E8FF",
  sun: "#FCEE4F",
  sunBright: "#FCFC30",
  mint: "#6AEDD3",
  coral: "#FF6F68",
  ink800: "#212529",
  ink600: "#4C4C4C",
  white: "#FFFFFF",
  muted: "rgba(229, 232, 255, 0.72)",
};
