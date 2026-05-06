# 1️⃣ Base image
FROM node:20

# 2️⃣ Working directory
WORKDIR /app

# 3️⃣ Copy package files
COPY package*.json ./

# 4️⃣ Install dependencies
RUN npm ci

# 5️⃣ Copy all source code
COPY . .

# 6️⃣ Build Next.js app (IMPORTANT)
RUN npm run build

# 7️⃣ Expose port
EXPOSE 3000

# 8️⃣ Start production server
CMD ["npm", "start"]