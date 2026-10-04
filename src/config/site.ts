/**
 * Identity, contact links and homepage copy.
 *
 * Every component reads from here — never hardcode a name, URL or email in a
 * component. Edit this file to change what the whole site says about you.
 */
export const site = {
  name: "Matin Esmaeili",
  shortName: "Matin",
  url: "https://matin.cc",
  locale: "en_US",

  /** Shown under the name on the homepage, in order. */
  roles: [
    "Graphics / Rendering Engineer",
    "Technical Artist",
    "Real-Time Simulation Developer",
  ],

  /** One or two sentences. Homepage hero + default meta description. */
  tagline:
    "I build GPU simulation, rendering tools and real-time digital twins in Unreal Engine, Unity and Godot — compute shaders, XR, and the maths that holds them together.",

  /** Homepage "About" strip. The full story lives in content/about.mdx. */
  bio: "I'm a graphics programmer and technical artist working where rendering, simulation and interaction meet: GPU compute in Unreal Engine, VR/AR digital twins for training and industry, and engine-driven robotics.",

  /** Used for <meta name="description"> where a page has nothing better. */
  description:
    "Portfolio of Matin Esmaeili — graphics programming, rendering engineering and technical art. Compute shaders, GPU simulation, XR digital twins, robotics and games in Unreal Engine, Unity and Godot.",

  email: "matin.esmaeili98@gmail.com",

  /**
   * Résumé PDF in /public. Set to null to hide every résumé link.
   * The link is also hidden automatically if the file doesn't exist.
   */
  resume: "/resume.pdf" as string | null,

  github: {
    username: "MatinEsmaeili00",
    url: "https://github.com/MatinEsmaeili00",
  },

  /** Optional reel shown from the homepage hero (click-to-play). null hides it. */
  showreel: { youtube: "Co1fk8n9_bM", title: "Portfolio reel" } as { youtube: string; title: string } | null,

  youtube: {
    handle: "@MatinEsmaeili_00",
    url: "https://www.youtube.com/@MatinEsmaeili_00",
    channelId: "UCxh6EKi9_EWSRgClrSjmEiA",
  },

  /** Professional links, rendered in this order in the footer and About page. */
  social: [
    { label: "GitHub", href: "https://github.com/MatinEsmaeili00" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/matinesmaeili/" },
    { label: "YouTube", href: "https://www.youtube.com/@MatinEsmaeili_00" },
    { label: "itch.io", href: "https://m4tin.itch.io" },
  ],
} as const;

export type Site = typeof site;
