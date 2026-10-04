import { getCategory, techLabel, type CategoryId, type TechId } from "@/config/taxonomy";
import type { ProjectStatus } from "@/lib/content/schema";

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  shipped: "Shipped",
  active: "In development",
  prototype: "Prototype",
  archived: "Archived",
};

export function teamLabel(teamSize?: number): string | null {
  if (!teamSize) return null;
  return teamSize === 1 ? "Solo" : `Team of ${teamSize}`;
}

export function techLabels(tech: TechId[], limit?: number): string[] {
  const labels = tech.map(techLabel);
  return limit ? labels.slice(0, limit) : labels;
}

export function categoryLabels(categories: CategoryId[]): string[] {
  return categories.map((c) => getCategory(c).label);
}
