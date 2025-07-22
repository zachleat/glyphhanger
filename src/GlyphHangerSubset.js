import shell from "shelljs";
import {GlyphtContext} from "@glypht/core/subsetting.js";
import {WoffCompressionContext} from "@glypht/core/compression.js";
import CharacterSet from 'characterset';
import parsePath from "parse-filepath";
import fs from "fs/promises";
import {filesize} from "filesize";
import path from "path";
import pc from "picocolors";
import {globSync} from "tinyglobby";
import GlyphHangerFormat from "./GlyphHangerFormat.js";
import createDebug from "debug";
const debug = createDebug("glyphhanger:subset");

class GlyphHangerSubset {
	constructor() {
		this.formats = new GlyphHangerFormat();
		this.ctx = new GlyphtContext();
		this.woffCtx = new WoffCompressionContext();
	}

	setOutputDirectory( outputDir ) {
		if( outputDir ) {
			this.outputDirectory = outputDir;
		}
	}

	getOutputDirectory() {
		return this.outputDirectory;
	}

	setFontFilesGlob( ttfFilesGlob ) {
		this.fontPaths = globSync( ttfFilesGlob );
	}

	setFontFiles( ttfFontFiles ) {
		this.fontPaths = ttfFontFiles;
	}

	setFormats( formatsString ) {
		if( formatsString ) {
			this.formats.setFormats( formatsString );
		}
	}

	getPath( filePath, dir ) {
		if( dir ) {
			return path.join(dir, filePath);
		} else {
			return filePath;
		}
	}

	getPaths() {
		return this.fontPaths;
	}

	getSrcsObject( ttfPath, dir ) {
		var srcs = {};
		if( this.formats.hasFormat( "woff2" ) ) {
			srcs.woff2 = this.getPath(this.getFilenameFromTTFPath(ttfPath, "woff2"), dir);
		}
		if( this.formats.hasFormat( "woff" ) ) {
			srcs.woff = this.getPath(this.getFilenameFromTTFPath(ttfPath, "woff"), dir);
		}
		if( this.formats.hasFormat( "ttf" ) ) {
			srcs.truetype = this.getPath(this.getFilenameFromTTFPath(ttfPath), dir);
		}
		return srcs;
	}

	getFilenames( ttfPath, dir ) {
		var files = [];
		if( this.formats.hasFormat( "ttf" ) ) {
			files.push(this.getPath(this.getFilenameFromTTFPath(ttfPath), dir));
		}
		if( this.formats.hasFormat( "woff" ) ) {
			files.push(this.getPath(this.getFilenameFromTTFPath(ttfPath, "woff"), dir));
		}
		if( this.formats.hasFormat( "woff2" ) ) {
			files.push(this.getPath(this.getFilenameFromTTFPath(ttfPath, "woff2"), dir));
		}
		return files;
	}

	getFilenameFromTTFPath( ttfPath, format ) {
		var fontPath = parsePath( ttfPath );
		var outputFilename = fontPath.name + "-subset" + ( format ? "." + format : fontPath.ext );
		return outputFilename;
	}

	async subsetAll( unicodes ) {
		return Promise.all(this.fontPaths.map( fontPath => {
			return this.subset( fontPath, unicodes );
		}));
	}

	logSubsetInfo( inputFile, inputSize, outputFile, outputSize ) {
		return `Subsetting ${inputFile} to ${outputFile} (was ${pc.red( filesize( inputSize, { standard: 'iec' } ) )}, now ${pc.green( filesize( outputSize, { standard: 'iec' } ) )})`;
	}

	async subset( inputFile, unicodes ) {
		let ranges = CharacterSet.parseUnicodeRange(unicodes).toRange();
		let outputDir = this.outputDirectory || parsePath( inputFile ).dir;

		let inputData = new Uint8Array(await fs.readFile(inputFile));
		let inputSize = inputData.length; // cache because this arraybuffer will be transferred
		let fonts = await this.ctx.loadFonts([inputData], true);
		if( fonts.length > 1 ) {
			throw new Error(`${inputFile} is a font collection`);
		}
		let font = fonts[0];
		let features = {};
		// Keep all layout features
		for (let feature of font.features) {
			features[feature.tag] = true;
		}
		let subsettedFont = await font.subset({features, unicodeRanges: {named: [], custom: ranges}, axisValues: []});

		let promises = [];

		if (this.formats.hasFormat('ttf')) {
			let outputFilename = path.join( outputDir, this.getFilenameFromTTFPath( inputFile, 'ttf' ) );
			promises.push(fs.writeFile(outputFilename, subsettedFont.data).then(() => {
				return this.logSubsetInfo(inputFile, inputSize, outputFilename, subsettedFont.data.length );
			}));
		}

		if (this.formats.hasFormat('woff')) {
			let outputFilename = path.join( outputDir, this.getFilenameFromTTFPath( inputFile, 'woff' ) );
			promises.push(this.woffCtx.compressFromTTF(subsettedFont.data, 'woff', 15).then(async compressedData => {
				await fs.writeFile(outputFilename, compressedData);
				return this.logSubsetInfo(inputFile, inputSize, outputFilename, compressedData.length );
			}));
		}

		if (this.formats.hasFormat('woff2')) {
			let outputFilename = path.join( outputDir, this.getFilenameFromTTFPath( inputFile, 'woff2' ) );
			promises.push(this.woffCtx.compressFromTTF(subsettedFont.data, 'woff2', 11).then(async compressedData => {
				await fs.writeFile(outputFilename, compressedData);
				return this.logSubsetInfo(inputFile, inputSize, outputFilename, compressedData.length );
			}));
		}

		// Glypht can compress on multiple cores at once, so this provides a speedup
		for (const message of await Promise.all(promises)) {
			console.log(message);
		}
	}

	close() {
		this.ctx.destroy();
		this.woffCtx.destroy();
	}
}

export default GlyphHangerSubset;
