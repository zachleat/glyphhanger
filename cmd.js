#!/usr/bin/env node
import minimist from "minimist";
import pc from "picocolors";
import {text} from "stream/consumers";
import GlyphHanger from "./src/GlyphHanger.js";
import GlyphHangerWhitelist from "./src/GlyphHangerWhitelist.js";
import GlyphHangerSubset from "./src/GlyphHangerSubset.js";
import GlyphHangerFontFace from "./src/GlyphHangerFontFace.js";
import MultipleSpiderPigs from "./src/MultipleUrlSpiderPig.js";
import createDebug from "debug";
const argv = minimist(process.argv.slice(2));
const debug = createDebug("glyphhanger:cli");

var whitelist = new GlyphHangerWhitelist(argv.w || argv.whitelist, {
	US_ASCII: argv.US_ASCII,
	LATIN: argv.LATIN
});

var gh = new GlyphHanger();
gh.setUnicodesOutput( argv.string );
gh.setWhitelist( whitelist );
gh.setSubset( argv.subset );
gh.setJson( argv.json );
gh.setClassName( argv.classname );
gh.setFamilies( argv.family );
gh.setTimeout( argv.timeout );
gh.setVisibilityCheck( argv.onlyVisible );
gh.setCSSSelector( argv.cssSelector );
if( argv.jsdom ) {
	gh.setEnvironmentJSDOM();
}

if( argv.subset ) {
	var subset = new GlyphHangerSubset();
	subset.setOutputDirectory(argv.output);

	if( argv.formats ) {
		subset.setFormats( argv.formats );
	}
	if( argv.subset ) {
		subset.setFontFilesGlob( argv.subset );
	}
}

var fontface = new GlyphHangerFontFace();
fontface.setFamilies( argv.family );
fontface.setCSSOutput( argv.css );

if( argv.subset ) {
	fontface.setSubset( subset );
}

// glyphhanger --version
// glyphhanger --help
// glyphhanger
// glyphhanger http://localhost/
// glyphhanger http://localhost/ --timeout									(change timeout, in ms, default is 30000)
// glyphhanger http://localhost/ http://localhost2/					(multiple urls are welcome)
// glyphhanger http://localhost/ --spider 									(limit default 10)
// glyphhanger http://localhost/ --spider-limit							(limit default 10)
// glyphhanger http://localhost/ --spider-limit=0 					(no limit)
// glyphhanger http://localhost/ --spider-limit=1						(limit 1)
// glyphhanger --whitelist=ABCD															(convert characters to unicode range)
// glyphhanger --US_ASCII																		(convert characters to unicode range)
// glyphhanger --US_ASCII --whitelist=ABCD									(convert characters to unicode range)
// glyphhanger --LATIN
// glyphhanger --subset=*.ttf																(file format conversion)
// glyphhanger --subset=*.ttf --whitelist=ABCD							(reduce to whitelist characters)
// glyphhanger --subset=*.ttf --US_ASCII										(reduce to US_ASCII characters)
// glyphhanger --subset=*.ttf --US_ASCII --whitelist=ABCD		(reduce to US_ASCII union with whitelist)
// glyphhanger --family='My Serif'													(outputs results for specific family)
// glyphhanger --family='My Serif' --css										(outputs results for specific family with a font-face block)
// glyphhanger --subset=*.ttf --family='My Serif'						(subset group of fonts to results for specific family)
// glyphhanger --subset=*.ttf --family='My Serif' -css			(subset group of fonts to results for specific family and a font-face block)
// glyphhanger --subset=*.ttf --output=dist/								(change the output directory for subset files)

async function main() {
	let standardInput = process.stdin.isTTY ? '' : (await text(process.stdin)).trim();
	gh.setStandardInput(standardInput);

	if( argv.version ) {
		var pkg = (await import( "./package.json", {with: {type: 'json'}} )).default;
		console.log( pkg.version );
	} else if( argv.help ) {
		gh.outputHelp();
	} else if( argv._ && argv._.length || standardInput ) {
		// Spider
		try {
			if( argv.spider || argv[ 'spider-limit' ] || argv[ 'spider-limit' ] === 0 ) {
				let sp = new MultipleSpiderPigs();
				sp.setLimit(argv[ 'spider-limit' ]);
				await sp.fetchUrls( argv._ );

				let urls = sp.getUrlsWithLimit();
				await sp.finish();
				debug( "Urls (after limit): %o", urls );

				await gh.fetchUrls( urls );
			} else {
				await gh.fetchUrls( argv._ );
			}
		} catch(e) {
			console.log(pc.red("GlyphHanger Fetch Error: "), e);
			process.exitCode = 1;
		}

		gh.output();
		try {
			fontface.setUnicodeRange( gh.getUnicodeRange() );
			fontface.writeCSSFiles();
		} catch(e) {
			console.log(pc.red("GlyphHangerFontFace Error: "), e);
			process.exitCode = 1;
		}

		try {
			if( argv.subset ) {
				await subset.subsetAll( gh.getUnicodeRange() );
			}
		} catch(e) {
			console.log(pc.red("GlyphHangerSubset Error: "), e);
			process.exitCode = 1;
		}

		try {
			fontface.output();
		} catch(e) {
			console.log(pc.red("GlyphHangerFontFace Error: "), e);
			process.exitCode = 1;
		}
	} else { // not using URLs
		if( argv.subset ) {
			gh.output();

			try {
				// --subset with or without --whitelist
				await subset.subsetAll( !whitelist.isEmpty() ? whitelist.getWhitelistAsUnicodes() : whitelist.getUniversalRangeAsUnicodes() );
			} catch(e) {
				process.exitCode = 1;
				console.log(pc.red("GlyphHangerSubset Error: "), e);
			}

			try {
				if(!whitelist.isEmpty()) {
					fontface.setUnicodeRange( whitelist.getWhitelistAsUnicodes());
				}
				fontface.writeCSSFiles();
				fontface.output();
			} catch(e) {
				process.exitCode = 1;
				console.log(pc.red("GlyphHangerFontFace Error: "), e);
			}
		} else if( !whitelist.isEmpty() ) {
			// not subsetting, just output the code points (can convert whitelist string to code points)
			gh.outputUnicodes();

			try {
				fontface.setUnicodeRange( whitelist.getWhitelistAsUnicodes());
				fontface.writeCSSFiles();
				fontface.output();
			} catch(e) {
				process.exitCode = 1;
				console.log(pc.red("GlyphHangerFontFace Error: "), e);
			}
		} else {
			gh.outputHelp();
		}

	}
}

(async () => {
	try {
		await main();
	} finally {
		if (subset) {
			subset.close();
		}
	}
})()
