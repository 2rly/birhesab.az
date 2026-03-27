import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("qida-kalori");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
