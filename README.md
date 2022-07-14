# Adobe Experience Platform event forwarding Turbine Edge

[![Build Status](https://img.shields.io/github/workflow/status/adobe/reactor-turbine-edge/ci?style=flat)](https://github.com/adobe/reactor-turbine-edge/actions)
[![Coverage Status](https://coveralls.io/repos/github/adobe/reactor-turbine-edge/badge.svg?branch=master)](https://coveralls.io/github/adobe/reactor-turbine-edge?branch=master)
[![npm (scoped with tag)](https://img.shields.io/npm/v/@adobe/reactor-turbine-edge.svg?style=flat)](https://www.npmjs.com/package/@adobe/reactor-turbine-edge)

Adobe Experience Platform event forwarding is a next-generation solution that allows running JavaScript code on Adobe servers.

Turbine Edge is the orchestrator within an event forwarding runtime library (the library deployed on the server) which processes previously configured rules and delegates logic to extensions.

This project is not intended to be used directly by consumers; it is used by the event forwarding build system and incorporated into emitted runtime libraries.

## Contributing

Contributions are welcomed! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

## Get started

To get started:

1. Install [node.js](https://nodejs.org/).
2. Clone the repository.
3. After navigating into the project directory, install project dependencies by running `npm install`.

### Scripts

To run tests a single time, run the following command:

`npm run test`

To run tests continually while developing, run the following command:

`npm run test:watch`

To ensure your code meets our linting standards, run the following command:

`npm run lint`

To create a build, run the following command:

`npm run build`

## Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
