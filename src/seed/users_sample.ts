import logger from "@/logger";
import { User } from "@/models/User";
import { hashPassword } from "@/services/authentication";
import db from "@/database";
import { WalletHistory } from "@/models/WalletHistory";

const log = logger.child({ module: "load-users-sample" });

const loadUsersSample = async () => {
  await db.connect();
  log.info("Loading users sample");

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

  log.info("Inserting users sample");

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

  log.info("Users sample loaded");
};

loadUsersSample()
  .then(() => {
    console.log("loaded user sample");
    process.exit(0);
  })
  .catch(() => {
    console.error("error loading user sample");
    process.exit(1);
  });
