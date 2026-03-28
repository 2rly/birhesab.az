import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("avtomobil-kredit");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
