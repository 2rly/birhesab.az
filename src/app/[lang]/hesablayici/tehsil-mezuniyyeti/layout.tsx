import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("tehsil-mezuniyyeti");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
