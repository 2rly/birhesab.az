import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("elave-is-saati");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
