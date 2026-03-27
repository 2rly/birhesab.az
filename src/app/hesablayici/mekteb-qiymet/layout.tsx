import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("mekteb-qiymet");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
