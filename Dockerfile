FROM surnet/alpine-node-wkhtmltopdf:22.17.0-0.12.6-small

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]
