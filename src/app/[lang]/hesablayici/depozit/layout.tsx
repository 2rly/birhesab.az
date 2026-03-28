import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("depozit");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
