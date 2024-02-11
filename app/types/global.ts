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

export interface Order {
    _id?: string;
    orderId: string;
    user: string;
    items: {
      product: string;
      quantity: number;
      _id: string;
    }[];
    status: string;
    address: {
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
    pricing: {
      total: number;
      subtotal: number;
      taxAmount: number;
      shipping: number;
      taxtId: string;
    };
    date: string;
    trackingNumber?: string;
    deliveryDate?: string;
    __v?: number;
  }
