function updateCouponInputs(couponNumber) {
    const couponType = document.getElementById(`coupon${couponNumber}`).value;
    const discountInput = document.getElementById(`coupon${couponNumber}-discount`);
    const sellerPortionGroup = document.getElementById(`coupon${couponNumber}-seller-portion-group`);
    const sellerPortionInput = document.getElementById(`coupon${couponNumber}-seller-portion`);

    // Reset inputs
    discountInput.disabled = false;
    sellerPortionGroup.style.display = 'block';
    sellerPortionInput.disabled = false;

    if (couponNumber === 1) {
        if (couponType === 'seller100') {
            discountInput.max = 100;
            sellerPortionGroup.style.display = 'none';
            document.getElementById('coupon1-seller-portion').value = 100;
        } else if (couponType === 'membership') {
            discountInput.max = 20;
            sellerPortionInput.max = 80;
        } else if (couponType === 'sellerPlus' || couponType === 'zigzagPlus') {
            alert("Seller Plus and Zigzag Plus cannot be used in the 1st phase.");
            document.getElementById(`coupon${couponNumber}`).value = '';
            discountInput.disabled = true;
            sellerPortionInput.disabled = true;
        }
    }

    if (couponNumber === 2) {
        if (couponType === 'seller100') {
            alert("Seller 100 cannot be used as the 2nd phase coupon.");
            document.getElementById(`coupon${couponNumber}`).value = '';
            discountInput.disabled = true;
            sellerPortionInput.disabled = true;
        } else if (couponType === 'membership') {
            discountInput.max = 20;
            sellerPortionInput.max = 80;
        } else if (couponType === 'zigzagPlus') {
            discountInput.max = 100;
            sellerPortionInput.value = 0;
            sellerPortionGroup.style.display = 'none';
        } else if (couponType === 'sellerPlus') {
            discountInput.max = 100;
            sellerPortionInput.max = 100;
        }
    }

    validateSellerPortion();
}

function validateSellerPortion() {
    const coupon1Type = document.getElementById('coupon1').value;
    const coupon2Type = document.getElementById('coupon2').value;

    let sellerPortion1 = parseFloat(document.getElementById('coupon1-seller-portion').value) || 0;
    let discount1 = parseFloat(document.getElementById('coupon1-discount').value) || 0;

    let sellerPortion2 = parseFloat(document.getElementById('coupon2-seller-portion').value) || 0;
    let discount2 = parseFloat(document.getElementById('coupon2-discount').value) || 0;

    // Ensure no NaN values (in case of parsing issues)
    sellerPortion1 = isNaN(sellerPortion1) ? 0 : sellerPortion1;
    discount1 = isNaN(discount1) ? 0 : discount1;
    sellerPortion2 = isNaN(sellerPortion2) ? 0 : sellerPortion2;
    discount2 = isNaN(discount2) ? 0 : discount2;

    // Apply Membership rules if the 1st coupon is Membership
    if (coupon1Type === 'membership') {
        if (discount1 > 20) {
            alert("Discount for Membership cannot exceed 20%.");
            discount1 = 20;
            document.getElementById('coupon1-discount').value = discount1;
            document.getElementById('coupon1-discount').nextElementSibling.value = discount1;
        }
        if (sellerPortion1 > 80) {
            alert("Seller portion for Membership cannot exceed 80%.");
            sellerPortion1 = 80;
            document.getElementById('coupon1-seller-portion').value = sellerPortion1;
            document.getElementById('coupon1-seller-portion').nextElementSibling.value = sellerPortion1;
        }
    }

    // Skip validation for the 2nd coupon if it's Seller Plus
    if (coupon2Type === 'sellerPlus') {
        return;
    }

    // Apply Membership rules if the 2nd coupon is Membership
    if (coupon2Type === 'membership' && sellerPortion2 > 80) {
        alert("Seller portion for Membership cannot exceed 80%.");
        sellerPortion2 = 80;
        document.getElementById('coupon2-seller-portion').value = sellerPortion2;
        document.getElementById('coupon2-seller-portion').nextElementSibling.value = sellerPortion2;
    }

    // Calculate individual seller cost portions
    const sellerCostPortion1 = (discount1 / 100) * (sellerPortion1 / 100);
    const sellerCostPortion2 = (discount2 / 100) * (sellerPortion2 / 100);

    // Calculate total seller cost portion
    const totalSellerPortion = sellerCostPortion1 + sellerCostPortion2;

    // Check if total exceeds 16%
    if (totalSellerPortion > 0.16) {
        alert("Total seller cost portion exceeds 16%. Adjusting the values.");

        // Adjust the second seller portion first
        let remainingPortion = 0.16 - sellerCostPortion1;
        if (remainingPortion < 0) remainingPortion = 0;

        sellerPortion2 = Math.min((remainingPortion / (discount2 / 100)) * 100, sellerPortion2);
        document.getElementById('coupon2-seller-portion').value = sellerPortion2.toFixed(2);
        document.getElementById('coupon2-seller-portion').nextElementSibling.value = sellerPortion2.toFixed(2);

        // If still over 16%, adjust the first seller portion as well
        if (discount1 > 0) {
            sellerPortion1 = Math.min((0.16 / (discount1 / 100)) * 100, sellerPortion1);
            document.getElementById('coupon1-seller-portion').value = sellerPortion1.toFixed(2);
            document.getElementById('coupon1-seller-portion').nextElementSibling.value = sellerPortion1.toFixed(2);
        }
    }
}

function calculateDiscount() {
    validateSellerPortion();
    const coupon1Type = document.getElementById('coupon1').value;
    let discount1 = parseFloat(document.getElementById('coupon1-discount').value) / 100 || 0;
    let sellerPortion1 = coupon1Type === 'seller100' ? 1 : parseFloat(document.getElementById('coupon1-seller-portion').value) / 100 || 0;

    let discount2 = parseFloat(document.getElementById('coupon2-discount').value) / 100 || 0;
    let sellerPortion2 = parseFloat(document.getElementById('coupon2-seller-portion').value) / 100 || 0;

    // Ensure no NaN values (in case of parsing issues)
    discount1 = isNaN(discount1) ? 0 : discount1;
    sellerPortion1 = isNaN(sellerPortion1) ? 0 : sellerPortion1;
    discount2 = isNaN(discount2) ? 0 : discount2;
    sellerPortion2 = isNaN(sellerPortion2) ? 0 : sellerPortion2;

    const priceAfterFirstDiscount = 1 - discount1;
    const priceAfterSecondDiscount = priceAfterFirstDiscount * (1 - discount2);
    const totalDiscount = (1 - priceAfterSecondDiscount) * 100;

    const totalSellerPortion = (discount1 * sellerPortion1 + discount2 * sellerPortion2) * 100;

    document.getElementById('result').innerHTML = `
        <p>1st Coupon: ${(discount1 * 100).toFixed(2)}% discount, ${(sellerPortion1 * 100).toFixed(2)}% seller cost portion</p>
        <p>2nd Coupon: ${(discount2 * 100).toFixed(2)}% discount, ${(sellerPortion2 * 100).toFixed(2)}% seller cost portion</p>
        <hr>
        <p>Total Discount: ${totalDiscount.toFixed(2)}%</p>
        <p>Total Seller Cost Portion: ${totalSellerPortion.toFixed(2)}%</p>
    `;
}
