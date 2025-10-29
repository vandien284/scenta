
export interface ProductType {
    id: number;
    name: string;
    categoriesId: number;
    price: number;
    image: string;
    description?: string;
    bestSeller?: boolean;
    outstanding?: boolean;
    limited?: boolean;
}