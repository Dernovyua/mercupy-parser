FROM wangqiru/mercury-parser-api:latest

ENV GITRAW=https://raw.githubusercontent.com/Cheetah97/mercupy-parser/main

WORKDIR /app

RUN apk add --no-cache wget \
    && wget -O /app/index.js ${GITRAW}/Mods/index.js \
    && wget -O /app/routes.js ${GITRAW}/Mods/routes.js \
    && wget -O /app/node_modules/@postlight/mercury-parser/dist/mercury.js ${GITRAW}/Mods/mercury.js

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]

CMD ["npm", "run", "start"]

# ENTRYPOINT ["npm", "run", "start"]
