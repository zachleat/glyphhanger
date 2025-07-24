import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ['src/GlyphHangerClientScript.js'],
  bundle: true,
  format: 'iife',
  globalName: 'GlyphHanger',
  outfile: 'generated/glyphhanger-script.umd.js',
  platform: 'browser',
  target: 'es2015',
  minify: false,
  sourcemap: false,
});
