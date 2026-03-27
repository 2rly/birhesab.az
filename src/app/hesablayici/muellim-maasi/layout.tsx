import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("muellim-maasi");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
