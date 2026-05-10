export interface AnimeTheme {
  bg: string
  bg2: string
  ink: string
  acc: string
  acc2: string
  border: string
  borderAcc: string
}

export interface ChapterConfig {
  id: number
  slug: string
  navLabel: string
  series: string
  episodeTitle: string
  episodeSubtitle: string
  bgJpText: string
  theme: AnimeTheme
  contentFile: string
  hidden?: boolean
}

export const chapters: ChapterConfig[] = [
  {
    id: 0,
    slug: 'home',
    navLabel: 'Home',
    series: 'Hunter x Hunter',
    episodeTitle: 'The Engineer Who Builds Worlds',
    episodeSubtitle: 'Every great story starts with a choice',
    bgJpText: 'ハンター',
    theme: {
      bg: '#f5f0e8',
      bg2: '#ede8df',
      ink: '#2a2520',
      acc: '#b8860b',
      acc2: '#4a7a3a',
      border: 'rgba(42,37,32,0.1)',
      borderAcc: 'rgba(184,134,11,0.25)',
    },
    contentFile: 'ch00.md',
  },
  {
    id: 1,
    slug: 'work',
    navLabel: 'Work',
    series: 'Dragon Ball Z',
    episodeTitle: 'When the System Pushed Back',
    episodeSubtitle: 'These are not metrics. These are victories.',
    bgJpText: '戦闘力',
    theme: {
      bg: '#eef2f8',
      bg2: '#e4eaf4',
      ink: '#0c1828',
      acc: '#b89000',
      acc2: '#1a60c0',
      border: 'rgba(12,24,40,0.08)',
      borderAcc: 'rgba(184,144,0,0.2)',
    },
    contentFile: 'ch01.md',
  },
  {
    id: 2,
    slug: 'skills',
    navLabel: 'Skills',
    series: 'Hajime no Ippo',
    episodeTitle: 'Every Tool Earned in Battle',
    episodeSubtitle: 'Not a checklist. A record of things used under pressure.',
    bgJpText: '武器',
    theme: {
      bg: '#f8f2e8',
      bg2: '#ede6d8',
      ink: '#201408',
      acc: '#a05800',
      acc2: '#8a2020',
      border: 'rgba(32,20,8,0.08)',
      borderAcc: 'rgba(160,88,0,0.2)',
    },
    contentFile: 'ch02.md',
  },
  {
    id: 3,
    slug: 'contact',
    navLabel: 'Contact',
    series: 'Naruto',
    episodeTitle: 'The Final Round',
    episodeSubtitle: 'Step forward. Make contact.',
    bgJpText: '連絡',
    theme: {
      bg: '#faf5ee',
      bg2: '#f2ebe0',
      ink: '#28200c',
      acc: '#c45000',
      acc2: '#3a60a0',
      border: 'rgba(40,32,12,0.09)',
      borderAcc: 'rgba(196,80,0,0.22)',
    },
    contentFile: 'ch03.md',
  },
  {
    id: 4,
    slug: 'bonus',
    navLabel: '✦',
    series: 'Zom 100',
    episodeTitle: "Wait — There's More",
    episodeSubtitle: 'The side of Mahesh the resume never shows',
    bgJpText: '自由',
    theme: {
      bg: '#f2f0f8',
      bg2: '#eae8f4',
      ink: '#180820',
      acc: '#900080',
      acc2: '#206040',
      border: 'rgba(24,8,32,0.08)',
      borderAcc: 'rgba(144,0,128,0.2)',
    },
    contentFile: 'ch04.md',
    hidden: true,
  },
]
