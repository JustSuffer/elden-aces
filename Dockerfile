# 1. Aşama: Build
FROM node:20-alpine as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Aşama: Sunucuya Koyma
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Vite için 'dist' klasörünü kopyalıyoruz:
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]