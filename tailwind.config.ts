import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 主色系统 - 温暖智能蓝
        primary: {
          50: '#F0F4FF',
          100: '#E0E9FF',
          200: '#C2D6FF',
          300: '#8FAFFF',
          400: '#5C88FF',
          500: '#3366FF', // 主色
          600: '#2952CC',
          700: '#1F3D99',
          800: '#162966',
          900: '#0C1633',
          DEFAULT: '#3366FF',
          foreground: '#FFFFFF',
        },
        // 辅助色系统 - 温暖橙
        secondary: {
          50: '#FFF8F0',
          100: '#FFEDD6',
          200: '#FFD9AD',
          300: '#FFC285',
          400: '#FFAA5C',
          500: '#FF9133', // 辅助色
          600: '#E67A1F',
          700: '#B35F18',
          800: '#804310',
          900: '#4D2809',
          DEFAULT: '#FF9133',
          foreground: '#FFFFFF',
        },
        // 中性色系统
        neutral: {
          50: '#FAFBFC',
          100: '#F4F6F8',
          200: '#E8ECEF',
          300: '#D1D9E0',
          400: '#B3BFC9',
          500: '#8596A3',
          600: '#5E6C7A',
          700: '#3D4852',
          800: '#232A31',
          900: '#0F1419',
          DEFAULT: '#8596A3',
        },
        // 语义色系统
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          DEFAULT: '#10B981',
          foreground: '#FFFFFF',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          DEFAULT: '#F59E0B',
          foreground: '#FFFFFF',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        info: {
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
          DEFAULT: '#06B6D4',
          foreground: '#FFFFFF',
        },
        // 特殊渐变色
        gradient: {
          ai: {
            from: '#6366F1',
            to: '#8B5CF6',
          },
          warm: {
            from: '#FF9133',
            to: '#FF6B9D',
          },
        },
        // 语义化颜色（用于 shadcn/ui 兼容）
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        sans: [
          'PingFang SC',
          'Noto Sans SC',
          'Microsoft YaHei',
          'Hiragino Sans GB',
          'sans-serif',
        ],
        display: [
          'Inter',
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Consolas',
          'monospace',
        ],
      },
      fontSize: {
        // 标题字号
        'display-lg': ['3rem', { lineHeight: '3.5rem', letterSpacing: '-0.02em', fontWeight: '700' }],       // 48px
        'display-md': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '-0.01em', fontWeight: '700' }],   // 36px
        'heading-lg': ['1.875rem', { lineHeight: '2.375rem', letterSpacing: '-0.01em', fontWeight: '600' }], // 30px
        'heading-md': ['1.5rem', { lineHeight: '2rem', letterSpacing: '0', fontWeight: '600' }],             // 24px
        'heading-sm': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '0', fontWeight: '600' }],         // 20px
        'heading-xs': ['1.125rem', { lineHeight: '1.625rem', letterSpacing: '0', fontWeight: '600' }],       // 18px
        // 正文字号
        'body-lg': ['1rem', { lineHeight: '1.625rem', letterSpacing: '0', fontWeight: '400' }],              // 16px
        'body': ['0.875rem', { lineHeight: '1.375rem', letterSpacing: '0', fontWeight: '400' }],             // 14px
        'body-sm': ['0.8125rem', { lineHeight: '1.25rem', letterSpacing: '0', fontWeight: '400' }],          // 13px
        'caption': ['0.75rem', { lineHeight: '1.125rem', letterSpacing: '0.01em', fontWeight: '400' }],      // 12px
        'overline': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.08em', fontWeight: '500' }],       // 11px
      },
      spacing: {
        // 扩展间距系统（基于 4px）
        '0': '0px',
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px - 标准间距
        '5': '1.25rem',   // 20px
        '6': '1.5rem',    // 24px
        '7': '1.75rem',   // 28px
        '8': '2rem',      // 32px
        '9': '2.25rem',   // 36px
        '10': '2.5rem',   // 40px
        '11': '2.75rem',  // 44px
        '12': '3rem',     // 48px
        '14': '3.5rem',   // 56px
        '16': '4rem',     // 64px
        '20': '5rem',     // 80px
        '24': '6rem',     // 96px
        '28': '7rem',     // 112px
        '32': '8rem',     // 128px
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',     // 4px
        DEFAULT: '0.5rem', // 8px - 标准圆角
        md: '0.75rem',     // 12px
        lg: '1rem',        // 16px
        xl: '1.25rem',     // 20px
        '2xl': '1.5rem',   // 24px
        '3xl': '2rem',     // 32px
        full: '9999px',
      },
      boxShadow: {
        // 阴影系统
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)', // 标准阴影
        md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '2xl': '0 30px 60px -15px rgba(0, 0, 0, 0.3)',
        // 彩色阴影
        'primary': '0 10px 40px -10px rgba(51, 102, 255, 0.3)',
        'secondary': '0 10px 40px -10px rgba(255, 145, 51, 0.3)',
        'ai': '0 10px 40px -10px rgba(99, 102, 241, 0.3)',
        // 内阴影
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'inner-focus': 'inset 0 0 0 2px rgba(51, 102, 255, 0.2)',
        none: 'none',
      },
      transitionDuration: {
        fast: '100ms',
        DEFAULT: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-in-out',
        'fade-out': 'fadeOut 200ms ease-in-out',
        'slide-in-up': 'slideInUp 300ms ease-out',
        'slide-in-down': 'slideInDown 300ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
