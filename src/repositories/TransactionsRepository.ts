import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    let total = 0;
    let income = 0;
    let outcome = 0;
    const transactionsRepository = getRepository(Transaction);
    const transactions = await transactionsRepository.find();
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        total += transaction.value;
        income += transaction.value;
      } else {
        total -= transaction.value;
        outcome += transaction.value;
      }
    });
    return { income, outcome, total };
  }
}

export default TransactionsRepository;
