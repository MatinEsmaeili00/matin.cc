import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cmsMode } from "@/lib/cms";
import KeystaticApp from "./keystatic";

export const metadata: Metadata = { title: "Content editor", robots: { index: false, follow: false } };

/** The CMS. Only exists in development or with Keystatic's GitHub mode configured (see lib/cms.ts). */
export default function KeystaticLayout() {
  if (!cmsMode()) notFound();
  return <KeystaticApp />;
}
