# 频安官网 (Landing Site)

The public-facing marketing site for 频安, served by the `landing/` app under the
`/entry-station` base path. This context covers the domain language of the site's
content and the product-manual feature.

## Language

**说明书 (Manual)**:
A per-product end-user document (PDF) explaining how to use/operate one product.
_Avoid_: 手册, 文档, guide — use "说明书 / Manual" consistently.

**说明书产品 (Manual Product)**:
A product that has a Manual. Supplied by the business owner for this feature; it is
**not** necessarily one of the existing catalog products on `/products`.
_Avoid_: conflating with the `/products` catalog (see Flagged ambiguities).

**碰一碰 / NFC 标签 (NFC Tag)**:
A physical NFC tag (e.g. on the product or its packaging) encoding a fixed URL. A
customer taps it with a phone and lands directly on that product's Manual page.
_Avoid_: "二维码" — this is NFC, not QR (though a QR fallback may coexist later).

## Relationships

- A **Manual Product** has exactly one **Manual** (one PDF).
- An **NFC Tag** points to exactly one **Manual Product**'s page via a permanent URL.
- The set of Manual Products is **elastic**: it is whatever `*.pdf` files exist in
  `public/entry-station/manuals/`. The PDF **filename is the permanent slug** in the
  URL (`p1.pdf` → `/entry-station/manuals/p1`); the display name is a separate,
  changeable override. See ADR-0002.
- The Manual feature is **separate** from the `/products` catalog content.

## Example dialogue

> **Dev:** "Are the 3 manual products the same as the 3 on the 产品服务 page?"
> **Owner:** "No — I'll give you the 3 products myself; they don't necessarily match the
> ones the site shows now. I want them displayed, and I want a customer to tap an NFC
> tag with their phone and see the manual page on mobile."

## Flagged ambiguities

- **"产品" is overloaded.** The site's `/products` page shows 3 catalog products
  (AI健康评估调理系统 / 智能无线手环 / 小分子富氢水机). The Manual feature's 3 products are an
  **independent, owner-supplied set** — they may or may not overlap. Resolved: treat
  Manual Products as their own data set; do not assume reuse of catalog product data.
