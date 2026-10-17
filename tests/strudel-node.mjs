import { registerHooks } from "node:module";

// This dependency publishes its ESM entry in `module`, which Vite reads but Node does not.
registerHooks({
  resolve(specifier, context, next) {
    return next(specifier === "@kabelsalat/web" ? "@kabelsalat/web/dist/index.mjs" : specifier, context);
  },
});
