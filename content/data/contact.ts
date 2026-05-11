export interface ContactLink {
  id: string
  label: string
  value: string
  href: string
  icon: string
  download?: boolean
}

export const contactLinks: ContactLink[] = [
  {
    id: 'email',
    label: 'Email',
    value: 'contact-me@mahesh-cheemalapati.com',
    href: 'mailto:contact-me@mahesh-cheemalapati.com',
    icon: '✉',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    value: 'linkedin.com/in/mahesh-cheemalapati',
    href: 'https://www.linkedin.com/in/mahesh-cheemalapati',
    icon: 'in',
  },
  {
    id: 'github',
    label: 'GitHub',
    value: 'github.com/Mahesh-Cheemalapati',
    href: 'https://github.com/Mahesh-Cheemalapati',
    icon: '⌥',
  },
  {
    id: 'blog',
    label: 'Blog',
    value: 'dev.to/mcheemalapati',
    href: 'https://dev.to/mcheemalapati',
    icon: '✏',
  },
  {
    id: 'resume',
    label: 'Resume',
    value: 'Download PDF',
    href: '/mc_resume.pdf',
    icon: '↓',
    download: true,
  },
]
