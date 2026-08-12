import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("ixtisas-kodlari");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
