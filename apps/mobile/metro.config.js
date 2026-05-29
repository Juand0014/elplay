const { getDefaultConfig } = require('expo/metro-config')
const { FileStore }        = require('metro-cache')
const path                 = require('path')

// Raíz del monorepo
const projectRoot  = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// Permitir que Metro resuelva paquetes del monorepo
config.watchFolders = [workspaceRoot]

// Resolver: buscar módulos en node_modules del monorepo raíz también
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

// Cache en disco para builds más rápidos
config.cacheStores = [
  new FileStore({ root: path.join(projectRoot, '.metro-cache') }),
]

module.exports = config
