# linode.io
A set of async Linode API wrappers in ES6 & Node JS.

Built on [Promises/A+](https://promisesaplus.com/), this asynchronous implementation provides an efficient and modern
library for interacting with the Linode API.

# API Support

Currently, this library supports:

 * DNS

# Usage

## DNS

### Listing domains

    const Linode = require('linode.io');
    const dns = new Linode(apiKey).dns();
    dns.getDomains().then(console.log);
    // See your domains listed
