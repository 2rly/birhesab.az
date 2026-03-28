import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("herbi-xidmet");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
