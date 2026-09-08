/** Seller identity and policy confirmed by the owner on 8 September 2026. */
export const SELLER = {
  brand: "Vladasana",
  name: "Vladyslava Kandyba",
  country: "Ukraine",
  countryCode: "UA",
  supportEmail: "support@vladasana.com",
  refundDays: 7,
} as const;
export const PRODUCT = {
  name: "The Developer Job Search Playbook",
  price: 19,
  amount: 1900,
  currency: "USD",
} as const;
export const GUIDES = [
  {
    slug: "01-cv-unrejectable",
    title: "CV preparation",
    pages: 10,
    benefit: "Make your experience relevant.",
    description:
      "Tailor your CV to the role and give a hiring team clearer reasons to talk to you.",
  },
  {
    slug: "02-behavioral-guide",
    title: "Behavioral interviews",
    pages: 23,
    benefit: "Turn experience into answers.",
    description:
      "Build clear examples from your own work and practise explaining your decisions.",
  },
  {
    slug: "03-questions-guide",
    title: "Questions for interviewers",
    pages: 15,
    benefit: "Make it a real conversation.",
    description:
      "Prepare useful questions about the role, the team, and how they work.",
  },
  {
    slug: "04-js-guide",
    title: "JavaScript",
    pages: 24,
    benefit: "Explain the fundamentals.",
    description:
      "Refresh JavaScript concepts and practise answers you can explain without your notes.",
  },
  {
    slug: "05-react-guide",
    title: "React",
    pages: 24,
    benefit: "Go beyond memorised answers.",
    description:
      "Revisit React concepts, then test what you understand with practical exercises.",
  },
  {
    slug: "06-big-o-guide",
    title: "Big O & complexity",
    pages: 23,
    benefit: "Explain your trade-offs.",
    description:
      "Build confidence discussing the time and space costs of an approach.",
  },
  {
    slug: "07-api-guide",
    title: "APIs",
    pages: 20,
    benefit: "Connect the pieces.",
    description:
      "Review API concepts and practise explaining how systems communicate.",
  },
  {
    slug: "08-db-guide",
    title: "Databases",
    pages: 24,
    benefit: "Make better data decisions.",
    description:
      "Revisit database concepts and prepare to discuss the choices behind your work.",
  },
  {
    slug: "09-sql-guide",
    title: "SQL",
    pages: 25,
    benefit: "Turn knowledge into queries.",
    description:
      "Refresh SQL essentials and practise producing an answer instead of just rereading one.",
  },
  {
    slug: "10-git-guide",
    title: "Git",
    pages: 25,
    benefit: "Talk through your workflow.",
    description:
      "Review Git concepts and prepare to explain how you manage changes and collaborate.",
  },
  {
    slug: "11-docker-guide",
    title: "Docker",
    pages: 24,
    benefit: "Understand what you ship.",
    description:
      "Review container fundamentals and practise explaining where Docker fits in a project.",
  },
  {
    slug: "12-system-design",
    title: "System design",
    pages: 22,
    benefit: "Show how you think.",
    description:
      "Structure a system-design discussion and explain your reasoning and trade-offs.",
  },
] as const;
