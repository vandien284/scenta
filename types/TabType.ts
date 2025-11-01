import { ProductType } from "./ProductType";

export interface TabType {
  id: number;
  tag: keyof ProductType;
  title: string;
}
