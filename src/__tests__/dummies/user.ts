import { User } from "@/models/User";
import { WalletHistory } from "@/models/WalletHistory";
import { hashPassword } from "@/services/authentication";

const loadUsersSample = async () => {
  const users = [
    {
      email: "user@gmail.com",
      password: await hashPassword("password"),
      firstName: "John",
      lastName: "Doe",
    },
    {
      email: "admin@gmail.com",
      password: await hashPassword("password"),
      firstName: "Jane",
      lastName: "Doe",
      permissions: ["book:write"],
    },
  ];

  const createdUsers = await User.insertMany(users);
  for (const createdUser of createdUsers) {
    const walletHistory = {
      user: createdUser._id,
      amount: 1000,
      metadata: {
        transactionKind: "deposit",
      },
    };
    await WalletHistory.create(walletHistory);
  }
};

export default loadUsersSample;
