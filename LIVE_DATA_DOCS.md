# Live Data Section - Documentación

## Descripción General

La sección **Live Data** es el corazón de la aplicación CO2Chain, mostrando datos en tiempo real del mercado de criptomonedas y la red Ethereum. Todos los datos se obtienen de APIs públicas sin necesidad de claves API.

## Características Principales

### 1. 🌍 Estadísticas Globales del Mercado
- **Market Cap Total**: Capitalización total del mercado crypto
- **Volumen 24h**: Volumen de trading en las últimas 24 horas
- **Dominancia BTC/ETH**: Porcentaje de dominancia de Bitcoin y Ethereum
- **Monedas Activas**: Número total de criptomonedas activas

**Fuente**: CoinGecko API (`/global`)
**Actualización**: Cada 2 minutos

### 2. 💰 Tabla de Precios de Criptomonedas
Muestra 8 criptomonedas principales con:
- Precio actual en USD
- Cambio porcentual en 24h (verde/rojo)
- Capitalización de mercado
- Mini gráfico sparkline de 7 días

**Criptomonedas Mostradas**:
- Ethereum (ETH)
- Bitcoin (BTC)
- Polygon (MATIC)
- Chainlink (LINK)
- The Graph (GRT)
- Uniswap (UNI)
- Aave (AAVE)
- Solana (SOL)

**Fuente**: CoinGecko API (`/coins/markets`)
**Actualización**: Cada 60 segundos

### 3. ⛓️ Estado de la Red Ethereum
- **Número de Bloque**: Último bloque minado
- **Transacciones**: Número de transacciones en el último bloque
- **Peers Conectados**: Número de nodos conectados
- **Base Fee**: Tarifa base actual del gas
- **Tiempo de Bloque**: ~12 segundos
- **Visualizador de Bloques**: Gráfico de barras de los últimos 30 bloques

**Fuente**: Ethereum RPC (llamarpc.com, ankr.com, publicnode.com)
**Actualización**: Cada 12 segundos (tiempo de bloque)

### 4. ⚡ Gas Tracker
Medidores visuales para tres niveles de prioridad:
- 🐢 **Slow**: Gas más bajo, confirmación lenta
- ⚡ **Standard**: Balance entre costo y velocidad
- 🚀 **Fast**: Gas más alto, confirmación rápida

**Calculadora de Costos**:
- Transferencia ETH (21,000 gas)
- Swap de Tokens (~150,000 gas)
- Mint de NFT (~200,000 gas)

**Fuente**: Ethereum RPC (`eth_gasPrice`)
**Actualización**: Cada 15 segundos

### 5. 💎 Tarjeta de Precio ETH
- Precio actual de Ethereum
- Cambio 24h con indicador visual
- Máximo y mínimo de 24h
- Indicador LIVE con animación

**Fuente**: CoinGecko API (`/simple/price`)
**Actualización**: Cada 30 segundos

## Componentes Técnicos

### LiveDataSection.tsx
Componente principal que orquesta todos los datos en tiempo real.

**Hooks Utilizados**:
- `useEthereumData()`: Datos de la red Ethereum
- `useCryptoPrices()`: Precios de criptomonedas
- `useGasTracker()`: Precios de gas
- `useGlobalMarket()`: Estadísticas globales
- `useEthPrice()`: Precio de ETH

**Componentes Auxiliares**:
- `Sparkline`: Gráficos de líneas SVG para tendencias
- `GasGauge`: Medidores visuales de gas
- `BlockVisualizer`: Visualización de bloques recientes
- `LiveIndicator`: Indicador animado de datos en vivo

### useRealTimeData.ts
Hooks personalizados para obtener datos en tiempo real.

**Endpoints Utilizados**:

#### CoinGecko API (Gratuita, sin API key)
```
GET https://api.coingecko.com/api/v3/global
GET https://api.coingecko.com/api/v3/coins/markets
GET https://api.coingecko.com/api/v3/simple/price
```

#### Ethereum RPC (Público, sin API key)
```
POST https://eth.llamarpc.com
POST https://rpc.ankr.com/eth
POST https://ethereum-rpc.publicnode.com
```

**Métodos RPC**:
- `eth_blockNumber`: Número de bloque actual
- `eth_gasPrice`: Precio actual del gas
- `eth_getBlockByNumber`: Datos del último bloque
- `net_peerCount`: Número de peers conectados

## Diseño Visual

### Indicadores de Estado
- 🟢 **Verde**: API conectada y funcionando
- 🔴 **Rojo**: API con errores
- 🟡 **Amarillo**: Cargando datos

### Animaciones
- **Pulse**: Indicadores LIVE
- **Spin**: Loaders de carga
- **Fade-in**: Transiciones suaves
- **Gradient**: Fondos con degradados

### Colores
- **Emerald (#10b981)**: Datos positivos, Ethereum
- **Red (#ef4444)**: Datos negativos
- **Yellow (#f59e0b)**: Gas, alertas
- **Cyan (#06b6d4)**: Información, bloques

## Rendimiento

### Optimizaciones
- **Caching**: React Query cachea respuestas
- **Polling**: Intervalos optimizados por tipo de dato
- **Lazy Loading**: Componentes cargan bajo demanda
- **SVG Sparklines**: Gráficos ligeros sin dependencias

### Frecuencia de Actualización
| Dato | Intervalo |
|------|-----------|
| Precios Crypto | 60s |
| Precio ETH | 30s |
| Gas Price | 15s |
| Bloques Ethereum | 12s |
| Market Global | 120s |

## Integración

La sección se integra en la landing page después del Hero:

```tsx
<Hero />
<LiveDataSection />
<Features />
```

## Estado de APIs

En tiempo real, la sección muestra el estado de todas las APIs:
- CoinGecko API
- Ethereum RPC (llamarpc.com)
- Ankr Public RPC
- PublicNode RPC

Cada API tiene un indicador visual (verde/rojo) que muestra si está operativa.

## Uso en Producción

Para producción, considera:
1. **Rate Limiting**: CoinGecko tiene límites en el plan gratuito
2. **Fallback RPCs**: Múltiples endpoints para redundancia
3. **Error Handling**: Manejo robusto de errores de red
4. **Caching**: Implementar cache del lado del servidor si es necesario

## Próximas Mejoras

- [ ] WebSocket para actualizaciones en tiempo real
- [ ] Más criptomonedas con búsqueda
- [ ] Gráficos interactivos con zoom
- [ ] Alertas de precio personalizables
- [ ] Exportar datos a CSV
- [ ] Modo comparativo entre chains

## Licencia

Datos proporcionados por:
- CoinGecko API (gratuita)
- Ethereum Public RPCs (gratuitos)

No se requiere API key para ninguno de los servicios utilizados.
