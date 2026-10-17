import localFont from 'next/font/local';
import { cn } from '@/lib/utils';

// Preserve the upstream families, weights and CSS variables using pinned local Latin assets.
const fontSans = localFont({
  src: [
    { path: './fonts/geist/latin-100-900.woff2', weight: '100 900', style: 'normal' }
  ],
  display: 'swap',
  variable: '--font-sans',
  adjustFontFallback: 'Arial',
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }]
});

const fontMono = localFont({
  src: [
    { path: './fonts/geist-mono/latin-100-900.woff2', weight: '100 900', style: 'normal' }
  ],
  display: 'swap',
  variable: '--font-mono',
  adjustFontFallback: 'Arial',
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }]
});

const fontGoogleSansFlex = localFont({
  src: [
    { path: './fonts/google-sans-flex/latin-1-1000.woff2', weight: '1 1000', style: 'normal' }
  ],
  display: 'swap',
  variable: '--font-google-sans-flex',
  adjustFontFallback: 'Arial',
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }]
});

const fontSourceCodePro = localFont({
  src: [
    { path: './fonts/source-code-pro/latin-200-900.woff2', weight: '200 900', style: 'normal' }
  ],
  display: 'swap',
  variable: '--font-source-code-pro',
  adjustFontFallback: 'Arial',
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }]
});

const fontInstrument = localFont({
  src: [
    { path: './fonts/instrument-sans/latin-400-700.woff2', weight: '400 700', style: 'normal' }
  ],
  display: 'swap',
  variable: '--font-instrument',
  adjustFontFallback: 'Arial',
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }]
});

const fontNotoMono = localFont({
  src: [
    { path: './fonts/noto-sans-mono/latin-100-900.woff2', weight: '100 900', style: 'normal' }
  ],
  display: 'swap',
  variable: '--font-noto-mono',
  adjustFontFallback: 'Arial',
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }]
});

const fontMullish = localFont({
  src: [
    { path: './fonts/mulish/latin-200-1000.woff2', weight: '200 1000', style: 'normal' }
  ],
  display: 'swap',
  variable: '--font-mullish',
  adjustFontFallback: 'Arial',
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }]
});

const fontInter = localFont({
  src: [
    { path: './fonts/inter/latin-100-900.woff2', weight: '100 900', style: 'normal' }
  ],
  display: 'swap',
  variable: '--font-inter',
  adjustFontFallback: 'Arial',
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }]
});

const fontArchitectsDaughter = localFont({
  src: [
    { path: './fonts/architects-daughter/latin-400.woff2', weight: '400', style: 'normal' }
  ],
  display: 'swap',
  variable: '--font-architects-daughter',
  adjustFontFallback: 'Arial',
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }]
});

const fontDMSans = localFont({
  src: [
    { path: './fonts/dm-sans/latin-100-1000.woff2', weight: '100 1000', style: 'normal' }
  ],
  display: 'swap',
  variable: '--font-dm-sans',
  adjustFontFallback: 'Arial',
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }]
});

const fontFiraCode = localFont({
  src: [
    { path: './fonts/fira-code/latin-300-700.woff2', weight: '300 700', style: 'normal' }
  ],
  display: 'swap',
  variable: '--font-fira-code',
  adjustFontFallback: 'Arial',
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }]
});

const fontOutfit = localFont({
  src: [
    { path: './fonts/outfit/latin-100-900.woff2', weight: '100 900', style: 'normal' }
  ],
  display: 'swap',
  variable: '--font-outfit',
  adjustFontFallback: 'Arial',
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }]
});

const fontSpaceMono = localFont({
  src: [
    { path: './fonts/space-mono/latin-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/space-mono/latin-700.woff2', weight: '700', style: 'normal' }
  ],
  display: 'swap',
  variable: '--font-space-mono',
  adjustFontFallback: 'Arial',
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }]
});

const fontJetBrainsMono = localFont({
  src: [
    { path: './fonts/jetbrains-mono/latin-100-800.woff2', weight: '100 800', style: 'normal' }
  ],
  display: 'swap',
  variable: '--font-jetbrains-mono',
  adjustFontFallback: 'Arial',
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }]
});

const fontMerriweather = localFont({
  src: [
    { path: './fonts/merriweather/latin-300.woff2', weight: '300', style: 'normal' },
    { path: './fonts/merriweather/latin-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/merriweather/latin-700.woff2', weight: '700', style: 'normal' }
  ],
  display: 'swap',
  variable: '--font-merriweather',
  adjustFontFallback: 'Times New Roman',
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }]
});

const fontPlayfairDisplay = localFont({
  src: [
    { path: './fonts/playfair-display/latin-400-900.woff2', weight: '400 900', style: 'normal' }
  ],
  display: 'swap',
  variable: '--font-playfair-display',
  adjustFontFallback: 'Times New Roman',
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }]
});

export const fontVariables = cn(
  fontSans.variable,
  fontMono.variable,
  fontGoogleSansFlex.variable,
  fontSourceCodePro.variable,
  fontInstrument.variable,
  fontNotoMono.variable,
  fontMullish.variable,
  fontInter.variable,
  fontArchitectsDaughter.variable,
  fontDMSans.variable,
  fontFiraCode.variable,
  fontOutfit.variable,
  fontSpaceMono.variable,
  fontJetBrainsMono.variable,
  fontMerriweather.variable,
  fontPlayfairDisplay.variable
);
