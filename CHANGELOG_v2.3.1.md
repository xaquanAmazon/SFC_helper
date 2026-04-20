
// CHANGELOG: Updated sfcPattern regex - changed minimum character count from 10 to 5 in the alphanumeric portion
// Old: /\b\d{7,}\-[A-Za-z0-9]{10,20}\b/gi
// New: /\b\d{7,}\-[A-Za-z0-9]{5,20}\b/gi
const sfcPattern = /\b\d{7,}\-[A-Za-z0-9]{5,20}\b/gi;