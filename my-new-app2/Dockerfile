# Step 1: Build React app
FROM node:22-alpine as build

WORKDIR /app
# COPY package.json package-lock.json ./
COPY . ./
RUN npm install
RUN npm run build

CMD [ "npm", "run", "start" ]

# # Step 2: Set up Nginx to serve the React app
# FROM nginx:alpine

# # Copy the custom nginx.conf to the container
# COPY nginx.conf /etc/nginx/nginx.conf

# # Copy built files from the previous stage into the Nginx container
# COPY --from=build /app/build /usr/share/nginx/html

# # Expose port 80
# EXPOSE 80

# # Start Nginx
# CMD ["nginx", "-g", "daemon off;"]
