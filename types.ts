export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

export interface Collection {
  id: number;
  title: string;
  image: string;
}

export interface Occasion {
  id: number;
  label: string;
  iconName: string; // We will map this string to an actual icon component
}

export interface Testimonial {
  id: number;
  name: string;
  quote: string;
}