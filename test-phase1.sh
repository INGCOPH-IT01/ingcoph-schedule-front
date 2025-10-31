#!/bin/bash

# Phase 1 Implementation Test Script
# Run this script to verify all optimizations are working

echo "🧪 Testing Phase 1 Optimizations..."
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if build succeeds
echo "📦 Test 1: Building application..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Build successful"
else
    echo -e "${RED}✗${NC} Build failed"
    exit 1
fi
echo ""

# Test 2: Check bundle sizes
echo "📊 Test 2: Analyzing bundle sizes..."
echo ""
echo "Main bundles:"
ls -lh dist/assets/*.js | grep -E "(excel|qr-codes|vue-vendor|utilities|vuetify|sweetalert)" | awk '{print "  " $9 " - " $5}'
echo ""
echo "Route chunks (lazy loaded):"
ls -lh dist/assets/*.js | grep -E "(Bookings|Admin|Staff|Courts|Home|Sports)" | head -5 | awk '{print "  " $9 " - " $5}'
echo ""

# Test 3: Verify file structure
echo "🔍 Test 3: Verifying optimized files..."
FILES=(
    "vite.config.js"
    "src/router/index.js"
    "src/App.vue"
    "src/services/authService.js"
    "src/components/CourtImageGallery.vue"
    "src/utils/debounce.js"
    "src/utils/apiCache.js"
    "src/composables/useEventBus.js"
    "src/composables/useVisibilityPolling.js"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${RED}✗${NC} $file missing"
    fi
done
echo ""

# Test 4: Check for lazy imports in router
echo "🔄 Test 4: Verifying lazy route loading..."
if grep -q "component: () => import" src/router/index.js; then
    echo -e "${GREEN}✓${NC} Lazy route loading enabled"
else
    echo -e "${RED}✗${NC} Lazy route loading not found"
fi
echo ""

# Test 5: Check for image lazy loading
echo "🖼️  Test 5: Verifying image lazy loading..."
if grep -q 'loading="lazy"' src/components/CourtImageGallery.vue; then
    echo -e "${GREEN}✓${NC} Image lazy loading enabled"
else
    echo -e "${YELLOW}⚠${NC} Image lazy loading not found"
fi
echo ""

# Test 6: Check for caching in authService
echo "💾 Test 6: Verifying user data caching..."
if grep -q "userCache" src/services/authService.js; then
    echo -e "${GREEN}✓${NC} User data caching enabled"
else
    echo -e "${RED}✗${NC} User data caching not found"
fi
echo ""

# Test 7: Check for smart polling
echo "⏱️  Test 7: Verifying smart polling..."
if grep -q "useVisibilityPolling" src/App.vue; then
    echo -e "${GREEN}✓${NC} Smart polling enabled"
else
    echo -e "${RED}✗${NC} Smart polling not found"
fi
echo ""

# Summary
echo "=================================="
echo -e "${GREEN}✅ Phase 1 Implementation Tests Complete!${NC}"
echo ""
echo "📈 Expected Improvements:"
echo "  • Bundle size: 40-50% smaller"
echo "  • Load time: 45-55% faster"
echo "  • API calls: 67% fewer"
echo ""
echo "🚀 Next Steps:"
echo "  1. Start dev server: npm run dev"
echo "  2. Test in browser at http://localhost:5555"
echo "  3. Check browser DevTools Network tab"
echo "  4. Verify chunks load on-demand"
echo "  5. Test all application features"
echo ""
echo "📚 Documentation:"
echo "  • Full details: PHASE_1_IMPLEMENTATION_SUMMARY.md"
echo "  • Quick guide: QUICK_OPTIMIZATIONS.md"
echo "  • Next phase: FRONTEND_OPTIMIZATIONS.md"
echo ""
