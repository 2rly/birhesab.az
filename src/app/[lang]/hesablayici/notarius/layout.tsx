import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("notarius");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
