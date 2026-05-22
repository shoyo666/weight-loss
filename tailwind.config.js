/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /* ==================== 字体 ==================== */
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },

      /* ==================== 马卡龙色系 ==================== */
      colors: {
        // 蜜桃橙（主色调）
        peach: {
          50:  '#fff8f6',
          100: '#ffeee9',
          200: '#ffd5c9',
          300: '#ffb8a3',
          400: '#ff9a7c',
          500: '#ff7a59',
          600: '#ff5c36',
          700: '#e03d1a',
          800: '#b52d10',
          900: '#8a1e08',
        },
        // 薄荷绿
        mint: {
          50:  '#f0fdf6',
          100: '#dcfcea',
          200: '#bbf7d4',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // 薰衣草紫
        lavender: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c4b5fd',
          500: '#a78bfa',
          600: '#8b5cf6',
          700: '#7c3aed',
          800: '#6d28d9',
          900: '#5b21b6',
        },
        // 天蓝
        sky: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // 黄油奶酪
        butter: {
          50:  '#fffef0',
          100: '#fefce8',
          200: '#fef9c3',
          300: '#fef08a',
          400: '#fde047',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        // 玫瑰粉
        rose: {
          50:  '#fff5f7',
          100: '#ffeaee',
          200: '#ffd1d9',
          300: '#ffaab8',
          400: '#ff7b90',
          500: '#ff4d68',
          600: '#e82d4d',
          700: '#c51c3a',
          800: '#a01530',
          900: '#800f26',
        },
      },

      /* ==================== 圆角 ==================== */
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },

      /* ==================== 阴影 ==================== */
      boxShadow: {
        'soft':       '0 2px 16px rgba(0, 0, 0, 0.06)',
        'soft-lg':    '0 4px 24px rgba(0, 0, 0, 0.08)',
        'glass':      '0 8px 32px rgba(0, 0, 0, 0.07), inset 0 1px 0 rgba(255,255,255,0.6)',
        'glass-lg':   '0 16px 48px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.5)',
        'glow-peach': '0 4px 20px rgba(255, 122, 89, 0.3)',
        'glow-mint':  '0 4px 20px rgba(34, 197, 94, 0.3)',
        'glow-lavender': '0 4px 20px rgba(167, 139, 250, 0.3)',
        'glow-sky':   '0 4px 20px rgba(56, 189, 248, 0.3)',
        'card':       '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 8px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.1)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.7)',
      },

      /* ==================== 动画 ==================== */
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulse_soft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        spin_slow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        scale_in: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slide_up: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounce_soft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-4px)' },
          '60%': { transform: 'translateY(-2px)' },
        },
        progress_fill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--target-width)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        fade_in: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        wipe_in_right: {
          '0%': { clipPath: 'inset(0 100% 0 0)' },
          '100%': { clipPath: 'inset(0 0% 0 0)' },
        },
      },
      animation: {
        'shimmer':       'shimmer 2s linear infinite',
        'float':         'float 4s ease-in-out infinite',
        'pulse-soft':    'pulse_soft 2s ease-in-out infinite',
        'spin-slow':     'spin_slow 3s linear infinite',
        'scale-in':      'scale_in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up':      'slide_up 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-soft':   'bounce_soft 1s ease-in-out',
        'fade-in':       'fade_in 0.3s ease-out',
        'ripple':        'ripple 0.6s linear',
        'wipe-in-right': 'wipe_in_right 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      },

      /* ==================== 过渡曲线 ==================== */
      transitionTimingFunction: {
        'spring':   'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth':   'cubic-bezier(0.16, 1, 0.3, 1)',
        'decel':    'cubic-bezier(0, 0, 0.2, 1)',
      },

      /* ==================== 背景图案 ==================== */
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh':   'linear-gradient(135deg, #fff7f5 0%, #f8f6ff 25%, #f4faff 50%, #f2fdf7 75%, #fffef5 100%)',
      },

      /* ==================== 间距扩展 ==================== */
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
        '26':  '6.5rem',
        '88':  '22rem',
        '92':  '23rem',
        '96':  '24rem',
        '100': '25rem',
      },

      /* ==================== 高度扩展 ==================== */
      height: {
        'screen-safe': 'calc(100dvh - env(safe-area-inset-bottom))',
      },

      /* ==================== z-index ==================== */
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
};
