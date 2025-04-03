/**
 * Calculate transactions needed to settle the debts
 * @param {Array} balances Array of objects with name and balance properties
 * @returns {Array} Array of transaction objects with from, to, and amount
 */
export function calculateTransactions(balances) {
  const transactions = [];
  
  // Split members into those who owe money and those who need to be paid
  const debtors = balances.filter(member => member.balance < 0)
    .map(member => ({ name: member.name, amount: -member.balance }));
    
  const creditors = balances.filter(member => member.balance > 0)
    .map(member => ({ name: member.name, amount: member.balance }));
  
  // Sort both arrays by amount (largest first)
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);
  
  // Generate transactions
  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0];
    const creditor = creditors[0];
    
    // Calculate the transaction amount (minimum of what is owed and what is to be received)
    const amount = Math.min(debtor.amount, creditor.amount);
    
    // Round to nearest integer to avoid floating point issues
    const roundedAmount = Math.round(amount);
    
    if (roundedAmount > 0) {
      transactions.push({
        from: debtor.name,
        to: creditor.name,
        amount: roundedAmount
      });
    }
    
    // Update remaining balances
    debtor.amount -= amount;
    creditor.amount -= amount;
    
    // Remove entries with zero or negligible balances
    if (debtor.amount < 1) {
      debtors.shift();
    }
    
    if (creditor.amount < 1) {
      creditors.shift();
    }
  }
  
  return transactions;
}
