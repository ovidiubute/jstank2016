# Tank 2016

This is a recreation of the timeless NES game Battle City, or TANK 1990 as it was known in Eastern Europe bootleg cartridges.

The game is built with the awesome [Phaser](http://phaser.io/) engine in JavaScript of the EcmaScript 6 variant.

All of the assets are not original, they have been taken from all over the interwebs. Since this project is meant to
provide a helping hand to anyone out there just starting out with games and HTML5, I'd say this falls under fair use.

I used a great Phaser ES6 barebones project template to start out, you can find it on [Github](https://github.com/belohlavek/phaser-es6-boilerplate).

## Usage

You need [Node.js and npm](https://nodejs.org/).

Clone the repository (or download the ZIP file)

`git clone https://github.com/ovidiubute/jstank2016.git`

Install dependencies

`npm install`

Run a development build...

`npm start`

...or a production build.

`npm run production`

Development builds will copy `phaser.min.js` together with `phaser.map` and `phaser.js`
Your ES6 code will be transpiled into ES5 and concatenated into a single file.
A sourcemap for your code will also be included (by default `game.map.js`).

Production builds will only copy `phaser.min.js`. Your ES6 code will be transpiled and
minified using UglifyJS.

Any modification to the files inside the `./src` and `./static` folder will trigger a full page reload.

If you modify the contents of other files, please manually restart the server.

### Modifying `gulpfile.js`

See [gulpfile.md](https://github.com/ovidiubute/jstank2016/blob/master/gulpfile.md)

## License

This project is released under the MIT License.