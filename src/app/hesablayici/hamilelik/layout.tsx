import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("hamilelik");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
