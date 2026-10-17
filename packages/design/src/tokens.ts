/** Native adaptations of UI v1.1: secondary text is raised to readable contrast. */
export const themes = {
  light: { bg:'#ffffff',fg:'#18181b',secondary:'#60606c',line:'#eeeef1',controlLine:'#767680',surface:'#f5f5f7',accent:'#6965d8',error:'#b3261e' },
  dark: { bg:'#111113',fg:'#f2f2f4',secondary:'#b0b0ba',line:'#242429',controlLine:'#888894',surface:'#1c1c21',accent:'#a49df1',error:'#ffb4ab' },
} as const;
export const design = { spacing: { xs:4,sm:8,md:12,lg:16,xl:20,xxl:24 },radius: { input:13,button:22 },
  type: { title:19,body:16,secondary:14 },touch: { ios:44,android:48,web:44 },motion: { page:180,reduced:0 } } as const;
export const themeFor = (theme: string | null | undefined) => theme==='dark' ? themes.dark : themes.light;
