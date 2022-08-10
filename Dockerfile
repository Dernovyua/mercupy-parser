FROM wangqiru/mercury-parser-api:latest

RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

WORKDIR /app

COPY ./Mods/* /app/

RUN ln -f -T ./mercury.js /app/node_modules/@postlight/mercury-parser/dist/mercury.js

USER appuser

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start"]
