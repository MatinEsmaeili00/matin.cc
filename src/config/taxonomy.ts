/**
 * The controlled vocabulary for projects.
 *
 * `categories` are disciplines — the high-level "what kind of work is this".
 * They live in content/settings/categories.json so they can be edited in the CMS.
 * `tech` is the registry of engines, languages and techniques.
 *
 * Project files reference these by id. Unknown ids fail validation (with a
 * "did you mean" hint), which keeps filters consistent: there is exactly one
 * "Unreal Engine", never "UE5" in one file and "Unreal" in another.
 *
 * To add a new technology, add one line to TECH below (with a colour).
 */
import categoryData from "../../content/settings/categories.json";

export type Category = { id: string; label: string; blurb: string };

/** Disciplines, in display order. Edited in the CMS (Categories) or content/settings/categories.json. */
export const CATEGORIES: readonly Category[] = categoryData.categories;

export type CategoryId = string;

type TechGroup = "engine" | "language" | "graphics" | "platform" | "ai" | "production";

type TechEntry = {
  label: string;
  group: TechGroup;
  /**
   * Tag colour. The brand colour where the tech has one (NVIDIA green, Godot
   * blue, Unreal's near-black), otherwise a hue picked to stay distinct from
   * the tags it usually sits next to. Used for the dot and tint of tech tags;
   * the dark theme lightens it automatically (see .tech-tag in globals.css).
   */
  color: string;
  /** Dark-theme colour, only where lightening isn't enough (Unreal turns white on dark, like its logo). */
  dark?: string;
  /** Shown as a top-level filter chip in the Work explorer. */
  primary?: boolean;
};

export const TECH = {
  // Engines
  unreal: { label: "Unreal Engine", group: "engine", color: "#1e2a4f", dark: "#e6e9f2", primary: true },
  unity: { label: "Unity", group: "engine", color: "#6b7079", primary: true },
  godot: { label: "Godot", group: "engine", color: "#478cbf", primary: true },

  // Languages
  cpp: { label: "C++", group: "language", color: "#e0457b", primary: true },
  csharp: { label: "C#", group: "language", color: "#9b4f96", primary: true },
  hlsl: { label: "HLSL", group: "language", color: "#0f9b8e", primary: true },
  glsl: { label: "GLSL", group: "language", color: "#5586a4" },
  shaderlab: { label: "ShaderLab", group: "language", color: "#3d6b7a" },
  gdscript: { label: "GDScript", group: "language", color: "#355570" },
  blueprint: { label: "Blueprint", group: "language", color: "#2f7de1" },
  python: { label: "Python", group: "language", color: "#d4a017", primary: true },

  // Graphics techniques
  "compute-shaders": { label: "Compute Shaders", group: "graphics", color: "#7c3aed", primary: true },
  rdg: { label: "Render Graph (RDG)", group: "graphics", color: "#4f46e5" },
  "ray-tracing": { label: "Ray Tracing", group: "graphics", color: "#eab308" },
  "ray-marching": { label: "Ray Marching", group: "graphics", color: "#ea580c" },
  "post-processing": { label: "Post-Processing", group: "graphics", color: "#c026d3" },
  "stencil-buffer": { label: "Stencil Buffer", group: "graphics", color: "#64748b" },
  materials: { label: "Material Graphs", group: "graphics", color: "#a16207" },
  niagara: { label: "Niagara VFX", group: "graphics", color: "#f97316" },
  pcg: { label: "PCG", group: "graphics", color: "#16a34a" },
  "gpu-simulation": { label: "GPU Simulation", group: "graphics", color: "#0891b2", primary: true },
  "procedural-generation": { label: "Procedural Generation", group: "graphics", color: "#65a30d" },

  // Platforms
  vr: { label: "VR", group: "platform", color: "#8b5cf6", primary: true },
  ar: { label: "AR / Passthrough", group: "platform", color: "#db2777" },
  "meta-quest": { label: "Meta Quest 3", group: "platform", color: "#0866ff" },
  multiplayer: { label: "Multiplayer", group: "platform", color: "#0ea5e9", primary: true },
  webgl: { label: "WebGL", group: "platform", color: "#c62828" },
  android: { label: "Android", group: "platform", color: "#3ddc84" },

  // AI / robotics
  ros2: { label: "ROS 2", group: "ai", color: "#3b5ba5" },
  llm: { label: "Local LLMs", group: "ai", color: "#d97757" },
  "speech-recognition": { label: "Speech Recognition", group: "ai", color: "#9333ea" },
  "computer-vision": { label: "Computer Vision", group: "ai", color: "#14b8a6" },
  docker: { label: "Docker", group: "ai", color: "#2496ed" },
  "dgx-spark": { label: "NVIDIA DGX Spark", group: "ai", color: "#76b900" },

  // Production
  touchdesigner: { label: "TouchDesigner", group: "production", color: "#e5532d" },
  "motion-capture": { label: "Motion Capture", group: "production", color: "#e11d48" },
  dmx: { label: "DMX Lighting", group: "production", color: "#f59e0b" },
  "led-volume": { label: "LED Volume", group: "production", color: "#06b6d4" },
  photogrammetry: { label: "Photogrammetry", group: "production", color: "#8b6a3e" },
  "gaussian-splatting": { label: "Gaussian Splatting", group: "production", color: "#d946ef" },
  cinemachine: { label: "Cinemachine", group: "production", color: "#8a8f98" },
} as const satisfies Record<string, TechEntry>;

export type TechId = keyof typeof TECH;

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as [string, ...string[]];
export const TECH_IDS = Object.keys(TECH) as [TechId, ...TechId[]];

const categoryById = new Map<string, Category>(CATEGORIES.map((c) => [c.id, c]));

/** Unknown ids (e.g. a category deleted in the CMS) fall back to a readable label. */
export function getCategory(id: CategoryId): Category {
  return categoryById.get(id) ?? { id, label: id, blurb: "" };
}

export function techLabel(id: TechId): string {
  return TECH[id].label;
}

export function techColor(id: TechId): { color: string; dark?: string } {
  const t: TechEntry = TECH[id];
  return { color: t.color, dark: t.dark };
}

export function isCategoryId(value: string): value is CategoryId {
  return categoryById.has(value);
}

export function isTechId(value: string): value is TechId {
  return value in TECH;
}
