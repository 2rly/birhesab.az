import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("universitet-qebul");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
