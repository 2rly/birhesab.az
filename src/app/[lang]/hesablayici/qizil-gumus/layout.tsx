import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("qizil-gumus");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
