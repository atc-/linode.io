# linode.io
A set of async Linode API wrappers in ES6 & Node JS.

Built on [Promises/A+](https://promisesaplus.com/), this asynchronous implementation provides an efficient and modern
library for interacting with the Linode API.

# API Support

Currently, this library supports:

 * DNS

# Usage

The entrypoint to the client library is the `Linode` class, which is a factory that is used to get each relevant 
service from the API. This saves, amongst other things, having to pass the API key to each module as this is 
injected for you.

The `Linode` class is returned upon a `require` call:

    const Linode = require('linode.io');

Now that it's imported, you create an instance:

    const linode = new Linode(myApiKey);
    
You can then begin to use the services, e.g. DNS:

    const domain = linode.dns();

The rest of this document assumes you've created an instance of `Linode` called `linode`.

## Promises

Each service exposes the relevant API verbs, such as listing, creating or updating. In order to provide efficiency,
every function within a service returns a Promise, which can then be used to chain subsequent behaviour. To do so, merely
register using `then`:

    domain.findDomain('atc.gd').then(console.log);
    
or, a more useful example:

    domain.findDomain('atc.gd').then((d) => { console.log('atc.gd has DomainID' + d.DOMAINID) });
    
Note that you should register rejection handlers, e.g. using `catch`:

    domain.findDomain('atc.gd').then(console.log).catch(console.error);
    // Some time later...
    { [Error: read ECONNRESET] code: 'ECONNRESET', errno: 'ECONNRESET', syscall: 'read' }
    
Otherwise your actions may fail silently.

## DNS

### Listing domains

    const d = linode.dns();
    d.list().then(console.log);
    // See your domains listed
    
### Finding a domain

You can get a [domain's information](https://www.linode.com/api/domain/domain.resource.list) to utilise further:
    
    linode.domain().findDomain('atc.gd').then(console.log);
    
    {
     "DOMAINID":5093,
     "DESCRIPTION":"",
     "TYPE":"master",
     "STATUS":1,
     "SOA_EMAIL":"domain@example.com",
     "DOMAIN":"atc.gd",
     "RETRY_SEC":0,
     "MASTER_IPS":"",
     "EXPIRE_SEC":0,
     "REFRESH_SEC":0,
     "TTL_SEC":0
    }
