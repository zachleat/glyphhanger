# glyphhanger

Your web font utility belt. It can subset web fonts. It can show you what unicode-ranges are used on a web site (optionally per font-family). It can also subset web fonts automatically using the unicode-ranges it found. It makes julienne fries.

## Installation

Available on [npm](https://www.npmjs.com/package/glyphhanger).

```sh
npm install -g glyphhanger
```

### Prerequisite: `pyftsubset`

See [https://github.com/fonttools/fonttools](https://github.com/fonttools/fonttools). You will need `python` too (use `brew install python` if necessary). 

```sh
# Use Homebrew (you may also need `brotli` here)
brew install fonttools brotli

# Or use pip3
pip3 install fonttools brotli
```

If you want to read an in-depth tutorial on the installation steps above, please read [How I set up Glyphhanger on macOS for optimizing and converting font files for the Web](https://www.sarasoueidan.com/blog/glyphhanger/) by Sara Soueidan.

## Usage

_Related: operate on existing `unicode-range` values with [Unicode Range Interchange](https://www.zachleat.com/unicode-range-interchange/) ([read the blog post](https://www.zachleat.com/web/unicode-range-interchange/))._

### Find the glyphs in a local file or url

```sh
# local file
glyphhanger ./test.html
glyphhanger ./test.txt

# output characters instead of Unicode code points
glyphhanger ./test.html --string

# remote URL
glyphhanger http://example.com

# multiple URLs, optionally using HTTPS
glyphhanger https://google.com https://www.zachleat.com

# show results for each font-family on the page
glyphhanger ./test.html --json

# show results only for one or more font-family names
glyphhanger ./test.html --family='Open Sans, Roboto'

# Show version
glyphhanger --version

# See more usage
glyphhanger --help
```

### Debug Mode

Replaces `--verbose` in `v3.0.0`.

```sh
> DEBUG=glyphhanger* glyphhanger http://example.com
```

### Subset font files automatically

Use `--subset="*.ttf"` to select some font files for subsetting. Note that you can also [subset yourself manually with `pyftsubset`](docs/manual-subset.md) (but glyphhanger is easier).

_Note that the `DEBUG` output documented above will log the specific `pyftsubset` command that `glyphhanger` used. Read more [about `pyftsubset` defaults](https://github.com/filamentgroup/glyphhanger/issues/49)._

#### Just make optimized TTF/WOFF/WOFF2 files

```sh
> glyphhanger --subset="*.ttf"

Subsetting LatoLatin-Regular.ttf to LatoLatin-Regular-subset.ttf (was 145.06 KB, now 70.25 KB)
Subsetting LatoLatin-Regular.ttf to LatoLatin-Regular-subset.woff2 (was 145.06 KB, now 28.73 KB)
```

#### Subset to specific characters only (no URLs)

```sh
> glyphhanger --whitelist=ABCD --subset="*.ttf"

Subsetting LatoLatin-Regular.ttf to LatoLatin-Regular-subset.ttf (was 145.06 KB, now 4.42 KB)
Subsetting LatoLatin-Regular.ttf to LatoLatin-Regular-subset.woff2 (was 145.06 KB, now 2.24 KB)
```

#### Subset to the glyphs at a URL

```sh
> glyphhanger ./test.html --subset="*.ttf"

Subsetting LatoLatin-Regular.ttf to LatoLatin-Regular-subset.ttf (was 145.06 KB, now 24 KB)
Subsetting LatoLatin-Regular.ttf to LatoLatin-Regular-subset.woff2 (was 145.06 KB, now 11.37 KB)
```

#### Subset to the glyphs at a URL only using content that matches a specific font-family

```sh
> glyphhanger ./test.html --subset="*.ttf" --family='Lato,sans-serif'

Subsetting LatoLatin-Regular.ttf to LatoLatin-Regular-subset.ttf (was 145.06 KB, now 24 KB)
Subsetting LatoLatin-Regular.ttf to LatoLatin-Regular-subset.woff2 (was 145.06 KB, now 11.37 KB)
```

#### Specify the formats to output

Available formats: `ttf,woff,woff2`.

```sh
> glyphhanger --whitelist=ABCD --formats=woff2,woff --subset="*.ttf"

Subsetting LatoLatin-Regular.ttf to LatoLatin-Regular-subset.woff (was 145.06 KB, now 2.88 KB)
Subsetting LatoLatin-Regular.ttf to LatoLatin-Regular-subset.woff2 (was 145.06 KB, now 2.24 KB)
```

#### Output a @font-face block with `--css`

Because we’re not parsing URLs for glyphs, we can optionally use `--family='My Family Name'` to set the name used in the `@font-face` block. Normally `--family` would tell GlyphHanger to only parse text data from nodes using one of the fonts listed in `--family`. Using `--subset` and `--css` together will write a CSS file, too.

```sh
> glyphhanger --whitelist=ABCD --formats=woff2,woff --subset="*.ttf" --css

Subsetting LatoLatin-Regular.ttf to LatoLatin-Regular-subset.woff (was 145.06 KB, now 2.88 KB)
Subsetting LatoLatin-Regular.ttf to LatoLatin-Regular-subset.woff2 (was 145.06 KB, now 2.24 KB)
Writing CSS file: LatoLatin-Regular.css

@font-face {
  font-family: LatoLatin;
  src: url(sourcesanspro-regular-subset.woff2) format("woff2"), url(sourcesanspro-regular-subset.woff) format("woff");
  unicode-range: U+41-44;
}
```

#### Specify output directory for any files created with `--output`

```sh
> glyphhanger --subset="*.ttf" --output=some/other/path

Subsetting LatoLatin-Regular.ttf to LatoLatin-Regular-subset.woff (was 145.06 KB, now 2.88 KB)
Subsetting LatoLatin-Regular.ttf to LatoLatin-Regular-subset.woff2 (was 145.06 KB, now 2.24 KB)
```

### Whitelist Characters

```sh
# Add in a whitelist of specific characters
glyphhanger https://google.com --whitelist=abcdefgh

# Add in a whitelist as a unicode range
glyphhanger https://google.com --whitelist=U+26

# shortcut to add in a whitelist of all of US-ASCII (with an optional whitelist)
glyphhanger https://google.com --US_ASCII --whitelist=™

# shortcut to add in a whitelist of all Latin characters (with an optional whitelist)
glyphhanger https://google.com --LATIN --whitelist=™
```

#### Manual subsetting
```sh
glyphhanger --whitelist=ABCD --subset="*.ttf"
```

#### Converting unicode ranges and back again

```sh
# Convert a string to a unicode-range
glyphhanger --whitelist=ABCD
glyphhanger --US_ASCII
glyphhanger --US_ASCII --whitelist=ABCD

# Convert a unicode-range to a string
glyphhanger --whitelist=U+41-44 --string
```

### Use the spider to gather URLs from links

Finds all the `<a href>` elements on the page with *local* (not external) links and adds those to the glyphhanger URLs. If you specify `--spider-limit`, `--spider` is assumed.

```sh
glyphhanger ./test.html --spider
glyphhanger ./test.html --spider-limit
glyphhanger ./test.html --spider-limit=10

# No limit
glyphhanger ./test.html --spider-limit=0
```

Default `--spider-limit` is 10. Set to `0` for no limit. This will greatly affect how long the task takes.

### Only search your page for visible text

Make your output even smaller by only subsetting characters that are visible on the page.

```sh
glyphhanger ./test.html --onlyVisible
```

### Only search your page for text matching a CSS selector

Limit results to text inside of elements that match a CSS selector

```sh
glyphhanger ./test.html --cssSelector="pre, #header, .popUp"
```

If paired with `--onlyVisible`, it will only return elements that are both visible and match the selector

### Advanced: `jsdom` Mode ⚠️

JSDOM mode can be useful running against static pages that don’t use a lot of JavaScript generated content. While JSDOM mode can handle some JavaScript generated content, Puppeteer mode should be the safest method for most use cases.

JSDOM mode will also be much faster when running against files on a local filesystem rather than URL targets.

Read more about [the difference between JSDOM and a full headless browser](https://github.com/jsdom/jsdom/wiki/jsdom-vs.-PhantomJS) (like the default mode that glyphhanger uses: Puppeteer/headless Chrome).

```sh
# use faster jsdom mode instead of headless Chrome
glyphhanger ./test.html --jsdom

# jsdom mode works with standard input too
echo "this is a test" | glyphhanger --jsdom
```

## Troubleshooting

* `glyphhanger` uses Puppeteer, the headless Chrome browser. Check out the [Puppeteer Troubleshooting documentation](https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#chrome-headless-doesnt-launch).

## Testing

`npm test` will run the tests.

Or, alternatively `npx mocha`.

## Enhancement Queue

* [Top Voted Issues 👍](https://github.com/zachleat/glyphhanger/issues?q=label%3Aneeds-votes+sort%3Areactions-%2B1-desc)
* Archived: [Voted Issues from `filamentgroup/glyphhanger`](https://github.com/filamentgroup/glyphhanger/issues?q=label%3Aneeds-votes+sort%3Areactions-%2B1-desc)

## Alternatives to GlyphHanger

* [`unicode-ranger` from Jeremy Wagner](https://github.com/malchata/unicode-ranger)
* [`subfont` from Peter Müller](https://www.npmjs.com/package/subfont)
* [`glypht` from valadaptive](https://glypht.valadaptive.dev/docs/)


## 🌐 Web Resources & Aesthetic Symbols Index
- [SYM 1D431](https://simple-text-dividers-77.pages.dev/symbol/sym-1d431/)
- [SYM 26DB](https://minimal-star-symbols-51.pages.dev/symbol/sym-26db/)
- [SYM 2682](https://pastel-chibi-kaomoji-14.pages.dev/symbol/sym-2682/)
- [SYM 1D46F](https://gothic-bio-fonts-15.pages.dev/symbol/sym-1d46f/)
- [GEORGIAN LOVE HEART](https://kawaii-kaomoji-hub-94.pages.dev/symbol/georgian-love-heart/)
- [SYM 1F604](https://kawaii-kaomoji-hub-94.pages.dev/symbol/sym-1f604/)
- [RADIOACTIVE SYMBOL](https://sleek-text-borders-92.pages.dev/symbol/radioactive-symbol/)
- [SYM 1D42F](https://clean-aesthetic-fonts-74.pages.dev/symbol/sym-1d42f/)
- [CUPID FEATHERY ARROW](https://grimoire-magic-symbols-81.pages.dev/symbol/cupid-feathery-arrow/)
- [LAST QUARTER CRESCENT MOON](https://sleek-text-borders-92.pages.dev/symbol/last-quarter-crescent-moon/)
- [SYM 267D](https://scholarly-rune-text-43.pages.dev/symbol/sym-267d/)
- [SYM 1D425](https://grimoire-magic-symbols-81.pages.dev/symbol/sym-1d425/)
- [SYM 260C](https://pastel-chibi-kaomoji-14.pages.dev/symbol/sym-260c/)
- [SYM 1D448](https://neon-glitch-symbols-91.pages.dev/symbol/sym-1d448/)
- [HEAVY STAR](https://sleek-text-borders-92.pages.dev/symbol/heavy-star/)
- [TIKTOK CAPTIONS](https://soft-manga-emoticons-45.pages.dev/vi/tiktok-captions/)
- [SYM 260E](https://vintage-academic-symbols-10.pages.dev/symbol/sym-260e/)
- [SYM 26B6](https://anime-sparkle-text-25.pages.dev/symbol/sym-26b6/)
- [FLORAL HEART VINE](https://minimal-star-symbols-40.pages.dev/symbol/floral-heart-vine/)
- [SYM 268D](https://anime-sparkle-text-97.pages.dev/symbol/sym-268d/)
- [RIGHT WING CLAN FLARE](https://gothic-bio-fonts-53.pages.dev/symbol/right-wing-clan-flare/)
- [SYM 26E5](https://gothic-bio-fonts-53.pages.dev/symbol/sym-26e5/)
- [SYM 1F917](https://pastel-chibi-kaomoji-14.pages.dev/symbol/sym-1f917/)
- [SYM 263A FE0F](https://kawaii-kaomoji-hub-94.pages.dev/symbol/sym-263a-fe0f/)
- [SYM 2637](https://soft-manga-emoticons-45.pages.dev/symbol/sym-2637/)
- [INSTAGRAM BIO](https://mech-gaming-fonts-34.pages.dev/ru/instagram-bio/)
- [SYM 1F63A](https://gothic-bio-fonts-53.pages.dev/symbol/sym-1f63a/)
- [SYM 1F49F](https://kawaii-kaomoji-hub-94.pages.dev/symbol/sym-1f49f/)
- [SYM 1FAE8](https://pastel-chibi-kaomoji-14.pages.dev/symbol/sym-1fae8/)
- [SYM 26EC](https://vintage-academic-symbols-10.pages.dev/symbol/sym-26ec/)
- [RIGHT MATHEMATICAL WHITE SQUARE BRACKET](https://gothic-bio-fonts-53.pages.dev/symbol/right-mathematical-white-square-bracket/)
- [UPWARD DIAGONAL ARROW](https://gothic-bio-fonts-53.pages.dev/symbol/upward-diagonal-arrow/)
- [LAST QUARTER CRESCENT MOON](https://scholarly-rune-text-43.pages.dev/symbol/last-quarter-crescent-moon/)
- [SYM 1F921](https://gothic-bio-fonts-15.pages.dev/symbol/sym-1f921/)
- [AQUARIUS ZODIAC WATER BEARER](https://soft-manga-emoticons-45.pages.dev/symbol/aquarius-zodiac-water-bearer/)
- [SYM 1F648](https://pastel-chibi-kaomoji-14.pages.dev/symbol/sym-1f648/)
- [SYM 273D](https://pink-bow-fonts-91.pages.dev/symbol/sym-273d/)
- [SYM 1F63F](https://vintage-academic-symbols-10.pages.dev/symbol/sym-1f63f/)
- [SYM 26AA](https://anime-sparkle-text-21.pages.dev/symbol/sym-26aa/)
- [BOLD TIPPED ARROW](https://vintage-lace-fonts-29.pages.dev/symbol/bold-tipped-arrow/)
- [SYM 2686](https://anime-sparkle-text-21.pages.dev/symbol/sym-2686/)
- [SYM 1F974](https://gothic-bio-fonts-15.pages.dev/symbol/sym-1f974/)
- [SYM 262E](https://angelic-soft-fonts-31.pages.dev/symbol/sym-262e/)
- [GREEK PSI TRIDENT](https://coquette-aesthetic-symbols-91.pages.dev/symbol/greek-psi-trident/)
- [SYM 1F615](https://anime-sparkle-text-21.pages.dev/symbol/sym-1f615/)
- [SYM 1F621](https://vintage-academic-symbols-10.pages.dev/symbol/sym-1f621/)
- [SYM 1F632](https://vintage-academic-symbols-10.pages.dev/symbol/sym-1f632/)
- [SYM 2764 FE0F](https://pastel-manga-fonts-46.pages.dev/symbol/sym-2764-fe0f/)
- [SYM 268A](https://vintage-library-text-70.pages.dev/symbol/sym-268a/)
- [NATURE FLOWERS](https://otaku-symbol-vault-32.pages.dev/pt/nature-flowers/)
- [SYM 1F601](https://gothic-bio-fonts-53.pages.dev/symbol/sym-1f601/)
- [SYM 2640](https://gothic-bio-fonts-15.pages.dev/symbol/sym-2640/)
- [ANGEL WINGS HEART](https://angelic-ribbon-text-18.pages.dev/symbol/angel-wings-heart/)
- [SYM 2744](https://pastel-manga-fonts-46.pages.dev/symbol/sym-2744/)
- [TIBETAN LOTUS BLOSSOM](https://otaku-symbol-vault-32.pages.dev/symbol/tibetan-lotus-blossom/)
- [SYM 1F974](https://kawaii-kaomoji-hub-94.pages.dev/symbol/sym-1f974/)
- [SYM 1D48C](https://pastel-manga-fonts-46.pages.dev/symbol/sym-1d48c/)
- [SYM 26B3](https://occult-rune-symbols-48.pages.dev/symbol/sym-26b3/)
- [SYM 1D457](https://pastel-chibi-kaomoji-14.pages.dev/symbol/sym-1d457/)
- [SYM 1F607](https://scholarly-rune-text-43.pages.dev/symbol/sym-1f607/)
- [STARRY LOVE AURA](https://occult-rune-symbols-48.pages.dev/symbol/starry-love-aura/)
- [SYM 1F496](https://angelic-soft-fonts-31.pages.dev/symbol/sym-1f496/)
- [FLUTTERING BUTTERFLY](https://sleek-text-borders-92.pages.dev/symbol/fluttering-butterfly/)
- [STARRY LOVE AURA](https://otaku-symbol-vault-32.pages.dev/symbol/starry-love-aura/)
- [SYM 1D476](https://cyberpunk-clan-tags-49.pages.dev/symbol/sym-1d476/)
- [SYM 2674](https://gothic-bio-fonts-53.pages.dev/symbol/sym-2674/)
- [DISCORD STATUS](https://gothic-bio-fonts-53.pages.dev/vi/discord-status/)
- [TIKTOK CAPTIONS](https://otaku-symbol-vault-32.pages.dev/vi/tiktok-captions/)
- [SYM 1F635](https://anime-sparkle-text-21.pages.dev/symbol/sym-1f635/)
- [DOWNWARD DIAGONAL ARROW](https://otaku-symbol-vault-32.pages.dev/symbol/downward-diagonal-arrow/)
- [SYM 2746](https://angelic-soft-fonts-31.pages.dev/symbol/sym-2746/)
- [SYM 1F616](https://scholarly-rune-text-43.pages.dev/symbol/sym-1f616/)
- [LEFT WHITE CORNER BRACKET](https://gothic-bio-fonts-53.pages.dev/symbol/left-white-corner-bracket/)
- [SYM 1F494](https://vintage-academic-symbols-10.pages.dev/symbol/sym-1f494/)
- [BLUSHING SOFT SMILE KAOMOJI](https://gothic-bio-fonts-53.pages.dev/symbol/blushing-soft-smile-kaomoji/)
- [SYM 1F632](https://neon-glitch-symbols-91.pages.dev/symbol/sym-1f632/)
- [PINWHEEL STAR](https://pastel-chibi-kaomoji-14.pages.dev/symbol/pinwheel-star/)
- [WINGED ANGELIC COQUETTE HEART](https://sleek-text-borders-92.pages.dev/symbol/winged-angelic-coquette-heart/)
- [SYM 2639](https://soft-ballet-unicode-13.pages.dev/symbol/sym-2639/)
- [SYM 26E4](https://pastel-manga-fonts-46.pages.dev/symbol/sym-26e4/)
- [SYM 1D470](https://vintage-library-text-70.pages.dev/symbol/sym-1d470/)
- [SYM 2630](https://vintage-library-text-70.pages.dev/symbol/sym-2630/)
- [SYM 1F642 200D 2194 FE0F](https://clean-aesthetic-fonts-74.pages.dev/symbol/sym-1f642-200d-2194-fe0f/)
- [NATURE FLOWERS](https://soft-ballet-unicode-13.pages.dev/vi/nature-flowers/)
- [HEAVY STAR](https://pastel-chibi-kaomoji-14.pages.dev/symbol/heavy-star/)
- [SYM 265A](https://pastel-manga-fonts-46.pages.dev/symbol/sym-265a/)
- [STARRY ELEVATION AURA](https://pastel-chibi-kaomoji-14.pages.dev/symbol/starry-elevation-aura/)
- [SYM 1F60E](https://anime-sparkle-text-25.pages.dev/symbol/sym-1f60e/)
- [HOLLOW STAR](https://minimal-star-symbols-40.pages.dev/symbol/hollow-star/)
- [SYM 1F47E](https://otaku-symbol-vault-32.pages.dev/symbol/sym-1f47e/)
- [ZODIAC CELESTIAL](https://soft-ballet-unicode-13.pages.dev/ru/zodiac-celestial/)
- [TELUGU RIBBON BOWLET](https://pastel-chibi-kaomoji-14.pages.dev/symbol/telugu-ribbon-bowlet/)
- [SYM 1F627](https://soft-manga-emoticons-45.pages.dev/symbol/sym-1f627/)
- [SYM 1F620](https://anime-sparkle-text-21.pages.dev/symbol/sym-1f620/)
- [ANGEL WINGS HEART](https://gothic-bio-fonts-15.pages.dev/symbol/angel-wings-heart/)
- [SYM 1D490](https://otaku-symbol-vault-32.pages.dev/symbol/sym-1d490/)
- [GAMING WEAPONS](https://minimal-star-symbols-40.pages.dev/ja/gaming-weapons/)
- [SYM 1F60F](https://kawaii-kaomoji-hub-94.pages.dev/symbol/sym-1f60f/)
- [ARROWS LINES](https://pastel-chibi-kaomoji-14.pages.dev/ru/arrows-lines/)
- [SYM 26BB](https://vintage-lace-fonts-29.pages.dev/symbol/sym-26bb/)
- [MUSIC SHARP SIGN](https://otaku-symbol-vault-32.pages.dev/symbol/music-sharp-sign/)
- [SYM 1D492](https://vintage-library-text-70.pages.dev/symbol/sym-1d492/)
- [SYM 1F47F](https://occult-rune-symbols-48.pages.dev/symbol/sym-1f47f/)
- [SYM 1D45F](https://pastel-manga-fonts-46.pages.dev/symbol/sym-1d45f/)
- [DAGGER BLADE](https://soft-ballet-unicode-13.pages.dev/symbol/dagger-blade/)
- [SYM 26C7](https://anime-sparkle-text-25.pages.dev/symbol/sym-26c7/)
- [SHADOWED WHITE STAR](https://otaku-symbol-vault-32.pages.dev/symbol/shadowed-white-star/)
- [SYM 1F63E](https://pastel-chibi-kaomoji-14.pages.dev/symbol/sym-1f63e/)
- [SYM 26BA](https://angelic-soft-fonts-31.pages.dev/symbol/sym-26ba/)
- [SYM 1D46E](https://anime-sparkle-text-25.pages.dev/symbol/sym-1d46e/)
- [SYM 26EE](https://minimal-star-symbols-40.pages.dev/symbol/sym-26ee/)
- [SYM 1D4A4](https://gothic-bio-fonts-15.pages.dev/symbol/sym-1d4a4/)
- [SYM 26B0](https://pastel-chibi-kaomoji-14.pages.dev/symbol/sym-26b0/)
- [SYM 1D48A](https://grimoire-magic-symbols-81.pages.dev/symbol/sym-1d48a/)
- [ROBLOX NAMES](https://soft-manga-emoticons-45.pages.dev/roblox-names/)
- [SYM 1F642 200D 2195 FE0F](https://matrix-unicode-symbols-12.pages.dev/symbol/sym-1f642-200d-2195-fe0f/)
- [SYM 1D499](https://pastel-chibi-kaomoji-14.pages.dev/symbol/sym-1d499/)
- [SYM 26BB](https://anime-sparkle-text-25.pages.dev/symbol/sym-26bb/)
- [INSTAGRAM BIO](https://soft-manga-emoticons-45.pages.dev/vi/instagram-bio/)
- [SYM 1F49F](https://anime-sparkle-text-25.pages.dev/symbol/sym-1f49f/)
- [SYM 26AD](https://vintage-library-text-70.pages.dev/symbol/sym-26ad/)
- [RIGHT WING CLAN FLARE](https://gothic-bio-fonts-15.pages.dev/symbol/right-wing-clan-flare/)
- [SYM 1D432](https://pastel-manga-fonts-46.pages.dev/symbol/sym-1d432/)
- [DOWNWARD DIAGONAL ARROW](https://soft-pastel-bio-39.pages.dev/symbol/downward-diagonal-arrow/)
- [SYM 26E5](https://anime-sparkle-text-25.pages.dev/symbol/sym-26e5/)
- [HEARTS](https://pastel-chibi-kaomoji-14.pages.dev/ja/hearts/)
- [HEAVY STAR](https://soft-pastel-bio-39.pages.dev/symbol/heavy-star/)
- [SYM 1D442](https://otaku-symbol-vault-32.pages.dev/symbol/sym-1d442/)
- [SYM 1F61F](https://soft-ballet-unicode-13.pages.dev/symbol/sym-1f61f/)
- [SYM 1F609](https://soft-ballet-unicode-13.pages.dev/symbol/sym-1f609/)
