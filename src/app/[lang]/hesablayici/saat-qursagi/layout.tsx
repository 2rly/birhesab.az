import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("saat-qursagi");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
