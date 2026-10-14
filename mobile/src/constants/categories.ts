export type Category =
  | "all"
  | "finance"
  | "education"
  | "realestate"
  | "automotive"
  | "legal"
  | "health"
  | "daily"
  | "labor"
  | "nutrition"
  | "religion"
  | "metals"
  | "agriculture";

export const categories: { id: Category; name: string; icon: string }[] = [
  { id: "all", name: "Hamısı", icon: "apps" },
  { id: "finance", name: "Maliyyə", icon: "account-balance-wallet" },
  { id: "education", name: "Təhsil", icon: "school" },
  { id: "realestate", name: "Daşınmaz Əmlak", icon: "home" },
  { id: "automotive", name: "Avtomobil", icon: "directions-car" },
  { id: "legal", name: "Hüquq və Dövlət", icon: "gavel" },
  { id: "health", name: "Sağlamlıq", icon: "favorite" },
  { id: "daily", name: "Gündəlik", icon: "today" },
  { id: "labor", name: "Əmək Hüququ", icon: "work" },
  { id: "nutrition", name: "Qidalanma", icon: "restaurant" },
  { id: "religion", name: "Din", icon: "mosque" },
  { id: "metals", name: "Qiymətli Metallar", icon: "diamond" },
  { id: "agriculture", name: "Kənd Təsərrüfatı", icon: "grass" },
];
