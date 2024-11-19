# Use the official Node.js 18 image as the base image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml to the working directory
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the application
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]