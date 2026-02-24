// src/stores/index.js
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-persistedstate-plugin'

const pinia = createPinia()
const persist = createPersistedState()
pinia.use(persist)

export default pinia