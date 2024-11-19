// node-cron is by no means a good solution for production, but it's good enough for this example.
// in a real world scenario you would want to use a more robust solution, like rabbitmq's delayed messages.
// and you could do that on the creation of the borrow history, so that you won't need to rely on cron jobs.
// https://www.rabbitmq.com/blog/2015/04/16/scheduling-messages-with-rabbitmq/

import cron from "node-cron";
import { BorrowHistory, type IBorrowHistory } from "./models/BorrowHistory";
import type { IUser } from "./models/User";

// Schedule a task to notify users of upcoming due dates (2 days before)
cron.schedule("0 9 * * *", async () => {
  const borrowHistories = await BorrowHistory.find({
    dueDate: { $gte: new Date(), $lte: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000) },
    status: "borrowed",
    notifications: { $not: { $elemMatch: { kind: "upcoming-due-date" } } },
  })
    .populate("user")
    .populate("book")
    .lean();
  await groupAndNotifyUsers(borrowHistories as IBorrowHistory[], "upcoming-due-date");
});

// Schedule a task to remind users of late returns (7 days after the due date)
cron.schedule("0 9 * * *", async () => {
  const borrowHistories = await BorrowHistory.find({
    dueDate: { $lte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000) },
    status: "borrowed",
    notifications: { $not: { $elemMatch: { kind: "late-return" } } },
  })
    .populate("user")
    .populate("book")
    .lean();
  await groupAndNotifyUsers(borrowHistories as IBorrowHistory[], "late-return");
});

const groupAndNotifyUsers = async (borrowHistories: IBorrowHistory[], subject: "late-return" | "upcoming-due-date") => {
  const groupByUser = borrowHistories.reduce((acc: { [email: string]: IBorrowHistory[] }, borrowHistory) => {
    if (!acc[(borrowHistory.user as IUser).email]) {
      acc[(borrowHistory.user as IUser).email] = [];
    }
    acc[(borrowHistory.user as IUser).email].push(borrowHistory as IBorrowHistory);
    return acc;
  }, {});

  for (const email in groupByUser) {
    const borrowHistoriesToNotify = groupByUser[email];

    console.log(`Sending email to ${email} for ${subject}`);

    await sendEmail(email, borrowHistoriesToNotify, subject);

    for (const borrowHistory of borrowHistoriesToNotify) {
      await BorrowHistory.updateOne({ _id: borrowHistory._id }, { $push: { notifications: { kind: subject, sentAt: new Date() } } });
    }
  }
};

const sendEmail = async (email: string, borrowHistories: IBorrowHistory[], subject: "late-return" | "upcoming-due-date") => {
  // send email logic here
  console.log(`Email sent to ${email} for ${subject}`);
};
