module.exports = {
    build: {
        "index.html": "./index.html",
        "app.js": [
            "./javascripts/app.js"
        ],
        "app.css": [
            "./stylesheets/app.css"
        ]
    },
    rpc: {
        host: "localhost",
        port: 8545,
        network_id: 2,
        gas: 3000000
    },
    networks: {
        "live": {
            network_id: 1, // Ethereum public network
            host: "localhost",
            port: 8545,
            gas: 3000000
        },
        "morden": {
            network_id: 2, // Official Ethereum test network
            host: "localhost",
            port: 8545,
            gas: 3000000
        },
        "dev": {
            network_id: 1999,
            host: "localhost",
            port: 8545,
            gas: 3000000
        }
    }
};