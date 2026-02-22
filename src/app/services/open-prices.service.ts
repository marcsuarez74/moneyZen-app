import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export interface OpenPriceProduct {
  id: number;
  product_name: string;
  brands?: string;
  categories?: string;
  image_url?: string;
}

export interface OpenPrice {
  id: number;
  product_id: number;
  price: number;
  currency: string;
  date: string;
  location_osm_id?: string;
  osm_type?: string;
  price_per?: string;
  price_without_discount?: number;
}

export interface OpenPriceResponse {
  items: OpenPrice[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class OpenPricesService {
  private apiUrl = 'https://prices.openfoodfacts.org/api/v1';

  constructor(private http: HttpClient) {}

  /**
   * Recherche un produit par nom
   */
  searchProduct(productName: string): Observable<OpenPriceProduct[]> {
    return this.http.get<{ items: OpenPriceProduct[] }>(
      `${this.apiUrl}/products?product_name__like=${encodeURIComponent(productName)}&size=5`
    ).pipe(
      map(response => response.items || []),
      catchError(error => {
        console.warn('Open Prices API error:', error);
        return of([]);
      })
    );
  }

  /**
   * Récupère les prix d'un produit
   */
  getProductPrices(productId: number): Observable<OpenPrice[]> {
    return this.http.get<OpenPriceResponse>(
      `${this.apiUrl}/prices?product_id=${productId}&order_by=-date&size=20`
    ).pipe(
      map(response => response.items || []),
      catchError(error => {
        console.warn('Open Prices API error:', error);
        return of([]);
      })
    );
  }

  /**
   * Récupère le prix moyen d'un produit par son nom
   * Retourne null si aucun prix trouvé
   */
  getAveragePriceForProduct(productName: string): Observable<number | null> {
    return this.searchProduct(productName).pipe(
      switchMap(products => {
        if (products.length === 0) {
          return of(null);
        }
        // Prendre le premier produit trouvé
        return this.getProductPrices(products[0].id);
      }),
      map(prices => {
        if (!prices || prices.length === 0) {
          return null;
        }
        
        // Filtrer uniquement les prix en EUR et calculer la moyenne
        const euroPrices = prices
          .filter(p => p.currency === 'EUR')
          .map(p => p.price);
        
        if (euroPrices.length === 0) {
          return null;
        }
        
        const avg = euroPrices.reduce((a, b) => a + b, 0) / euroPrices.length;
        return Math.round(avg * 100) / 100; // Arrondi à 2 décimales
      }),
      catchError(error => {
        console.warn('Error fetching price:', error);
        return of(null);
      })
    );
  }

  /**
   * Version simplifiée qui retourne le prix ou une valeur par défaut
   */
  getPriceOrDefault(productName: string, defaultPrice: number): Observable<number> {
    return this.getAveragePriceForProduct(productName).pipe(
      map(price => price ?? defaultPrice)
    );
  }
}
