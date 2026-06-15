/**
 * storefrontOrdersService — facade for buyer commerce orders placed via the
 * public storefront / product checkout.
 *
 * Storefront Orders are the buyer's commerce orders and are SEPARATE from
 * delivery Transactions. A delivery transaction is created (revealed) only when
 * the seller accepts an order. See data/storefrontOrders.ts and
 * docs/storefront_rules.md. All functions are async to match a real API contract.
 *
 * Future BFF:
 *   GET  /accounts/:id/storefront/orders                 → getOrders
 *   GET  /storefront/orders/:orderId                     → getOrderById
 *   POST /storefront/orders                              → placeStorefrontOrder
 *   POST /storefront/orders/:orderId/accept|reject       → acceptOrder / rejectOrder
 */

import {
  listOrders,
  getOrder,
  getOrderByTracking,
  acceptedOrders,
  buildTransactionFromOrder,
  placeOrder,
  acceptOrder,
  rejectOrder,
  advanceDelivery,
  storeOrderDisplay,
  STOREFRONT_ORDER_STATUS_META,
  type StorefrontOrder,
  type StorefrontOrderStatus,
  type StorefrontOrderChannel,
  type StorefrontOrderItem,
  type StoreOrderDisplayStatus,
  type PlaceOrderInput,
} from '../data/storefrontOrders';

export type {
  StorefrontOrder,
  StorefrontOrderStatus,
  StorefrontOrderChannel,
  StorefrontOrderItem,
  StoreOrderDisplayStatus,
  PlaceOrderInput,
};
export { STOREFRONT_ORDER_STATUS_META, storeOrderDisplay };
export { buildTransactionFromOrder, getOrderByTracking, acceptedOrders };

/** Orders for the active scope (newest first); all orders in consolidated view. */
export async function getOrders(scopeId: string | undefined): Promise<StorefrontOrder[]> {
  return listOrders(scopeId);
}

export async function getOrderById(id: string): Promise<StorefrontOrder | null> {
  return getOrder(id) ?? null;
}

/** Place a buyer order (always starts as "Awaiting seller acceptance"). */
export async function placeStorefrontOrder(input: PlaceOrderInput): Promise<StorefrontOrder> {
  return placeOrder(input);
}

/** Seller accepts → creates the linked delivery transaction (OD: looking for driver). */
export async function acceptStorefrontOrder(id: string): Promise<StorefrontOrder | null> {
  return acceptOrder(id) ?? null;
}

/** Seller rejects/cancels the order (mocked). */
export async function rejectStorefrontOrder(id: string, reason?: string): Promise<StorefrontOrder | null> {
  return rejectOrder(id, reason) ?? null;
}

/** Advance an accepted OD order through its delivery lifecycle (demo). */
export async function advanceStorefrontDelivery(id: string): Promise<StorefrontOrder | null> {
  return advanceDelivery(id) ?? null;
}
