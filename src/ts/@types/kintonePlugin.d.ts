import { kintone } from "kypes/namespaces/kintone";

declare global {
  /**
   * The global object for kintone JS API.
   */
  namespace kintone {
    export const $PLUGIN_ID: string
  }
}