import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("issizlik-muavineti");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
