export const validateForm = (formData, t) => {
    const error = (msg) => ({ isValid: false, message: msg });
    const success = () => ({ isValid: true });
    
    const translate = (key, fallback) => (t && t(key) ? t(key) : fallback);

    if (!formData.full_name || formData.full_name.trim().length < 2) 
        return error(translate('nameError', "Full Name is required."));
    
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobile_no)) 
        return error(translate('mobileError', "Mobile Number must be exactly 10 digits."));
    
    if (!formData.deadline_date) 
        return error(translate('deadlineError', "Deadline Date is required."));

    const shirtStyleCount = Object.keys(formData.shirt_selected_styles).length;
    const pantStyleCount = Object.keys(formData.pant_selected_styles).length;

    if (shirtStyleCount === 0 && pantStyleCount === 0) {
        return error(translate('noItemsError', "Please add at least one Shirt or Pant style to save the order."));
    }

    const checkSlashValues = (str) => {
        if (!str) return { count: 0, valid: false };
        const parts = str.toString().split('/').map(v => v.trim()).filter(v => v !== '');
        const allValid = parts.every(part => {
            const num = parseFloat(part);
            return !isNaN(num) && num > 0 && num < 999; 
        });
        return { count: parts.length, valid: allValid };
    };

    const isInvalidNumber = (val) => {
        const num = parseFloat(val);
        if (isNaN(num) || num <= 0) return "invalid";
        if (num > 150) return "huge"; 
        return false;
    };

    const fieldNames = {
        shirt_front: translate('front', 'Front'),
        shirt_shoulder: translate('shoulder', 'Shoulder'),
        shirt_sleeve: translate('sleeve', 'Sleeve'),
        shirt_chest: translate('chest', 'Chest'),
        shirt_half_sleeves: translate('halfSleeve', 'Half Sleeve'),
        pant_length: translate('length', 'Length'),
        pant_bottom: translate('bottom', 'Bottom'),
        pant_waist: translate('waist', 'Waist'),
        pant_thigh: translate('thigh', 'Thigh'),
        pant_knee: translate('knee', 'Knee'),
        pant_below_waist: translate('belowWaist', 'Below Waist')
    };

    if (shirtStyleCount > 0) {
        const styles = Object.keys(formData.shirt_selected_styles);
        
        const hasLong = styles.includes("Long Kurta") || (t && styles.includes(t("longKurta")));
        const hasShort = styles.includes("Short Kurta") || (t && styles.includes(t("shortKurta")));
        
        const otherStyles = [
            "Apple Cut", "Manella", "Pick Cut", "Nehru", "Three Button",
            translate("appleCut", ""), translate("manella", ""), translate("pickCut", ""), translate("nehruJacket", ""), translate("threeButton", "")
        ];
        
        const hasReg = styles.length === 0 || styles.some(s => otherStyles.includes(s));

        if (hasReg && isInvalidNumber(formData.shirt_length_regular)) {
            return error(translate('lengthRegError', "Length (Regular) must be a valid positive number."));
        }
        if (hasShort && isInvalidNumber(formData.shirt_length_short)) {
            return error(translate('lengthShortError', "Length (Short Kurta) must be a valid positive number."));
        }
        if (hasLong && isInvalidNumber(formData.shirt_length_long)) {
            return error(translate('lengthLongError', "Length (Long Kurta) must be a valid positive number."));
        }

        const collarCheck = checkSlashValues(formData.shirt_collar_cuff);
        if (collarCheck.count < 2) return error(translate('collarError2', "Please enter 2 values for Collar / Cuff (e.g., 15 / 9.5)."));
        if (!collarCheck.valid) return error(translate('collarErrorValid', "Collar/Cuff values must be positive numbers under 999."));

        const shirtNumeric = ['shirt_front', 'shirt_shoulder', 'shirt_sleeve', 'shirt_chest', 'shirt_half_sleeves'];
        for (let key of shirtNumeric) {
            if ((key === 'shirt_chest' || key === 'shirt_half_sleeves') && (!formData[key] || formData[key] === '0' || formData[key] === '')) {
                continue; 
            }
            const status = isInvalidNumber(formData[key]);
            if (status) {
                const name = fieldNames[key];
                if (status === 'huge') return error(`${name} ${translate('tooLarge', 'is too large (Must be under 150).')}`);
                return error(`${name} ${translate('positiveNumber', 'must be a valid positive number.')}`);
            }
        }
    }

    if (pantStyleCount > 0) {
        const pantNumeric = ['pant_length', 'pant_bottom', 'pant_waist', 'pant_thigh', 'pant_knee', 'pant_below_waist'];
        for (let key of pantNumeric) {
            const status = isInvalidNumber(formData[key]);
            if (status) {
                const name = fieldNames[key];
                if (status === 'huge') return error(`${name} ${translate('tooLarge', 'is too large (Must be under 150).')}`);
                return error(`${name} ${translate('positiveNumber', 'must be a valid positive number.')}`);
            }
        }
    }

    return success();
};


// export const validateForm = (formData, t) => {
//     const error = (msg) => ({ isValid: false, message: msg });
//     const success = () => ({ isValid: true });

//     // --- 1. Basic Profile Checks ---
//     if (!formData.full_name || formData.full_name.trim().length < 2) 
//         return error(t && t('nameError') ? t('nameError') : "Full Name is required.");
    
//     const mobileRegex = /^[0-9]{10}$/;
//     if (!mobileRegex.test(formData.mobile_no)) 
//         return error("Mobile Number must be exactly 10 digits.");
    
//     if (!formData.deadline_date) 
//         return error("Deadline Date is required.");

//     const shirtStyleCount = Object.keys(formData.shirt_selected_styles).length;
//     const pantStyleCount = Object.keys(formData.pant_selected_styles).length;

//     // --- HELPER: Parse & Validate Slash Strings (ONLY for Collar now) ---
//     const checkSlashValues = (str) => {
//         if (!str) return { count: 0, valid: false };
//         const parts = str.toString().split('/').map(v => v.trim()).filter(v => v !== '');
//         const allValid = parts.every(part => {
//             const num = parseFloat(part);
//             return !isNaN(num) && num > 0 && num < 999; 
//         });
//         return { count: parts.length, valid: allValid };
//     };

//     // --- HELPER: Check Single Numeric Body Fields ---
//     const isInvalidNumber = (val) => {
//         const num = parseFloat(val);
//         if (isNaN(num) || num <= 0) return "invalid";
//         if (num > 150) return "huge"; 
//         return false;
//     };

//     // --- 3. SHIRT VALIDATION ---
//     if (shirtStyleCount > 0) {
//         const styles = Object.keys(formData.shirt_selected_styles);
        
//         // Determine which lengths are active
//         const hasLong = styles.includes("Long Kurta") || (t && styles.includes(t("longKurta")));
//         const hasShort = styles.includes("Short Kurta") || (t && styles.includes(t("shortKurta")));
//         const otherStyles = ["Apple Cut", "Manella", "Pick Cut", "Nehru", "Three Button"];
//         const hasReg = styles.length === 0 || styles.some(s => otherStyles.includes(s) || (t && otherStyles.includes(t(s))));

//         // A. Validate Dynamic Lengths
//         if (hasReg && isInvalidNumber(formData.shirt_length_regular)) return error("Regular Length must be a valid positive number.");
//         if (hasShort && isInvalidNumber(formData.shirt_length_short)) return error("Short Kurta Length must be a valid positive number.");
//         if (hasLong && isInvalidNumber(formData.shirt_length_long)) return error("Long Kurta Length must be a valid positive number.");

//         // B. Validate Collar/Cuff (STRICTLY 2 VALUES)
//         const collarCheck = checkSlashValues(formData.shirt_collar_cuff);
//         if (collarCheck.count < 2) return error("Please enter 2 values for Collar / Cuff (e.g., 15 / 9.5).");
//         if (!collarCheck.valid) return error("Collar/Cuff values must be positive numbers under 999.");

//         // C. Validate Standard Body Parts
//         const shirtNumeric = ['shirt_front', 'shirt_shoulder', 'shirt_sleeve', 'shirt_chest', 'shirt_half_sleeves'];
//         for (let key of shirtNumeric) {
//             if ((key === 'shirt_chest' || key === 'shirt_half_sleeves') && (!formData[key] || formData[key] === '0' || formData[key] === '')) {
//                 continue; // Optional fields
//             }
//             const status = isInvalidNumber(formData[key]);
//             if (status) {
//                 const name = key.replace('shirt_', 'Shirt ').replace(/_/g, ' ').toUpperCase();
//                 if (status === 'huge') return error(`${name} is too large (Must be under 150).`);
//                 return error(`${name} must be a valid positive number.`);
//             }
//         }
//     }

//     // --- 4. PANT VALIDATION ---
//     if (pantStyleCount > 0) {
//         const pantNumeric = ['pant_length', 'pant_bottom', 'pant_waist', 'pant_thigh', 'pant_knee', 'pant_below_waist'];
//         for (let key of pantNumeric) {
//             const status = isInvalidNumber(formData[key]);
//             if (status) {
//                 const name = key.replace('pant_', 'Pant ').replace(/_/g, ' ').toUpperCase();
//                 if (status === 'huge') return error(`${name} is too large (Must be under 150).`);
//                 return error(`${name} must be a valid positive number.`);
//             }
//         }
//     }

//     return success();
// };