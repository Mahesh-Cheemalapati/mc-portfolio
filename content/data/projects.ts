export interface ProjectImpact {
  metric: string
  label: string
}

export interface Project {
  id: string
  title: string
  year: string | { from: string; to: string }
  impact: ProjectImpact
  technologies: string[]
  narrative: string
  featured: boolean
}

export const projects: Project[] = [
  {
    id: 'healthcare-platform',
    title: 'Healthcare Platform at Scale',
    year: { from: '2023', to: 'Present' },
    impact: {
      metric: '50%',
      label: 'reduction in API call volume',
    },
    technologies: ['Vue', 'ASP.NET Core', 'GraphQL', 'Azure', 'Kubernetes', 'Micro Frontend'],
    narrative:
      'Worked across a large-scale Medicare and Medicaid platform with 15 engineering teams. Reduced API traffic from 1 million to 400K daily calls through GraphQL optimization and API layer improvements. Led an AI-powered search feature from proof of concept to production deployment.',
    featured: true,
  },
  {
    id: 'ai-search',
    title: 'AI-Powered Search — POC to Production',
    year: '2024',
    impact: {
      metric: 'POC→Prod',
      label: 'shipped safely to millions of users',
    },
    technologies: ['AI/ML', 'Feature Flags', 'Phased Rollout', 'Observability'],
    narrative:
      'Designed and led the full rollout of an AI-driven search capability. Built the phased deployment strategy, benchmarked performance at every stage, and ensured safe adoption at scale. First production AI feature in the domain.',
    featured: true,
  },
  {
    id: 'vendor-management-tool',
    title: 'Internal Tooling — Solo End to End',
    year: { from: '2021', to: '2023' },
    impact: {
      metric: '40%',
      label: 'reduction in manual operational effort',
    },
    technologies: ['Angular', 'Python', 'GCP', 'GoogleSQL', 'AppsScript'],
    narrative:
      'Sole engineer on an internal tool for a large technology company. Owned architecture, development, and deployment. Built the first Angular and Python application for the team, automated reporting workflows, and led a security compliance upgrade from Level 3 to Level 4.',
    featured: true,
  },
  {
    id: 'billing-platform',
    title: 'Healthcare Payments Platform',
    year: { from: '2020', to: '2021' },
    impact: {
      metric: '90%',
      label: 'test coverage achieved',
    },
    technologies: ['Angular', 'ASP.NET Core', 'Azure', 'CI/CD'],
    narrative:
      'Worked on a billing platform enabling members to make premium payments securely. Payment-critical systems demand reliability and zero ambiguity — built and maintained to that standard.',
    featured: false,
  },
  {
    id: 'ai-mc-portfolio',
    title: 'This Portfolio and AI-MC Chatbot',
    year: '2025',
    impact: {
      metric: '100%',
      label: 'self-hosted on a Raspberry Pi',
    },
    technologies: ['Astro', 'FastAPI', 'LangChain', 'Pinecone', 'Docker', 'Raspberry Pi'],
    narrative:
      'Built this portfolio and the RAG-powered chatbot from scratch. Self-hosted on a Raspberry Pi 5 using Docker Compose. The chatbot answers questions grounded strictly on resume and context data — no hallucinations, no invented information.',
    featured: true,
  },
]
