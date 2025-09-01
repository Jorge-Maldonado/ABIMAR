import { Injectable } from '@angular/core';

// Category Interface
export interface ICategory {
  id: number,
  name: string,
  image: string,
}

// Product Interface
export interface IProduct {
  id: number,
  name: string,
  price: number,
  image: string,
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  getCategories() {
    let categories = [];

    let cat1: ICategory = {
      id: 1,
      name: 'Parlantes',
      image: '/ABIMAR/assets/categories/category-1.png'
    }
    let cat2: ICategory = {
      id: 2,
      name: 'Audifonos',
      image: '/ABIMAR/assets/categories/category-2.png'
    }
    let cat3: ICategory = {
      id: 3,
      name: 'Cargadores',
      image: '/ABIMAR/assets/categories/category-3.png'
    }

    categories.push(cat1, cat2, cat3);

    return categories;
  }

  getFeaturedProducts() {
    let products = [];

    let prod1: IProduct = {
      id: 1,
      name: 'Cargador Portatil',
      price: 55,
      image: '/ABIMAR/assets/products/prod-1.png'
    }
    let prod2: IProduct = {
      id: 2,
      name: 'Cargador',
      price: 34,
      image: '/ABIMAR/assets/products/prod-2.png'
    }
    let prod3: IProduct = {
      id: 1,
      name: 'Parlante',
      price: 40,
      image: '/ABIMAR/assets/products/prod-3.png'
    }

    products.push(prod1, prod2, prod3);

    return products;
  }

  getBestSellProducts() {
    let products = [];

    let prod1: IProduct = {
      id: 1,
      name: 'Audifonos',
      price: 55,
      image: '/ABIMAR/assets/products/prod-4.png'
    }
    let prod2: IProduct = {
      id: 2,
      name: 'Cargador Automovil',
      price: 34,
      image: '/ABIMAR/assets/products/prod-5.png'
    }
    let prod3: IProduct = {
      id: 1,
      name: 'Audifonos',
      price: 40,
      image: '/ABIMAR/assets/products/prod-6.png'
    }

    products.push(prod1, prod2, prod3);

    return products;
  }
}
