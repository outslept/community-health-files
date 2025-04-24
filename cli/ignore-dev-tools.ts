import type { Plugin } from 'rollup'

function ignoreReactDevToolsPlugin(): Plugin {
  return {
    name: 'ignore-react-devtools',
    resolveId(source) {
      // When an import for 'react-devtools-core' is encountered,
      // return a special ID for an empty module
      if (source === 'react-devtools-core') {
        return '\0empty-module:react-devtools-core'
      }
      return null
    },
    load(id) {
      // For our special ID, return an empty module
      if (id.startsWith('\0empty-module:')) {
        return 'export default {}; export const connectToDevTools = () => {};'
      }
      return null
    },
  }
}

export default ignoreReactDevToolsPlugin
