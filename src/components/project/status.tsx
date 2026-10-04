import { LiveDot } from "@/components/ui/live-dot";
import type { ProjectStatus } from "@/lib/content/schema";
import { STATUS_LABEL } from "./format";

/** Project status; work in progress gets the pulsing live dot. */
export function Status({ status }: { status: ProjectStatus }) {
  if (status !== "active") return <>{STATUS_LABEL[status]}</>;
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <LiveDot className="text-accent" />
      {STATUS_LABEL[status]}
    </span>
  );
}
