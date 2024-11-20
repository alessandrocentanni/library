import { type IWalletHistoryMetadata, WalletHistory } from "@/models/WalletHistory";
import { PaymentRequiredError } from "@/utils/custom-errors";
import type { ClientSession } from "mongoose";

export async function processPayment(userId: string, amount: number, metadata: IWalletHistoryMetadata, session: ClientSession) {
  await WalletHistory.create([{ amount: -amount, metadata, user: userId }], { session });

  const histories = await WalletHistory.find({ user: userId }).session(session);

  const total = histories.reduce((acc, curr) => acc + curr.amount, 0);
  if (total < 0) {
    throw new PaymentRequiredError("Insufficient balance");
  }
}
