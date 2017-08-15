# Premium Content Blog
![Premium Content Blog](https://cosmicjs.imgix.net/e80ab2e0-81d2-11e7-aa84-c93d0ada6a5f-Screen%20Shot%202017-08-15%20at%2010.59.57%20AM.png?w=1200)

### [View the demo](https://cosmicjs.com/apps/premium-content-blog/demo)

### [Install the Premium Content Blog](https://cosmicjs.com/apps/premium-content-blog)

### Getting Started
Start your blogging career with this app that allows you to charge users on a subscription basis, for your premium content.  Simply install the app, add your Stripe keys, then deploy to the Cosmic App Server (or your chosen hosting solution).  [Sign up for Cosmic JS](https://cosmicjs.com) to install and deploy this app in a few minutes.

```
git clone https://github.com/cosmicjs/premium-content-blog
cd premium-content-blog
npm install
```
Create a new file in `config/development.js` and add:
```
module.exports = {
  bucket: {
    slug: 'your-bucket-slug',
    read_key: '', // optional, if added in Your Bucket > Settings
    write_key: '' // optional, if added in Your Bucket > Settings
  }
}

```
Then 
```
NODE_ENV=development npm run dev
```

### Required environment variables
* ```STRIPE_PUBLISHABLE_KEY```: Your Stripe API publishable key
* ```STRIPE_SECRET_KEY```: Your stripe API secret key
