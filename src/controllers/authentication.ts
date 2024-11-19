import { User } from "@/models/User";
import { WalletHistory } from "@/models/WalletHistory";
import { hashPassword, verifyEmail, verifyPasswordHash } from "@/services/authentication";
import { controllerFactory } from "@/utils/controller-factory";
import { generateJWT } from "@/utils/jwt";
import { validateSchema } from "@/utils/validate-schema";
import { z } from "zod";

export const login = controllerFactory(async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  const data = validateSchema(schema, req.body);

  const user = await verifyEmail(data.email);
  await verifyPasswordHash(data.password, user.password);

  const accessToken = generateJWT({
    id: user._id.toString(),
    permissions: user.permissions,
  });
  res.json({ accessToken, userId: user._id.toString() });
});

export const signup = controllerFactory(async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string(),
    lastName: z.string(),
  });

  const data = validateSchema(schema, req.body);

  const user = await User.create({ ...data, password: await hashPassword(data.password) });

  await giveWelcomeBonus(user._id.toString());

  res.sendStatus(201);
});

async function giveWelcomeBonus(userId: string) {
  const walletHistory = {
    user: userId,
    amount: 100,
    metadata: {
      transactionKind: "deposit",
    },
  };
  await WalletHistory.create(walletHistory);
}
