import Image from "next/image";

import recepcao from "@/public/geniobb/recepcao-transparente.webp";
import apresentacao from "@/public/geniobb/apresentacao-recorte.webp";
import conclusao from "@/public/geniobb/conclusao-recorte.webp";
import esperandoResposta from "@/public/geniobb/esperandoresposta-recorte.webp";
import pensativo from "@/public/geniobb/pensativo-transparente.webp";
import ideia from "@/public/geniobb/ideia-transparente.webp";
import explicando from "@/public/geniobb/conclusaodaideia-transparente.webp";
import { cn } from "@/lib/utils";

export type CharacterPose = "recepcao" | "apresentacao" | "esperando" | "pensativo" | "ideia" | "explicando" | "conclusao";

const IMAGES = { recepcao, apresentacao, esperando: esperandoResposta, pensativo, ideia, explicando, conclusao };

/** Poses do guia virtual em enquadramento horizontal. */
export function CharacterArtwork({ pose, className, sizes = "(max-width: 1024px) 160px, 320px" }: { pose: CharacterPose; className?: string; sizes?: string }) {
  return <Image src={IMAGES[pose]} alt="" sizes={sizes} className={cn("h-auto w-full", className)} />;
}
