/**
 * Homepage sections, in display order — modelled on the old site's sections
 * (Developed Games & Tools · Virtual Production · Math · Shaders) plus
 * "In the Lab" for work in progress.
 *
 * Values live in content/settings/home.json (CMS → Homepage). Each project
 * picks one section with its `homeSection` field; projects without one only
 * appear on /work.
 */
import data from "../../content/settings/home.json";

export type HomeSection = {
  id: string;
  title: string;
  /** Small label above the title, e.g. "Currently cooking". */
  eyebrow: string | null;
  blurb: string;
};

type RawSection = { id: string; title: string; eyebrow?: string | null; blurb?: string | null };

export const HOME_SECTIONS: readonly HomeSection[] = (data.sections as RawSection[]).map((s) => ({
  id: s.id,
  title: s.title,
  eyebrow: s.eyebrow?.trim() || null,
  blurb: s.blurb?.trim() || "",
}));

export const HOME_SECTION_IDS = HOME_SECTIONS.map((s) => s.id) as [string, ...string[]];
