import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("sat");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
