# https://github.com/casey/just
# https://just.systems/

dev:
    npm run dev

build:
    rm -rf .parcel-cache # to avoid seg faults in parcel
    npm run build

start: build
    npm run start

pretty:
    prettier --check app *.js

tsc:
    npm run tsc

lint: pretty tsc
    npm run lint

lintfix:
    npm run lintfix

test:
    npm run test

format: lintfix

install:
    npm install
