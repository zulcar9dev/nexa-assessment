
function calculateAge(birthDateStr) {
    if (!birthDateStr) return 0;
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function calculateMonthsDifference(startDateStr, endDateStr) {
    if (!startDateStr || !endDateStr) return 0;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    if (start > end) return 0;
    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();
    const totalMonths = (years * 12) + months;
    return totalMonths > 0 ? totalMonths : 0;
}

// SIMULATE TabEUsulan logic
function simulateMaxDuration(birthDateStr, kategori = "prapurna", todayStr = "2024-06-01") {
    // Mock Today 
    const today = new Date(todayStr); 
    // Need to override Date inside the logic block if I were copy-pasting, but I will just rewrite logic
    
    // Logic from Component
    const limitYears = (kategori === "prapurna") ? 20 : 15;
    const limitMonths = limitYears * 12;
    
    let maxMonthsByAge = 0;
    
    const birthDate = new Date(birthDateStr);
    const seventyFifthBirthday = new Date(birthDate);
    seventyFifthBirthday.setFullYear(birthDate.getFullYear() + 75);
    
    // We used new Date() in component, but here we use our mock todayStr
    // note: component used today.toISOString, which might use UTC... actually local time usually...
    // simpler to just pass todayStr to calcMonths
    
    // Wait, component did:
    // const todayStr = today.toISOString().split("T")[0];
    // const maxAgeStatStr = seventyFifthBirthday.toISOString().split("T")[0];
    // maxMonthsByAge = calculateMonthsDifference(todayStr, maxAgeStatStr);
    
    const maxAgeStatStr = seventyFifthBirthday.toISOString().split("T")[0];
    maxMonthsByAge = calculateMonthsDifference(todayStr, maxAgeStatStr);
    
    let maxAllowed = Math.min(limitMonths, maxMonthsByAge);
    maxAllowed = Math.max(0, maxAllowed);
    
    return maxAllowed;
}

// Case 1: Born 1974-12-01. Today 2024-06-01.
// 75th Birthday: 2049-12-01.
// Diff: 2049/12 to 2024/06. 
// Years 25. Months 6. Total 306 months.
// Old Logic allowed 300 months? No, Old logic was age=49. 75-49=26 years = 312 months!
// New Logic should be roughly 306 months.

const res1 = simulateMaxDuration("1974-12-01", "prapurna", "2024-06-01");
console.log(`Case 1 (Born 1974-12-01): ${res1} months (Expected ~306)`);

// Case 2: Born 1974-01-01. Today 2024-06-01.
// Age 50.
// 75th Birthday: 2049-01-01.
// Diff: 2049/01 to 2024/06.
// Years: 2049-2024=25. Months: 1-6 = -5.
// Total 25*12 - 5 = 295 months.
// Old logic: Age 50. 75-50=25 years = 300 months.
// New Logic: 295 months.
const res2 = simulateMaxDuration("1974-01-01", "prapurna", "2024-06-01");
console.log(`Case 2 (Born 1974-01-01): ${res2} months (Expected 295)`);

