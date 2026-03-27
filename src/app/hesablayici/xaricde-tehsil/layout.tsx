import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("xaricde-tehsil");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
