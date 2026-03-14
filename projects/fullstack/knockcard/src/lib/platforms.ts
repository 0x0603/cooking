export interface PlatformConfig {
  id: string
  name: string
  icon: string
  baseUrl: string
  color: string
}

export const PLATFORMS: Record<string, PlatformConfig> = {
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'linkedin',
    baseUrl: 'https://linkedin.com/in/',
    color: '#0A66C2',
  },
  github: {
    id: 'github',
    name: 'GitHub',
    icon: 'github',
    baseUrl: 'https://github.com/',
    color: '#181717',
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: 'instagram',
    baseUrl: 'https://instagram.com/',
    color: '#E4405F',
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    icon: 'facebook',
    baseUrl: 'https://facebook.com/',
    color: '#1877F2',
  },
  twitter: {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: 'twitter',
    baseUrl: 'https://x.com/',
    color: '#000000',
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'tiktok',
    baseUrl: 'https://tiktok.com/@',
    color: '#000000',
  },
  zalo: {
    id: 'zalo',
    name: 'Zalo',
    icon: 'zalo',
    baseUrl: 'https://zalo.me/',
    color: '#0068FF',
  },
  shopee: {
    id: 'shopee',
    name: 'Shopee',
    icon: 'shopee',
    baseUrl: 'https://shopee.vn/',
    color: '#EE4D2D',
  },
  lazada: {
    id: 'lazada',
    name: 'Lazada',
    icon: 'lazada',
    baseUrl: 'https://lazada.vn/shop/',
    color: '#0F146D',
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: 'whatsapp',
    baseUrl: 'https://wa.me/',
    color: '#25D366',
  },
  telegram: {
    id: 'telegram',
    name: 'Telegram',
    icon: 'telegram',
    baseUrl: 'https://t.me/',
    color: '#26A5E4',
  },
  viber: {
    id: 'viber',
    name: 'Viber',
    icon: 'viber',
    baseUrl: 'viber://chat?number=',
    color: '#7360F2',
  },
  line: {
    id: 'line',
    name: 'LINE',
    icon: 'line',
    baseUrl: 'https://line.me/ti/p/',
    color: '#00C300',
  },
  behance: {
    id: 'behance',
    name: 'Behance',
    icon: 'behance',
    baseUrl: 'https://behance.net/',
    color: '#1769FF',
  },
  dribbble: {
    id: 'dribbble',
    name: 'Dribbble',
    icon: 'dribbble',
    baseUrl: 'https://dribbble.com/',
    color: '#EA4C89',
  },
  figma: {
    id: 'figma',
    name: 'Figma',
    icon: 'figma',
    baseUrl: 'https://figma.com/@',
    color: '#F24E1E',
  },
  medium: {
    id: 'medium',
    name: 'Medium',
    icon: 'medium',
    baseUrl: 'https://medium.com/@',
    color: '#000000',
  },
  devto: {
    id: 'devto',
    name: 'Dev.to',
    icon: 'devto',
    baseUrl: 'https://dev.to/',
    color: '#0A0A0A',
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    icon: 'youtube',
    baseUrl: 'https://youtube.com/@',
    color: '#FF0000',
  },
  twitch: {
    id: 'twitch',
    name: 'Twitch',
    icon: 'twitch',
    baseUrl: 'https://twitch.tv/',
    color: '#9146FF',
  },
  spotify: {
    id: 'spotify',
    name: 'Spotify',
    icon: 'spotify',
    baseUrl: 'https://open.spotify.com/user/',
    color: '#1DB954',
  },
  soundcloud: {
    id: 'soundcloud',
    name: 'SoundCloud',
    icon: 'soundcloud',
    baseUrl: 'https://soundcloud.com/',
    color: '#FF5500',
  },
  momo: {
    id: 'momo',
    name: 'MoMo',
    icon: 'momo',
    baseUrl: 'https://nhantien.momo.vn/',
    color: '#A50064',
  },
  vnpay: {
    id: 'vnpay',
    name: 'VNPay',
    icon: 'vnpay',
    baseUrl: 'https://vnpay.vn/',
    color: '#005BAA',
  },
  paypal: {
    id: 'paypal',
    name: 'PayPal',
    icon: 'paypal',
    baseUrl: 'https://paypal.me/',
    color: '#003087',
  },
} as const

export const PLATFORM_CATEGORIES: Record<string, string[]> = {
  social: ['linkedin', 'github', 'instagram', 'facebook', 'twitter', 'tiktok'],
  messaging: ['zalo', 'whatsapp', 'telegram', 'viber', 'line'],
  ecommerce: ['shopee', 'lazada'],
  design: ['behance', 'dribbble', 'figma'],
  blog: ['medium', 'devto'],
  video: ['youtube', 'twitch'],
  music: ['spotify', 'soundcloud'],
  payment: ['momo', 'vnpay', 'paypal'],
}

export function getPlatform(id: string): PlatformConfig | undefined {
  return PLATFORMS[id]
}
