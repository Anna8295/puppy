/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Address of the try-on Worker (worker/). Empty: the "Try it on your dog" button is hidden. */
  readonly VITE_TRY_ON_URL?: string;
}
