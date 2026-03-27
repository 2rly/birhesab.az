import { getCalculatorMetadata } from "@/lib/seo";

export const metadata = getCalculatorMetadata("muellim-mezuniyyet");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
