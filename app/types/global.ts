//Global Types

export interface CategoryType{
    id: string;
    title: string;
    photo: string;
    date?: string | "";
}

export interface ProductType{
    stripeProductId : string, 
    name: string, 
    description: string,
    stock: string,
    price: string,
    category: string,
    photo:  string,
    date?: string | "";
}

export type Address = {
    name: string;
    address: {
        line1: string;
        line2: string | null;
        city: string;
        country: string;
        postal_code: string;
        state: string;
    };
};
