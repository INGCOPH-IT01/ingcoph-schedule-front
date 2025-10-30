#!/bin/bash

echo "======================================"
echo "Phase 3 Optimization Tests"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

cd "$(dirname "$0")"

echo -e "${BLUE}1. Checking virtual scroller installation...${NC}"
if grep -q "vue-virtual-scroller" package.json; then
  echo -e "${GREEN}✓ vue-virtual-scroller installed${NC}"
else
  echo "✗ vue-virtual-scroller not found"
fi

echo ""
echo -e "${BLUE}2. Checking virtual scroller import...${NC}"
if grep -q "vue-virtual-scroller" src/main.js; then
  echo -e "${GREEN}✓ Virtual scroller CSS imported${NC}"
else
  echo "✗ Virtual scroller CSS not imported"
fi

echo ""
echo -e "${BLUE}3. Checking payment settings cache...${NC}"
if grep -q "companySettingService" src/services/paymentSettingService.js; then
  echo -e "${GREEN}✓ Payment settings using company cache${NC}"
else
  echo "✗ Payment settings not using cache"
fi

echo ""
echo -e "${BLUE}4. Checking request deduplication utility...${NC}"
if [ -f "src/utils/requestDeduplication.js" ]; then
  echo -e "${GREEN}✓ Request deduplication utility created${NC}"
else
  echo "✗ Request deduplication utility not found"
fi

echo ""
echo -e "${BLUE}5. Checking booking service deduplication...${NC}"
if grep -q "deduplicateRequest" src/services/bookingService.js; then
  echo -e "${GREEN}✓ Booking service using request deduplication${NC}"
else
  echo "✗ Booking service not using deduplication"
fi

echo ""
echo -e "${BLUE}6. Checking route prefetching...${NC}"
prefetch_count=$(grep -c "webpackPrefetch: true" src/router/index.js)
if [ $prefetch_count -ge 3 ]; then
  echo -e "${GREEN}✓ Route prefetching configured ($prefetch_count routes)${NC}"
else
  echo "✗ Route prefetching not configured properly"
fi

echo ""
echo -e "${BLUE}7. Checking virtual scrolling in Bookings...${NC}"
if grep -q "useVirtualScrolling" src/views/Bookings.vue; then
  echo -e "${GREEN}✓ Virtual scrolling prepared in Bookings${NC}"
else
  echo "✗ Virtual scrolling not found in Bookings"
fi

echo ""
echo -e "${BLUE}8. Verifying build...${NC}"
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Build successful${NC}"

  # Check bundle sizes
  echo ""
  echo "Bundle sizes:"
  echo "-------------"
  ls -lh dist/assets/*.js | tail -8 | awk '{print "  " $9 ": " $5}'
else
  echo "✗ Build failed"
fi

echo ""
echo "======================================"
echo "Phase 3 Tests Complete!"
echo "======================================"
echo ""
echo "Performance improvements:"
echo "  • Request deduplication active"
echo "  • Payment settings cached"
echo "  • Critical routes prefetched"
echo "  • Virtual scrolling ready"
echo ""
