
export interface ProductType {
    id: number;
    name: string;
    url: string;
    categoriesId: number;
    price: number;
    images: string[];
    description?: string;
    bestSeller?: boolean;
    outstanding?: boolean;
    limited?: boolean;
    [key: string]: boolean | number | string | string[] | undefined;
}