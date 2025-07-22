import assert from "assert";
import GlyphHangerSubset from "../src/GlyphHangerSubset.js";

describe( "GlyphHangerSubset", function() {
	it( "getFilenameFromTTFPath", function() {
		var subset = new GlyphHangerSubset();
		assert.equal( subset.getFilenameFromTTFPath("roboto.ttf"), "roboto-subset.ttf" );
		assert.equal( subset.getFilenameFromTTFPath("roboto.ttf", "woff"), "roboto-subset.woff" );
		assert.equal( subset.getFilenameFromTTFPath("roboto.ttf", "woff", true), "roboto-subset.zopfli.woff" );
		assert.equal( subset.getFilenameFromTTFPath("roboto.ttf", "woff2"), "roboto-subset.woff2" );
		subset.close();
	});

	it( "getFilenames (no formats set)", function() {
		var subset = new GlyphHangerSubset();
		assert.deepEqual( subset.getFilenames("roboto.ttf"), ["roboto-subset.ttf", "roboto-subset.zopfli.woff", "roboto-subset.woff2"] );
		subset.close();
	});

	it( "getFilenames (woff, woff2)", function() {
		var subset = new GlyphHangerSubset();
		subset.setFormats( "woff,woff2" );

		assert.deepEqual( subset.getFilenames("roboto.ttf"), ["roboto-subset.woff", "roboto-subset.woff2"] );
		subset.close();
	});

	it( "getFilenames (all, zopfli off)", function() {
		var subset = new GlyphHangerSubset();
		subset.setFormats( "ttf,woff,woff2" );

		assert.deepEqual( subset.getFilenames("roboto.ttf"), ["roboto-subset.ttf", "roboto-subset.woff", "roboto-subset.woff2"] );
		subset.close();
	});

	it( "getFilenames (all, zopfli on)", function() {
		var subset = new GlyphHangerSubset();
		subset.setFormats( "ttf,woff-zopfli,woff2" );

		assert.deepEqual( subset.getFilenames("roboto.ttf"), ["roboto-subset.ttf", "roboto-subset.zopfli.woff", "roboto-subset.woff2"] );
		subset.close();
	});

	it( "getFilenames (just woff)", function() {
		var subset = new GlyphHangerSubset();
		subset.setFormats( "woff" );

		assert.deepEqual( subset.getFilenames("roboto.ttf"), ["roboto-subset.woff"] );
		subset.close();
	});

	it( "getFilenames (just woff2)", function() {
		var subset = new GlyphHangerSubset();
		subset.setFormats( "woff2" );

		assert.deepEqual( subset.getFilenames("roboto.ttf"), ["roboto-subset.woff2"] );
		subset.close();
	});
});