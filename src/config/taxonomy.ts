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
 * To add a new technology, add one line to TECH below.
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
  /** Shown as a top-level filter chip in the Work explorer. */
  primary?: boolean;
};

export const TECH = {
  // Engines
  unreal: { label: "Unreal Engine", group: "engine", primary: true },
  unity: { label: "Unity", group: "engine", primary: true },
  godot: { label: "Godot", group: "engine", primary: true },

  // Languages
  cpp: { label: "C++", group: "language", primary: true },
  csharp: { label: "C#", group: "language", primary: true },
  hlsl: { label: "HLSL", group: "language", primary: true },
  glsl: { label: "GLSL", group: "language" },
  shaderlab: { label: "ShaderLab", group: "language" },
  gdscript: { label: "GDScript", group: "language" },
  blueprint: { label: "Blueprint", group: "language" },
  python: { label: "Python", group: "language", primary: true },

  // Graphics techniques
  "compute-shaders": { label: "Compute Shaders", group: "graphics", primary: true },
  rdg: { label: "Render Graph (RDG)", group: "graphics" },
  "ray-tracing": { label: "Ray Tracing", group: "graphics" },
  "ray-marching": { label: "Ray Marching", group: "graphics" },
  "post-processing": { label: "Post-Processing", group: "graphics" },
  "stencil-buffer": { label: "Stencil Buffer", group: "graphics" },
  materials: { label: "Material Graphs", group: "graphics" },
  niagara: { label: "Niagara VFX", group: "graphics" },
  pcg: { label: "PCG", group: "graphics" },
  "gpu-simulation": { label: "GPU Simulation", group: "graphics", primary: true },
  "procedural-generation": { label: "Procedural Generation", group: "graphics" },

  // Platforms
  vr: { label: "VR", group: "platform", primary: true },
  ar: { label: "AR / Passthrough", group: "platform" },
  "meta-quest": { label: "Meta Quest 3", group: "platform" },
  multiplayer: { label: "Multiplayer", group: "platform", primary: true },
  webgl: { label: "WebGL", group: "platform" },
  android: { label: "Android", group: "platform" },

  // AI / robotics
  ros2: { label: "ROS 2", group: "ai" },
  llm: { label: "Local LLMs", group: "ai" },
  "speech-recognition": { label: "Speech Recognition", group: "ai" },
  "computer-vision": { label: "Computer Vision", group: "ai" },
  docker: { label: "Docker", group: "ai" },
  "dgx-spark": { label: "NVIDIA DGX Spark", group: "ai" },

  // Production
  touchdesigner: { label: "TouchDesigner", group: "production" },
  "motion-capture": { label: "Motion Capture", group: "production" },
  dmx: { label: "DMX Lighting", group: "production" },
  "led-volume": { label: "LED Volume", group: "production" },
  photogrammetry: { label: "Photogrammetry", group: "production" },
  "gaussian-splatting": { label: "Gaussian Splatting", group: "production" },
  cinemachine: { label: "Cinemachine", group: "production" },
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

export function isCategoryId(value: string): value is CategoryId {
  return categoryById.has(value);
}

export function isTechId(value: string): value is TechId {
  return value in TECH;
}
