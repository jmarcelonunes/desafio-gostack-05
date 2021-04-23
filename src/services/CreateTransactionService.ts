import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryName: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    categoryName,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);
    const transactionsCustomRepository = getCustomRepository(
      TransactionsRepository,
    );
    let category = await categoryRepository.findOne({
      where: { title: categoryName },
    });

    if (!category) {
      category = categoryRepository.create({
        title: categoryName,
      });
      await categoryRepository.save(category);
    }

    if (type === 'outcome') {
      const balance = await transactionsCustomRepository.getBalance();
      if (balance.total - value < 0) {
        throw new AppError('No funds', 400);
      }
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: category.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
