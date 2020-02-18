# Launch Turbine Server

Launch SSF, is a next-generation solution that allows running JS code on server.

Turbine Server is the orchestrator within a Launch SSF runtime library (the library deployed on a client website) which processes previously configured rules and delegates logic to extensions.

This project is not intended to be used directly by consumers; it is used by the Launch build system and incorporated into emitted runtime libraries.

## Contributing

Contributions are welcomed! Read the [Contributing Guide](CONTRIBUTING.md) for more information.

To get started:

1. Install [node.js](https://nodejs.org/).
3. Clone the repository.
4. After navigating into the project directory, install project dependencies by running `npm install`.

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
