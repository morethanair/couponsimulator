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
        // 1st phase restrictions
        if (couponType === 'seller100') {
            discountInput.max = 100;
            sellerPortionGroup.style.display = 'none'; // Hide seller portion for Seller 100
            document.getElementById('coupon1-seller-portion').value = 100; // Automatically set to 100%
        } else if (couponType === 'membership') {
            discountInput.max = 20; // Limit discount to 20% for Membership
            sellerPortionInput.max = 80; // Limit seller portion to 80% for Membership
            sellerPortionInput.min = 0; // Ensure the minimum is 0%
        } else if (couponType === 'sellerPlus' || couponType === 'zigzagPlus') {
            alert("Seller Plus and Zigzag Plus cannot be used in the 1st phase.");
            document.getElementById(`coupon${couponNumber}`).value = ''; // Reset the selection
            discountInput.disabled = true;
            sellerPortionInput.disabled = true;
        }
    }

    if (couponNumber === 2) {
        // 2nd phase restrictions
        if (couponType === 'seller100') {
            alert("Seller 100 cannot be used as the 2nd phase coupon.");
            document.getElementById(`coupon${couponNumber}`).value = ''; // Reset the selection
            discountInput.disabled = true;
            sellerPortionInput.disabled = true;
        } else if (couponType === 'membership') {
            discountInput.max = 20; // Limit discount to 20% for Membership
            sellerPortionInput.max = 80; // Limit seller portion to 80% for Membership
            sellerPortionInput.min = 0; // Ensure the minimum is 0%
        } else if (couponType === 'zigzagPlus') {
            discountInput.max = 100;
            sellerPortionInput.value = 0;
            sellerPortionGroup.style.display = 'none'; // Hide seller portion for Zigzag Plus
        } else if (couponType === 'sellerPlus') {
            discountInput.max = 100;
            sellerPortionInput.max = 100; // Seller Plus can go up to 100%
            sellerPortionInput.min = 0; // Ensure the minimum is 0%
        }
    }

    // Only validate seller portions after ensuring that values have been correctly set
    validateSellerPortion();
}

function validateSellerPortion() {
    const coupon1Type = document.getElementById('coupon1').value;
    const coupon2Type = document.getElementById('coupon2').value;

    let sellerPortion1 = parseFloat(document.getElementById('coupon1-seller-portion').value) || 0;
    let discount1 = parseFloat(document.getElementById('coupon1-discount').value) || 0;

    let sellerPortion2 = parseFloat(document.getElementById('coupon2-seller-portion').value) || 0;
    let discount2 = parseFloat(document.getElementById('coupon2-discount').value) || 0;

    // Validate the ranges of seller portions
    if (sellerPortion1 < 0 || sellerPortion1 > 100) {
        alert("Seller portion for the 1st coupon must be between 0% and 100%.");
        sellerPortion1 = Math.min(Math.max(sellerPortion1, 0), 100);
        document.getElementById('coupon1-seller-portion').value = sellerPortion1.toFixed(2);
    }
    if (sellerPortion2 < 0 || sellerPortion2 > 100) {
        alert("Seller portion for the 2nd coupon must be between 0% and 100%.");
        sellerPortion2 = Math.min(Math.max(sellerPortion2, 0), 100);
        document.getElementById('coupon2-seller-portion').value = sellerPortion2.toFixed(2);
    }

    // Maintain Membership coupon limits
    if (coupon1Type === 'membership') {
        if (discount1 > 20) {
            alert("Discount for Membership cannot exceed 20%.");
            discount1 = 20;
            document.getElementById('coupon1-discount').value = discount1.toFixed(2);
        }
        if (sellerPortion1 > 80) {
            alert("Seller portion for Membership cannot exceed 80%.");
            sellerPortion1 = 80;
            document.getElementById('coupon1-seller-portion').value = sellerPortion1.toFixed(2);
        }
    }

    // Calculate individual seller cost portions
    const sellerCostPortion1 = (discount1 / 100) * (sellerPortion1 / 100);
    const sellerCostPortion2 = (discount2 / 100) * (sellerPortion2 / 100);

    // Calculate total seller cost portion
    const totalSellerPortion = sellerCostPortion1 + sellerCostPortion2;

    // Check if total exceeds 16%
    if (totalSellerPortion > 0.16) {
        if (coupon2Type === 'sellerPlus') {
            return;
        }
        alert("Total seller cost portion exceeds 16%. Adjusting the values.");

        // Adjust the second seller portion first
        let remainingPortion = 0.16 - sellerCostPortion1;
        if (remainingPortion < 0) remainingPortion = 0;

        sellerPortion2 = Math.min((remainingPortion / (discount2 / 100)) * 100, sellerPortion2);
        document.getElementById('coupon2-seller-portion').value = sellerPortion2.toFixed(2);

        // If still over 16%, adjust the first seller portion as well
        if (discount1 > 0) {
            sellerPortion1 = Math.min((0.16 / (discount1 / 100)) * 100, sellerPortion1);
            document.getElementById('coupon1-seller-portion').value = sellerPortion1.toFixed(2);
        }
    }
}

function calculateDiscount() {
    validateSellerPortion();
    const coupon1Type = document.getElementById('coupon1').value;
    const discount1 = parseFloat(document.getElementById('coupon1-discount').value) / 100 || 0;
    const sellerPortion1 = coupon1Type === 'seller100' ? 100 : parseFloat(document.getElementById('coupon1-seller-portion').value) || 0;

    const discount2 = parseFloat(document.getElementById('coupon2-discount').value) / 100 || 0;
    const sellerPortion2 = parseFloat(document.getElementById('coupon2-seller-portion').value) || 0;

    // Sequential discount calculation
    const priceAfterFirstDiscount = 1 - discount1;
    const priceAfterSecondDiscount = priceAfterFirstDiscount * (1 - discount2);
    const totalDiscount = (1 - priceAfterSecondDiscount) * 100;

    // Calculate total seller portion based on the rules
    const totalSellerPortion = (discount1 * (sellerPortion1 / 100) + discount2 * (sellerPortion2 / 100)) * 100;

    // Display result
    document.getElementById('result').innerHTML = `
        <p>1st Coupon: ${(discount1 * 100).toFixed(2)}% discount, ${sellerPortion1.toFixed(2)}% seller cost portion</p>
        <p>2nd Coupon: ${(discount2 * 100).toFixed(2)}% discount, ${sellerPortion2.toFixed(2)}% seller cost portion</p>
        <hr>
        <p>Total Discount: ${totalDiscount.toFixed(2)}%</p>
        <p>Total Seller Cost Portion: ${totalSellerPortion.toFixed(2)}%</p>
    `;
}
