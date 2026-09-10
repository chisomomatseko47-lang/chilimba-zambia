declare module 'money-unify-js' {
  const MoneyUnify: {
    requestPayment(muid: string, phone_number: string, amount: number | string): Promise<any>;
    verifyTransaction(muid: string, reference: string): Promise<any>;
    sendMoney(muid: string, email: string, first_name: string, last_name: string, phone_number: string, transaction_details: string): Promise<any>;
    pollTransactionStatus(muid: string, reference: string, interval?: number, maxAttempts?: number): Promise<any>;
  };
  export default MoneyUnify;
}
