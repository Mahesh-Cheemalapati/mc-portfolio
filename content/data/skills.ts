export interface SkillGroup {
  category: string
  skills: string[]
}

export const skillGroups: SkillGroup[] = [
  {
    category: 'Frontend',
    skills: [
      'Angular',
      'React',
      'Vue.js',
      'TypeScript',
      'RxJS',
      'NgRx',
      'SAP UI5',
      'Webpack',
      'Storybook',
      'WCAG Accessibility',
    ],
  },
  {
    category: 'Backend & APIs',
    skills: [
      'ASP.NET Core (.NET 8+)',
      'Node.js',
      'Python',
      'Java',
      'GraphQL',
      'REST APIs',
      'Microservices',
    ],
  },
  {
    category: 'Cloud & DevOps',
    skills: [
      'Microsoft Azure',
      'GCP',
      'Docker',
      'Kubernetes',
      'Azure DevOps',
      'CI/CD Pipelines',
      'Blue-Green Deployments',
    ],
  },
  {
    category: 'AI & Data',
    skills: [
      'LangChain',
      'RAG Pipelines',
      'OpenAI API',
      'Pinecone',
      'Prompt Engineering',
      'PostgreSQL',
      'GoogleSQL',
      'MySQL',
    ],
  },
  {
    category: 'Testing & Observability',
    skills: ['Jest', 'Vitest', 'Pytest', 'JUnit', 'TDD', 'Dynatrace', 'Splunk'],
  },
]
