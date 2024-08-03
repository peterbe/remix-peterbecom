# https://github.com/casey/just
# https://just.systems/

dev:
    rm -rf .parcel-cache # to avoid seg faults in parcel
    npm run dev

build:
    rm -rf .parcel-cache # to avoid seg faults in parcel
    npm run build

build-fast:
    npm run build:remix

start: build
    npm run start

start-fast: build-fast
    npm run start

pretty:
    prettier --check app *.js

tsc:
    npm run tsc

lint: pretty
    npm run lint
    npm run tsc

lintfix:
    npm run lintfix

test:
    npm run test

format: lintfix

install:
    npm install
