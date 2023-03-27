# https://github.com/casey/just
# https://just.systems/

dev:
    npm run dev

build:
    npm run build

start: build
    npm run start

pretty:
    prettier --check app *.js

tsc:
    npm run tsc

lint: pretty tsc
    npm run lint

test:
    npm run test
