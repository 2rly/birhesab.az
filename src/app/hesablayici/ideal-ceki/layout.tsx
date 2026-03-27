import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("ideal-ceki");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
