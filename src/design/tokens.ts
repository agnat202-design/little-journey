/**
 * Baby Preparation Dashboard — Design Tokens
 * Ethos: "Kids-app friendliness + Adult financial clarity + Premium consumer polish"
 */

export const TOKENS = {
  colors: {
    // Base Canvas
    canvas: '#FCFBF8',
    card: '#FFFFFF',
    textMain: '#292442',
    textMuted: '#79738E',
    borderSoft: '#F0ECE4',

    // Primary & Accent Brand
    primaryDeep: '#34236B',     // Strong action buttons, header accents
    secondaryPurple: '#6C4CF5', // Selected pills, progress bars, highlights
    mintAqua: '#52D6C7',        // Completion, health, savings win
    sunnyYellow: '#FFD45A',     // Milestones, attention, baby joy
    coral: '#FF786A',           // Priority alerts, medical dates

    // Soft Tint Backgrounds
    softLavender: '#EEE9FF',
    softMint: '#E7FAF5',
    softPeach: '#FFF0E9',
    softYellow: '#FFF9E5',
    softBlue: '#E8F5FE',
  },

  radii: {
    card: '28px',
    sheet: '32px',
    pill: '9999px',
    button: '22px',
    inner: '18px',
  },

  shadows: {
    soft: '0 8px 24px -4px rgba(41, 36, 66, 0.06)',
    card: '0 12px 32px -6px rgba(108, 76, 245, 0.08)',
    chunky: '0 6px 0px 0px rgba(52, 35, 107, 0.12)',
    floating: '0 16px 36px -8px rgba(52, 35, 107, 0.18)',
  },

  typography: {
    fontFamily: "'Nunito', system-ui, -apple-system, sans-serif",
  },
} as const;

export const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  'Pregnancy': { bg: 'bg-[#EEE9FF]', text: 'text-[#6C4CF5]', border: 'border-[#DDD4FC]', icon: '🤰' },
  'Mother': { bg: 'bg-[#FFF0E9]', text: 'text-[#FF786A]', border: 'border-[#FEDACE]', icon: '🌸' },
  'Hospital bag': { bg: 'bg-[#FFF9E5]', text: 'text-[#C79100]', border: 'border-[#FEEBB0]', icon: '🧳' },
  'Baby clothing': { bg: 'bg-[#E7FAF5]', text: 'text-[#1EA896]', border: 'border-[#CEF3EA]', icon: '👶' },
  'Feeding': { bg: 'bg-[#E8F5FE]', text: 'text-[#2B88D9]', border: 'border-[#CCE8FC]', icon: '🍼' },
  'Diapering': { bg: 'bg-[#FFF9E5]', text: 'text-[#B8860B]', border: 'border-[#FCEEC1]', icon: '🧷' },
  'Sleeping': { bg: 'bg-[#EEE9FF]', text: 'text-[#6C4CF5]', border: 'border-[#E0D7FE]', icon: '🌙' },
  'Bathing': { bg: 'bg-[#E7FAF5]', text: 'text-[#1EA896]', border: 'border-[#CEF3EA]', icon: '🛁' },
  'Travel': { bg: 'bg-[#FFF0E9]', text: 'text-[#E05342]', border: 'border-[#FFD5CF]', icon: '🚗' },
  'Safety': { bg: 'bg-[#FFF9E5]', text: 'text-[#B8860B]', border: 'border-[#FCEEC1]', icon: '🛡️' },
  'Documents': { bg: 'bg-[#E8F5FE]', text: 'text-[#2B88D9]', border: 'border-[#CCE8FC]', icon: '📋' },
  'Postpartum': { bg: 'bg-[#FFF0E9]', text: 'text-[#FF786A]', border: 'border-[#FEDACE]', icon: '💖' },
  'Medical': { bg: 'bg-[#E7FAF5]', text: 'text-[#1EA896]', border: 'border-[#CEF3EA]', icon: '🩺' },
  'Hospital / Delivery': { bg: 'bg-[#EEE9FF]', text: 'text-[#6C4CF5]', border: 'border-[#DDD4FC]', icon: '🏥' },
  'Baby Gear': { bg: 'bg-[#FFF9E5]', text: 'text-[#C79100]', border: 'border-[#FEEBB0]', icon: '🎠' },
  'Other': { bg: 'bg-[#F4F3F7]', text: 'text-[#5E5873]', border: 'border-[#E5E3EB]', icon: '✨' },
};
