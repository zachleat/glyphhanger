import assert from "assert";
import path from "path";
import childProcess from "child_process";
import {fileURLToPath} from "url";

describe( "CLI (pseudos)", function() {
	it( "works with pseudo elements", function () {
		this.timeout( 10000 );
			let output = childProcess.execSync(`node cmd.js test/pseudos/test.html --json`, {
			cwd: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
		});

		let json = JSON.parse(output.toString().trim());
		assert.equal( json["My Icon Font"], "U+E6AC" );
		assert.equal( json["My Second Icon Font"], "U+27" );
	});
});