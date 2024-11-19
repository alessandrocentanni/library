import { type IUser, User } from "@/models/User";
import { faker } from "@faker-js/faker";
import { hashPassword } from "@/utils/authentication";

export async function createDummyUser(user?: Partial<IUser>) {
  const data = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    ...user,
  };

  data.password = await hashPassword(data.password);
  const newUser = await User.create(data);
  return newUser.toObject();
}
