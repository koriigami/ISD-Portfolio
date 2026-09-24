import type { BookOptions, SketchbookPage } from '@kagadmodyaa/sketchbook'

/* The shape of portfolio.config.ts. You shouldn't need to edit this file;
   it only exists so your editor can autocomplete and check the config. */

export type Project = {
  /** Short id used in the web address: /projects/courtyard-cafe */
  slug: string
  title: string
  year?: string
  location?: string
  /** e.g. "Commercial", "Residential", "Exhibition" */
  type?: string
  area?: string
  /** One or two sentences. Shown on the landing page and the project page. */
  summary: string
  /** Longer text for the project page. Each string is one paragraph. */
  story?: string[]
  /** Extra images for the project page (the book's pages are shown too). */
  images?: { src: string; alt: string; caption?: string }[]
  /** Colour of this project's index tab on the book. */
  color?: string
}

export type PortfolioConfig = {
  site: {
    /** Shown in the browser tab and in search results. */
    title: string
    description: string
  }
  student: {
    name: string
    /** One line under your name, e.g. "Interior Space Design, Semester 6". */
    tagline: string
    location?: string
    email?: string
    /** Paragraphs for the About section. */
    about: string[]
    links?: { label: string; href: string }[]
  }
  theme: {
    /** Page background behind everything. */
    background: string
    /** Main text colour. */
    ink: string
    /** One accent colour for links and details. */
    accent: string
    fonts: {
      /** Any Google Fonts family name, e.g. "Instrument Serif", "Fraunces", "DM Serif Display". */
      display: string
      /** Any Google Fonts family name, e.g. "Inter", "DM Sans", "Work Sans". */
      body: string
    }
  }
  book: BookOptions
  pages: SketchbookPage[]
  projects: Project[]
}

export const defineConfig = (c: PortfolioConfig) => c
