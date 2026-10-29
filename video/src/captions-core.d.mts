export declare function captionBlocks(
  lines: { id: string; start: number; text: string }[],
  durations: Record<string, number>,
): { start: number; end: number; text: string }[];
