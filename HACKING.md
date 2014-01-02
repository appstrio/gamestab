# Hacking

## Code Organization

- **Libraries**:
    1. install via `bower` with `--save` flag.
    2. Add to the copy:libs task in Gruntfile.

- **Modules**: Add to the RequireJS config JSON in `init.js`
- **Assets** : Images, Everything that needs to be copied into *build*.
- **Source** : JS code, templates, etc. Also copied after each modification into *build*.
- **builds** : build directories, each containing an extension with variations.
- **buiid**  : contains the current build.

## Conventions

- Modules:
    - All modules return an object named internally `self`, which contains a `promise` that gets resolved once `init()` finished (or failed);
    - That promise stems from the deferred each Module has (all modules are async) called `initting`.
    - Modules with var init initiliaze are self initialized, modules with self.init ARE SUPPOSED to be initialized from other modules.

- Functions:
    - All methods that begin with `setX` change the object they're given.

## WINT Booting process

1. Load only the modules and files that are required to decide if we should use the booster (Env, Config etc etc)
2. Decide if we should use the Booster
3. Load the Runtime module
4. Load the rest of the modules
5. Render the UI

## WINT ASYNC Modules Conventions

- Each async module should have 'private' defer for the initialization process called `initting`.
- Each async module should have a module.promise object that will be resolved when the module is 'ready'
- Modules that are dependant on other async modules, should specify the module in the define function and
   to init only after listening to the `module.promise.then(...)`.
