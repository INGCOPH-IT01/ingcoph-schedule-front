# POS + Booking Integration - Visual Guide

## What Has Been Added

### In the Booking Dialog (Step 3 - Confirmation)

```
┌─────────────────────────────────────────────────────────┐
│  ✓ Confirm Your Booking                                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📅 Court Booking Summary                                │
│  ├─ Basketball Court A                                  │
│  ├─ 2:00 PM - 4:00 PM                                   │
│  └─ Price: ₱500.00                                      │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🛒 Add Products (Optional) ▼                     │   │
│  │ ┌───────────────────────────────────────────┐   │   │
│  │ │ [Product Selector Component Appears Here]  │   │   │
│  │ │                                             │   │   │
│  │ │  🏀 Basketball          ₱200  [+ - 2]      │   │   │
│  │ │  💧 Water Bottle         ₱50  [+ - 3]      │   │   │
│  │ │  🍫 Energy Bar           ₱80  [+ - 1]      │   │   │
│  │ └───────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ╔════════════════════════════════════════════════╗    │
│  ║            💰 TOTAL PRICE                      ║    │
│  ║                                                 ║    │
│  ║  📅 Court Booking        ₱500.00              ║    │
│  ║  🛒 Products            ₱630.00              ║    │
│  ║  ─────────────────────────────────            ║    │
│  ║  ✅ Total Price          ₱1,130.00           ║    │
│  ╚════════════════════════════════════════════════╝    │
│                                                          │
│  [ Upload Proof of Payment ]                            │
│  [      Checkout       ]                                │
└─────────────────────────────────────────────────────────┘
```

## User Flow

### Before (Without Products):
1. Select sport
2. Select court & time
3. Confirm booking
4. Upload payment proof
5. Submit

**Price Display:**
```
Total Price: ₱500.00
```

### After (With Products - NEW):
1. Select sport
2. Select court & time
3. Confirm booking
4. **[NEW]** Expand "Add Products" panel (optional)
5. **[NEW]** Search and select products
6. **[NEW]** Adjust quantities
7. See price breakdown (booking + products)
8. Upload payment proof for BOTH
9. Submit

**Price Display:**
```
Court Booking:  ₱500.00
Products:       ₱630.00
────────────────────────
Total Price:    ₱1,130.00
```

## Product Selector Features

### Search & Filter
- Search by product name, SKU, or description
- Filter by category (Beverages, Snacks, Equipment, etc.)
- Only shows active, in-stock products

### Product Cards
```
┌─────────────────────┐
│  🏀  [Product Image] │
│  ✓ SELECTED          │
│  📦 15 in stock      │
├─────────────────────┤
│  Basketball          │
│  ₱200.00             │
│  Official size 7     │
│  [- 2 +]            │
└─────────────────────┘
```

### Selected Products Summary
```
Selected Products:
├─ 🏀 Basketball (₱200 × 2 = ₱400) [×]
├─ 💧 Water Bottle (₱50 × 3 = ₱150) [×]
└─ 🍫 Energy Bar (₱80 × 1 = ₱80) [×]
    ────────────────────
    Total: ₱630.00
```

## Backend Processing

When checkout is submitted:

```
1. Validate booking slots
   ✓ Check availability
   ✓ Create booking records

2. Process POS Items
   ✓ Validate product stock
   ✓ Create POS sale record
   ✓ Create sale items
   ✓ Deduct inventory
   ✓ Create stock movements

3. Update Transaction
   ✓ booking_amount = ₱500.00
   ✓ pos_amount = ₱630.00
   ✓ total_price = ₱1,130.00
   ✓ Save payment proof

4. Return Success
```

## Database Records Created

### CartTransaction
```
id: 123
total_price: 1130.00
booking_amount: 500.00
pos_amount: 630.00
payment_status: paid
status: completed
```

### Booking(s)
```
id: 456
cart_transaction_id: 123
total_price: 500.00
status: pending
```

### PosSale
```
id: 789
cart_transaction_id: 123
total_amount: 630.00
status: completed
```

### PosSaleItem(s)
```
pos_sale_id: 789
product_id: 1 (Basketball)
quantity: 2
unit_price: 200.00
subtotal: 400.00

pos_sale_id: 789
product_id: 2 (Water)
quantity: 3
unit_price: 50.00
subtotal: 150.00

pos_sale_id: 789
product_id: 3 (Energy Bar)
quantity: 1
unit_price: 80.00
subtotal: 80.00
```

### StockMovement(s)
```
product_id: 1
type: sale
quantity: -2
reference_type: pos_sale
reference_id: 789
notes: "Sold with booking transaction #123"

[... similar records for other products ...]
```

## Admin View

Administrators will see in the transaction details:

```
Transaction #123
├─ Total Amount: ₱1,130.00
│  ├─ Booking Revenue: ₱500.00
│  └─ POS Revenue: ₱630.00
│
├─ Bookings (1)
│  └─ Basketball Court A - 2:00 PM to 4:00 PM
│
└─ Products Sold (3 items)
   ├─ Basketball × 2 = ₱400.00
   ├─ Water Bottle × 3 = ₱150.00
   └─ Energy Bar × 1 = ₱80.00
```

## Revenue Tracking

The system now separately tracks:

1. **Booking Amount** - Revenue from court reservations
2. **POS Amount** - Revenue from product sales
3. **Total Amount** - Combined revenue

This allows for:
- Separate reporting for bookings vs products
- Better inventory management
- Clearer profit analysis
- Integrated payment processing

## Key Features

✅ **Optional** - Products are not required
✅ **Unified Payment** - One payment for both
✅ **Real-time Stock** - Shows available quantities
✅ **Auto Stock Deduction** - Inventory updated automatically
✅ **Audit Trail** - Complete stock movement history
✅ **Search & Filter** - Easy product discovery
✅ **Quantity Control** - +/- buttons or direct input
✅ **Visual Feedback** - Selected badge, stock badges
✅ **Price Breakdown** - Clear separation of costs
✅ **All User Roles** - Available to everyone (users, staff, admin)

---

**Status:** ✅ Fully Implemented and Ready to Use
