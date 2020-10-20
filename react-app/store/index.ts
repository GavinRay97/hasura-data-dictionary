import model, { Store } from "./model"
import { createStore, createTypedHooks, persist } from "easy-peasy"

/**
 * =====================
 *  STORE
 * =====================
 */

export const store = createStore<Store>(
  persist(model, { storage: "sessionStorage" })
)

// Wrapping dev only code like this normally gets stripped out by bundlers
// such as Webpack when creating a production build.
// if (process.env.NODE_ENV === "development") {
// 	if (module.hot) {
// 		module.hot.accept("./model", () => {
// 			store.reconfigure(model) // 👈 Here is the magic
// 		})
// 	}
// }

/**
 * =====================
 *  EXPORTS & MISC
 * =====================
 */

const typedHooks = createTypedHooks<Store>()
export const useStoreActions = typedHooks.useStoreActions
export const useStoreDispatch = typedHooks.useStoreDispatch
export const useStoreState = typedHooks.useStoreState
export const useStore = typedHooks.useStore
