export const appName = 'Resume Editor'
export const appDescription = 'Resume Editor'

export const fontList = [
  {
    name: '默认字体',
    value: 'default',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif, \'Apple Color Emoji\', \'Segoe UI Emoji\', \'Segoe UI Symbol\', \'Noto Color Emoji',
  },
  {
    name: 'Work Sans',
    value: 'Work-Sans',
    assets: '/assets/preview-fonts/Work-Sans.woff2',
  },
  {
    name: '苹果方正',
    value: 'PingFang-Medium-sub',
    assets: '/assets/preview-fonts/PingFang-Medium-sub.ttf',
  },
  {
    name: '思源黑体',
    value: 'SourceHanSansSC-Regular',
    assets: '/assets/preview-fonts/20200203-111651-935f.woff',
  },
  {
    name: 'Times New Roman',
    value: 'Times New Roman',
    assets: '/assets/preview-fonts/TimesNewRoman.ttf',
  },
  {
    name: '阿里巴巴普惠体',
    value: 'AlibabaSans-Regular',
    assets: '/assets/preview-fonts/AlibabaSans-Regular.otf',
  },
]

export const pagePaddingList = [
  {
    name: '16px',
    value: 16,
  },
  {
    name: '20px',
    value: 20,
  },
  {
    name: '24px',
    value: 24,
  },
  {
    name: '32px',
    value: 32,
  },
  {
    name: '36px',
    value: 36,
  },
  {
    name: '40px',
    value: 40,
  },
]

export const WysiwygTags = ['h1', 'h2', 'h3', 'p']

export type WysiwygTagsType = typeof WysiwygTags[number]
