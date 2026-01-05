function calculateAge(birthDateStr) {
  if (!birthDateStr) return 0;
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

const today = new Date("2024-06-01"); // Simulate Today
// Override Date for the test
global.Date = class extends Date {
  constructor(...args) {
    if (args.length === 0) return today;
    return super(...args);
  }
};

// Case 1: Birthday later in the year
// Born: 1974-12-01.
// On 2024-06-01: Age should be 49. (Turns 50 in Dec 2024)
// 75th Birthday: 2049-12-01.
// Months until 75: From 2024-06 to 2049-12.
// Years: 25. Months: 6. Total: 306 months.

const birthDate1 = "1974-12-01";
const age1 = calculateAge(birthDate1);
const maxByAge1 = 75 - age1;
const maxMonths1 = maxByAge1 * 12;

console.log(`Case 1: Born ${birthDate1}. Today is 2024-06-01.`);
console.log(`Age: ${age1}`);
console.log(`Current Logic Max Years (75 - age): ${maxByAge1}`);
console.log(`Current Logic Max Months: ${maxMonths1}`);

// Strict calculation
const bDate1 = new Date(birthDate1);
const b75_1 = new Date(bDate1);
b75_1.setFullYear(bDate1.getFullYear() + 75);
const yearsDiff1 = b75_1.getFullYear() - today.getFullYear();
const monthsDiff1 = b75_1.getMonth() - today.getMonth();
const strictMonths1 = yearsDiff1 * 12 + monthsDiff1;

console.log(`Strict Months until 75th Birthday: ${strictMonths1}`);
console.log(`Overshoot: ${maxMonths1 - strictMonths1} months`);

// Case 2: Birthday passed
// Born: 1974-01-01.
// On 2024-06-01: Age is 50.
// 75th Birthday: 2049-01-01.
// Months until 75: From 2024-06 to 2049-01.
// Difference: 2049 - 2024 = 25 years.
// Months: 1 - 6 = -5.
// Total: 25*12 - 5 = 300 - 5 = 295 months.

const birthDate2 = "1974-01-01";
const age2 = calculateAge(birthDate2);
const maxByAge2 = 75 - age2; // 75 - 50 = 25
const maxMonths2 = maxByAge2 * 12; // 300

const bDate2 = new Date(birthDate2);
const b75_2 = new Date(bDate2);
b75_2.setFullYear(bDate2.getFullYear() + 75);
const yearsDiff2 = b75_2.getFullYear() - today.getFullYear();
const monthsDiff2 = b75_2.getMonth() - today.getMonth();
const strictMonths2 = yearsDiff2 * 12 + monthsDiff2;

console.log(`\nCase 2: Born ${birthDate2}. Today is 2024-06-01.`);
console.log(`Age: ${age2}`);
console.log(`Current Logic Max Years (75 - age): ${maxByAge2}`);
console.log(`Current Logic Max Months: ${maxMonths2}`);
console.log(`Strict Months until 75th Birthday: ${strictMonths2}`);
console.log(`Overshoot: ${maxMonths2 - strictMonths2} months`);
