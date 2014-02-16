Gamestab
--------------------------

## First Installation

1. Clone repo.
2. Run `npm install`.
3. Run `bower install`.
4. You will need `Gulp` installed globally. Do this by: `npm i gulp -g`.
5. run `gulp` and start developing.
6. App is built into the `build` directory, and also changes are watched.

## Building a production version

Run: `gulp --production`. This will output a minified & concated version.

## Bumping versions

Run `gulp bump` in order to bump versions of the app in both `manifest.json, bower.json and package.json`.

## Loading extension

After building extension (using `gulp`) load the `build` directory in your Chrome Extensions page.
Extension should automatically load itself, and run when you open a newtab.
