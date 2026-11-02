"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBanner = createBanner;
const LogFormatter_1 = require("./LogFormatter");
function createBanner(color = false) {
    const art = [
        '███╗   ██╗██╗   ██╗██╗  ██╗██╗     ██╗███╗   ██╗██╗  ██╗',
        '████╗  ██║╚██╗ ██╔╝╚██╗██╔╝██║     ██║████╗  ██║██║ ██╔╝',
        '██╔██╗ ██║ ╚████╔╝  ╚███╔╝ ██║     ██║██╔██╗ ██║█████╔╝ ',
        '██║╚██╗██║  ╚██╔╝   ██╔██╗ ██║     ██║██║╚██╗██║██╔═██╗ ',
        '██║ ╚████║   ██║   ██╔╝ ██╗███████╗██║██║ ╚████║██║  ██╗',
        '╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝',
    ];
    return art.map((line, index) => (0, LogFormatter_1.ansi)(line, index < 3 ? 96 : 94, color)).join('\n') +
        '\n' + (0, LogFormatter_1.ansi)('NYXLINK · AUDIO CLIENT', 95, color) +
        '\n' + (0, LogFormatter_1.ansi)('Lavalink + NodeLink', 90, color);
}
//# sourceMappingURL=Banner.js.map