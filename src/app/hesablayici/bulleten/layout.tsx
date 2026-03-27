import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("bulleten");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
