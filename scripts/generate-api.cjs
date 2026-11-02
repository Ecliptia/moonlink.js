const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const program = ts.createProgram([path.join(root, 'dist/index.d.ts')], { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.CommonJS, skipLibCheck: false });
const checker = program.getTypeChecker();
const source = program.getSourceFile(path.join(root, 'dist/index.d.ts'));
const symbols = checker.getExportsOfModule(checker.getSymbolAtLocation(source)).sort((a, b) => a.name.localeCompare(b.name));
const lines = ['# API pública', '', `Generada desde las declaraciones de nyxlink@${require('../package.json').version} con \`pnpm run docs:api\`.`, '', 'Las firmas son la referencia de tipos; las condiciones y límites están en [migración](migration.md), [búsqueda](search.md), [reproducción](playback.md), [almacenamiento/voz](tracks-storage-voice.md) y [capacidades](backend-compatibility.md).', '', '| Exportación | Declaración |', '| --- | --- |'];
const classes = [];
for (let symbol of symbols) {
  const name = symbol.name;
  if (symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
  const declaration = symbol.declarations?.[0];
  if (!declaration) continue;
  const relative = path.relative(root, declaration.getSourceFile().fileName).split(path.sep).join('/');
  lines.push(`| \`${name}\` | [tipos](../${relative}) |`);
  if (ts.isClassDeclaration(declaration) && ['Manager','Node','Player','Queue','Rest','Track','Logger','NodeManager','PlayerManager','SearchResult','TrackCodec','TrackResolver'].includes(name)) {
    const members = declaration.members.filter(member => !member.modifiers?.some(modifier => [ts.SyntaxKind.PrivateKeyword, ts.SyntaxKind.ProtectedKeyword].includes(modifier.kind)));
    classes.push('', `## ${name}`, '', '```ts', `class ${name} {`, ...members.map(member => '  ' + member.getText().replace(/\/\*\*[\s\S]*?\*\//g, '').trim().replace(/\s+/g, ' ')), '}', '```');
  }
}
const output = lines.concat(classes).join('\n') + '\n';
const destination = path.join(root, 'docs/api.md');
if (process.argv.includes('--check')) {
  if (fs.readFileSync(destination, 'utf8') !== output) throw new Error('docs/api.md is stale; run pnpm run docs:api after building');
} else fs.writeFileSync(destination, output);
