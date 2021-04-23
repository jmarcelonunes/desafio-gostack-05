import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {
  async loadCSV(filePath: string): Promise<Array<string>> {
    const readCSVStream = fs.createReadStream(filePath);
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: Array<string> = [];

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return lines;
  }

  async execute(filename: string): Promise<Transaction[]> {
    const csvFilePath = path.resolve(uploadConfig.directory, filename);
    const data = await this.loadCSV(csvFilePath);
    const createTransactionService = new CreateTransactionService();
    const response: Array<Transaction> = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < data.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const transaction = await createTransactionService.execute({
        title: data[i][0],
        value: parseInt(data[i][2], 10),
        type: data[i][1] === 'income' ? 'income' : 'outcome',
        categoryName: data[i][3],
      });
      response.push(transaction);
    }

    return response;

    //   const csvTransactions: Array<string> = [];
    // const readCSVStream = fs.createReadStream(csvFilePath);
    //   const response: Array<Transaction> = [];
    //   const parseStream = csvParse({
    //     from_line: 2,
    //     ltrim: true,
    //     rtrim: true,
    //   });
    //   const parseCSV = readCSVStream.pipe(parseStream);
    //
    //   parseCSV.on('data', line => {
    //     console.log(line);
    //     csvTransactions.push(line);
    //   });
    //   parseCSV.on('end', () => {
    //     console.log('Leitura do CSV finalizada');
    //   });
    //   csvTransactions.forEach(element => {
    //     const transaction = await createTransactionService.execute({
    //       title: element[0],
    //       value: parseInt(element[2]),
    //       type: element[1],
    //       categoryName: element[3],
    //     });
    //     response.push(transaction);
    //   });
    //   return response;
  }
}

export default ImportTransactionsService;
