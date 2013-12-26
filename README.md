WINT (White Label New Tab)
--------------------------

[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

## First Installation

1. Clone repo.
2. Run `npm preinstall` which will bootstrap everything.
3. Load unpacked extension, at `build`.
4. Run `npm start`.
5. Start developing, while grunt compiles your changes on the fly with `watch`.

## Reinstallation

1. Just run `npm start`.

# Code Organization, Tips tricks and all that

### Libraries and Modules

**New Library** - Add to the copy:libs task in Gruntfile.
**New Module**  - Add to the RequireJS config JSON in `main.js`

### Module Convention

- All modules return an object named internally `self`, which contains a `promise` that gets resolved once `init()` finished (or failed);
- That promise stems from the deferred each Module has (all modules are async) called `initting`.
- Modules with var init initiliaze are self initialized, modules with self.init ARE SUPPOSED to be initialized from other modules.

### Code Convention

- No callbacks project. Only promises. Anything that can fail should use promises, never fail silently or use a callback.
    - All promises go into variables, even if not used -> they will be.
- All methods that begin with `setX` change the object they're given.

## File Structure

WINT is quite complex in matter of files and directories. It has to be verstaile enough to build multiple variations of extensions, yet be slim to be quickly build and developed upon.

1. **Assets** : Images, Everything that needs to be copied into *build*.
2. **Source** : JS code, templates, etc. Also copied after each modification into *build*.
3. **builds** : *will* contain directories, each containing an extension with variations.
4. **buiid**  : contains the current build.


## WINT Booting process

1. Load only the modules and files that are required to decide if we should use the booster (Env, Config etc etc)
2. Decide if we should use the Booster
3. Load the Runtime module
4. Load the rest of the modules
5. Render the UI


## WINT ASYNC Modules Conventions

1. Each async module should have the async_ prefix
2. Each async module should have 'private' defer for the initialization process called 'initting'.
3. Each async module should have async_module.promise object that will be resolved when the module is'ready'
4. Modules that are dependant on other async modules, should specify the module in the define function and
   to init only after listening to the async_module.promise.then(...)
