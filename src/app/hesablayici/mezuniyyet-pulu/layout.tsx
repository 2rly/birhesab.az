import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("mezuniyyet-pulu");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
