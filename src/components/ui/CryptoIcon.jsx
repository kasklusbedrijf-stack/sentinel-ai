import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * CryptoIcon — displays a cryptocurrency icon with a 3-tier fallback chain:
 *
 *  Tier 1: `imageUrl` prop  — CoinGecko image_url stored in DB (most accurate, already a full URL)
 *  Tier 2: CoinGecko asset CDN via symbol→coingecko-id map (reliable, free, no auth)
 *  Tier 3: Text initials fallback — never shows broken images
 *
 * Usage:
 *   <CryptoIcon symbol="BTC" imageUrl={asset.image_url} size="md" />
 *   <CryptoIcon symbol="ETH" size="sm" />   // no imageUrl needed, will resolve via map
 */

// symbol → coingecko coin ID (used to build CDN thumbnail URL)
const COINGECKO_ID_MAP = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  SOL: 'solana',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  AVAX: 'avalanche-2',
  DOT: 'polkadot',
  MATIC: 'matic-network',
  POL: 'matic-network',
  LINK: 'chainlink',
  LTC: 'litecoin',
  UNI: 'uniswap',
  ATOM: 'cosmos',
  XLM: 'stellar',
  ALGO: 'algorand',
  FIL: 'filecoin',
  VET: 'vechain',
  ICP: 'internet-computer',
  HBAR: 'hedera-hashgraph',
  NEAR: 'near',
  FTM: 'fantom',
  ETC: 'ethereum-classic',
  BCH: 'bitcoin-cash',
  XMR: 'monero',
  AAVE: 'aave',
  MKR: 'maker',
  COMP: 'compound-governance-token',
  SNX: 'havven',
  CRV: 'curve-dao-token',
  '1INCH': '1inch',
  GRT: 'the-graph',
  ENS: 'ethereum-name-service',
  LDO: 'lido-dao',
  ARB: 'arbitrum',
  OP: 'optimism',
  INJ: 'injective-protocol',
  SUI: 'sui',
  APT: 'aptos',
  SEI: 'sei-network',
  TIA: 'celestia',
  PYTH: 'pyth-network',
  JTO: 'jito-governance-token',
  WIF: 'dogwifcoin',
  BONK: 'bonk',
  PEPE: 'pepe',
  SHIB: 'shiba-inu',
  FLOKI: 'floki',
  XTZ: 'tezos',
  EOS: 'eos',
  ZEC: 'zcash',
  DASH: 'dash',
  WAVES: 'waves',
  IOTA: 'iota',
  NEO: 'neo',
  USDT: 'tether',
  USDC: 'usd-coin',
  DAI: 'dai',
  BUSD: 'binance-usd',
  TUSD: 'true-usd',
  LUNA: 'terra-luna-2',
  LUNC: 'terra-luna',
  RENDER: 'render-token',
  RNDR: 'render-token',
  FET: 'fetch-ai',
  AGIX: 'singularitynet',
  OCEAN: 'ocean-protocol',
  TAO: 'bittensor',
  WLD: 'worldcoin-wld',
  CHZ: 'chiliz',
  ENJ: 'enjincoin',
  FLOW: 'flow',
  IMX: 'immutable-x',
  ROSE: 'oasis-network',
  KSM: 'kusama',
  EGLD: 'elrond-erd-2',
  STX: 'blockstack',
  THETA: 'theta-token',
  CELO: 'celo',
  ZIL: 'zilliqa',
  ANKR: 'ankr',
  BAT: 'basic-attention-token',
  ZRX: '0x',
  NMR: 'numeraire',
  BAND: 'band-protocol',
  KAVA: 'kava',
  LRC: 'loopring',
  BNT: 'bancor',
  STORJ: 'storj',
  KNC: 'kyber-network-crystal',
  SUSHI: 'sushi',
  YFI: 'yearn-finance',
  CVX: 'convex-finance',
  FXS: 'frax-share',
  FRAX: 'frax',
  RUNE: 'thorchain',
  OSMO: 'osmosis',
  SCRT: 'secret',
  QNT: 'quant-network',
  SAND: 'the-sandbox',
  MANA: 'decentraland',
  AXS: 'axie-infinity',
  GALA: 'gala',
  DCR: 'decred',
  ZEN: 'zencash',
  RVN: 'ravencoin',
  OMG: 'omisego',
  CELR: 'celer-network',
  SKL: 'skale',
  OGN: 'origin-protocol',
  RSR: 'reserve-rights-token',
  ICX: 'icon',
  ONT: 'ontology',
  SC: 'siacoin',
  NANO: 'nano',
  HOT: 'holotoken',
  BTG: 'bitcoin-gold',
  XDC: 'xdce-crowd-sale',
  EVMOS: 'evmos',
  JUNO: 'juno-network',
  STRD: 'stride',
  SPELL: 'spell-token',
  MLN: 'melon',
  REP: 'augur',
  OXT: 'orchid-protocol',
  TFUEL: 'theta-fuel',
};

// Build the CoinGecko CDN small thumbnail URL from coin ID
function getCoinGeckoUrl(symbol) {
  const id = COINGECKO_ID_MAP[symbol?.toUpperCase()];
  if (!id) return null;
  // CoinGecko's canonical small image pattern (32x32 thumbnails, no auth needed)
  return `https://assets.coingecko.com/coins/images/thumb/${id}.png`;
}

// Color palette for initials fallback — based on symbol hash for consistency
function getInitialsColor(symbol) {
  const colors = [
    'bg-blue-500/20 text-blue-400',
    'bg-purple-500/20 text-purple-400',
    'bg-green-500/20 text-green-400',
    'bg-orange-500/20 text-orange-400',
    'bg-pink-500/20 text-pink-400',
    'bg-cyan-500/20 text-cyan-400',
    'bg-yellow-500/20 text-yellow-400',
    'bg-red-500/20 text-red-400',
  ];
  if (!symbol) return colors[0];
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) hash += symbol.charCodeAt(i);
  return colors[hash % colors.length];
}

const SIZE_MAP = {
  xs: 'w-5 h-5 text-[8px]',
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-12 h-12 text-base',
};

export default function CryptoIcon({ symbol, imageUrl, size = 'md', className }) {
  // Determine initial source: DB imageUrl wins, then CDN, then null (→ initials)
  const cdnUrl = getCoinGeckoUrl(symbol);
  const [imgSrc, setImgSrc] = useState(imageUrl || cdnUrl);
  const [failed, setFailed] = useState(false);

  // If imageUrl changes (e.g. after lazy-loading data), update the source
  useEffect(() => {
    if (imageUrl) {
      setImgSrc(imageUrl);
      setFailed(false);
    }
  }, [imageUrl]);

  const handleError = () => {
    if (imgSrc === imageUrl && cdnUrl) {
      // DB url failed → try CoinGecko CDN
      setImgSrc(cdnUrl);
    } else {
      // CDN also failed → show initials
      setFailed(true);
    }
  };

  const initials = symbol?.slice(0, 2)?.toUpperCase() || '??';
  const sizeCls = SIZE_MAP[size] || SIZE_MAP.md;
  const colorCls = getInitialsColor(symbol);

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center overflow-hidden flex-shrink-0',
      failed || !imgSrc ? colorCls : 'bg-white/5',
      sizeCls,
      className
    )}>
      {!failed && imgSrc ? (
        <img
          src={imgSrc}
          alt={symbol}
          className="w-full h-full object-contain p-0.5"
          onError={handleError}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className="font-bold leading-none">{initials}</span>
      )}
    </div>
  );
}