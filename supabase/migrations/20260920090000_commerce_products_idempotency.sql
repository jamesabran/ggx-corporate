-- Idempotency protection for product creation.
--
-- Root cause of the "duplicate product" bug: `createProduct` had no
-- idempotency guard, unlike every other create/redeem path in this codebase
-- (commerce_promotion_redemptions.idempotency_key, the Ops Requests/Support
-- ticket `Idempotency-Key` header convention). A client retry of
-- `POST /api/commerce/products` — a genuine network hiccup treated as a
-- failure, or a fast double-submit before the button's disabled state
-- committed — created a second `commerce_products` row with the same name
-- (the form was never cleared) but a DIFFERENT auto-generated SKU (the
-- sequence had already advanced), while the FIRST row silently succeeded
-- server-side with no photos/variants ever attached to it (the client had
-- moved on to treating the SECOND row as "the" product). This exactly
-- matches the reported symptom.
--
-- `idempotency_key` is optional (older/other callers that don't send one are
-- unaffected) and unique per account when present — a partial unique index
-- so NULL (no key supplied) never collides with itself.
alter table commerce_products
  add column idempotency_key text null;

create unique index commerce_products_account_idempotency_uniq
  on commerce_products (account_id, idempotency_key)
  where idempotency_key is not null;
