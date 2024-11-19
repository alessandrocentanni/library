import logger from "@/logger";
import { User } from "@/models/User";
import { hashPassword } from "@/utils/authentication";

const log = logger.child({ module: "load-users-sample" });

const loadUsersSample = async () => {
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

  await User.insertMany(users);

  log.info("Users sample loaded");
};

loadUsersSample()
  .then(() => console.log("loaded users sample"))
  .catch(() => console.error("error loading users sample"));
