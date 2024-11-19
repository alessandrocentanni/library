# Backend Service Documentation

This is a Node.js/Express backend service that manages book borrowing and user accounts.

## Key Features

- User authentication and authorization
- Book management system
- Borrowing history tracking
- Wallet/payment system

## Tech Stack

- Node.js & Express
- MongoDB with Mongoose
- TypeScript
- JWT for authentication
- Zod for validation
- Pino for logging
- Testing with Vitest

## Getting Started

There are two ways to run this project

### Locally

1. Clone the repository
2. Copy `.env.template` to `.env` and configure environment variables
3. Install dependencies: `pnpm install`
4. Run development server: `pnpm dev`
5. Run tests: `pnpm test`

### With docker-compose

1. Clone the repository
2. Run `docker-compose up`

## Environment Variables

- `NODE_ENV` - development/production/test
- `PORT` - Server port (default: 8080)
- `HOST` - Server host (default: localhost)
- `TEST` - Wether you're testing or not. Setting this to true will use a test in-memory database
- `DATABASE_URL` - MongoDB connection URL
- `BORROW_DURATION` - Book borrowing duration in days
- `JWT_SECRET` - Secret for JWT tokens

## Seeding the database

You can seed the database with some initial data by running the following command:

```bash
pnpm seed:users
pnpm seed:books
```

This will create some users and books in the database.
The default users are `admin@gmail.com` and `user@gmail.com` with the password `password`.
The admin comes with the `book:write` permission which is required on some book endpoints.
Both have 1000 wallet credits which you can use for testing.

## Manual testing

You can use the Postman collection provided in the `postman.json` file to test the API. It should simplify the process of testing the API. Below are the routes that are available.

## API Routes

### Authentication Endpoints

- **POST /api/authentication/signup**: Create a new user account. Every account is given a default role of `user` and _100 wallet credits_ on signup.
- **POST /api/authentication/login**: Authenticate a user and return a JWT token. You can use this token to authenticate other requests by setting it in the `x-access-token` header.

### User Management Endpoints

- **GET /api/users/:id**: Retrieve user data by user ID. You can only retrive your own user data.

### Book Operations Endpoints

- **GET /api/books**: List all books with optional filters and pagination.
- **GET /api/books/:id**: Retrieve book details by book ID.
- **POST /api/books**: Create a new book (requires `book:write` permission).
- **DELETE /api/books/:id**: Delete a book by book ID (requires `book:write` permission).

### Borrowing History Endpoints

- **GET /api/borrow-histories**: List borrowing history for the authenticated user with optional filters and pagination.
- **POST /api/borrow-histories**: Create a new borrowing history record for a book.
- **PATCH /api/borrow-histories/:id**: Update borrowing history status by ID, upon book purchase/return.

## Development

- `pnpm dev` - Start development server
- `pnpm test:dev` - Run tests in watch mode

## Testing

Tests are written using Vitest and can be run with `pnpm test`. Test database uses mongodb-memory-server. Most of those are integration tests, but there are some unit tests as well.

## Various assumptions made during development

I've implemented a simple authentication system using JWT tokens. The tokens are generated when a user logs in and are required for all requests except for the signup and login endpoints. The tokens are valid for 1 hour and are stored in the `x-access-token` header. We do not have a refresh token system implemented, restore password, csrf tokens, proper rate limits, recaptchas, etc.

I've also implemented a simple role-based access control system. The admin role has the `book:write` permission which is required for creating and deleting books. The user role has no permissions. You can only change this values directly from the database.

I've added a wallet system to the user accounts. Every user starts with 100 wallet credits which can be used to borrow books. The wallet credits are deducted when a user borrows a book and are added back when the book is returned. The wallet credits are also used when a user purchases a book.

The borrowing history system is implemented using a separate collection in the database. The borrowing history records are created when a user borrows a book and are updated when the book is returned or purchased. The payment of overdue fines is also implemented in the borrowing history system.
In reality, a more complex system would be required to handle the borrowing history, but I've kept it simple for this project. As example the user would not be returning the book, but we would never get him to pay for the book.

I did not implement a system to add wallet credits to users, but this could be added in the future. In reality, this would be done through a payment gateway (stripe, paypal, etc).

I did not include real email notifications. I've just added a console log to show the email that would be sent. In reality, you would use a service like SendGrid to send emails. Also, relying on cronjobs to send emails is not a good idea, as it's not reliable. A better solution would be to use a message queue like RabbitMQ to send emails asynchronously.

## Things which are missing, but could be added in the future

- Script to add permissions to users
- Script to add wallet balance to users
