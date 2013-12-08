WINT (White Label New Tab)
--------------------------

## Install

1. Clone repo.
2. Run `npm start` which will bootstrap everything.
3. Load unpacked extension, at `build`.
4. Run `grunt`.
5. [Not Yet Ready] //Start developing, while grunt compiles your changes on the fly with `watch`.

## Includes

An include is either a `lib` or `module`.
**New include?** add it in the relevant array in the Gruntfile.

## File Structure

WINT is quite complex in matter of files and directories. It has to be verstaile enough to build multiple variations of extensions, yet be slim to be quickly build and developed upon.

1. **Assets** : Images, Everything that needs to be copied into *build*.
2. **Source** : JS code, templates, etc. Also copied after each modification into *build*.
3. **builds** : *will* contain directories, each containing an extension with variations.
4. **buiid**  : contains the current build.