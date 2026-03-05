# build stage
FROM node:22-alpine as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# run stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
# COPY ./ssl/server.crt /etc/nginx/ssl/server.crt
# COPY ./ssl/server.key /etc/nginx/ssl/server.key
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]