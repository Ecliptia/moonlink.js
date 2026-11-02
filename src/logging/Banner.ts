import { ansi } from './LogFormatter';

/** Deliberately implemented without CFonts, so the public library needs only Consola. */
export function createBanner(color = false): string {
  const art = [
    '███╗   ██╗██╗   ██╗██╗  ██╗██╗     ██╗███╗   ██╗██╗  ██╗',
    '████╗  ██║╚██╗ ██╔╝╚██╗██╔╝██║     ██║████╗  ██║██║ ██╔╝',
    '██╔██╗ ██║ ╚████╔╝  ╚███╔╝ ██║     ██║██╔██╗ ██║█████╔╝ ',
    '██║╚██╗██║  ╚██╔╝   ██╔██╗ ██║     ██║██║╚██╗██║██╔═██╗ ',
    '██║ ╚████║   ██║   ██╔╝ ██╗███████╗██║██║ ╚████║██║  ██╗',
    '╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝',
  ];
  return art.map((line, index)=>ansi(line, index < 3 ? 96 : 94, color)).join('\n') +
    '\n' + ansi('NYXLINK · AUDIO CLIENT',95,color) +
    '\n' + ansi('Lavalink + NodeLink',90,color);
}
