import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("kvadratmetr");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
