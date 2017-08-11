# How to Start Your Blogging Career With CosmicJS
You have great ideas. Your head is overflowing with content that you *know* people will pay to read. So where do you start? You're likely inclined to choose a trusted platform like Wordpress, but since you want to offer paid content to your users you now face the problem of making a cumbersome solution even more so.

Instead of tweaking a platform to work with for us, we want a simple, straightforward solution with no more functionality than we need. This, of course, means we're going to build it ourselves.

In the spirit of a simple, straight forward solution that works exactly the way we want it to, we'll be using CosmicJS to host our blog, manage it's users, and store it's content. 

Our project will be a play in two parts. First, we'll build our blog with Express and CosmicJS and use Stripe to handle the blog's payments and subcriptions. Then, we'll leverage CosmicJS's Extension feature to build a dashboard that gives us an overview of our business' backend.

# Part 1: Building the Blog

###1. Boilerplate Setup
To save time on boilerplate, we'll use Yeoman and the Express Generator (which builds on Express' official generator) to get started. If you don't have Yeoman installed, run ```npm i -g yo```. Then install the generator with ```npm i -g generator-express``` and run it with ```yo express```. Follow the instructions to set up your project under a new directory (say ```CosmicUserBlog```), install the *Basic* version, and use Handlebars for your view engine.

Your directory structure is now this:

```bash
CosmicUserBlog
| 
|--bin
|   |--www
|--(node_modules)
|--public
|--routes
|    |--users.js
     |--index.js
|--views
     |--layouts
     |--partials
     |--error.handlebars
     |--index.handlebars
|--.bowerrc
|--.gitignore
|--app.js
|--bower.json
|--gruntfile.js
|--package.json
```

###2. Installations
We'll be using the following packages:
* Async - A powerful async utilities library
* Axios - Simple, promise based http requests
* Cors - Standard cors middleware
* brcypt - For password hashing. (If you're on Windows read [these notes](https://www.npmjs.com/package/bcrypt#dependencies))
* CosmicJs - The official client
* Express Session - So our users can log in
* dateformat - An intuitive date formatter that we'll use with posts
* Stripe - The official client
* TruncateHTML - for post blurbs

You could install these with npm, but I advocate for Yarn. It's significantly faster and we have no time to waste. So install Yarn (on macOS we'll do a ```brew install yarn```) then run ```yarn add async axios cors bcrypt cosmicjs expres-session dateformat stripe truncate-html``` . We're almost ready to start building.

###3. Set Up CosmicJS
Before we start building, we'll need to work out the schema for our Cosmic Bucket. We want to store ```Posts```, ```Users```, and ```Configs``` (to edit site configurations on the fly).

Those three object types will have the following matafields (all of type *text*, given by their *Title*):

####Post:
| Metafield |                 Value |
| --------- | --------------------: |
| Premium   | **true** or **false** |

####User:
| Metafield        |         Value |
| ---------------- | ------------: |
| First name       |        string |
| Last name        |        string |
| Password         | Hashed String |
| Email            |        string |
| Stripe Id        |        string |
| Subsription Type |        string |

####Config:
**Object: Subscriptions**:
| Metafield       |  Value |
| --------------- | -----: |
| Monthly Price   | string |
| Quarterly Price | string |
| Yearly Price    | string |
| Cancellations   | string |

**Object: Site**:
| Metafield  |  Value |
| ---------- | -----: |
| Site Title | string |
| Domain     | String |


Once you've added your ```Post```, ```User```, and ```Config``` object types and created your ```Subscriptions``` and ```Site``` Config objects, we'll get ourselves set up with Stripe.

---

### 4. Configure Stripe

Since we'll be charging users for their premium subscriptions we'll need a payment processor. With a robust API, fair pay-as-you-go pricing, and proven security, using Stripe is a no brainer. Moving foward, we'll need both a "Publishable" and a "Secret" key for Stripe's API and we need to setup Subscription plans for Monthly, Yearly, and Quarterly subscriptions. Follow Stripe's instructions to create these subscriptions and give them the ID's *subscription-monthly*, *subscription-quarterly*, and *subscription-yearly* accordingly.

---

###5. Configure the Express App

 We have our packages installed, we worked out our data schema, and we've set up a a Stripe account. Now we need to configure our Express backend.

The boilerplate Express code is pre-ES5, so for a consistent style we'll ```require``` the packages we need.

At the top of the Express app add:

```javascript
// app.js
var session = require('express-session')
var dateFormat = require('date-format')
var truncate = require('truncate-html')
var cors = require('cors')
```

When we deploy our app, CosmicJS will provide our Bucket keys as well as any custom keys we provide via ```process.env```. Below the require statements, go ahead make those accessible throughout the app by storing them in ```app.locals``` 

```javascript
//app.js

var config = {
    bucket: {
        slug: process.env.COSMIC_BUCKET,
     	read_key: process.env.COSMIC_READ_KEY,
      	write_key: process.env.COSMIC_WRITE_KEY
    }
}
app.locals.config = config
app.locals.stripeKeyPublishable = process.env.STRIPE_PUBLISHABLE_KEY
app.locals.stripeKeySecret = process.env.STRIPE_SECRET_KEY
```

The last step is then to connect the ```cors``` and ```session``` middleware like so:

```javascript
//app.js

app.locals.stripeKeySecret = process.env.STRIPE_SECRET_KEY

app.use(session({
  secret: 'sjcimsoc',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))
app.use(cors())
```

At this point we have a solid base to build our app on and can start drafting out it's views.

---

###6. Sculpt Out the Views

Having a model of how we want our blog to look and feel will help us think about how to wire up it's routes. We'll start with the main layout.

**The Main Layout:**

In handlebars, every page will render inside the ```body``` tag of a default layout. In our boilerplate, this is ```/views/layouts/main.handlebars```. 

We need to make three alterations.
1. in the ```title``` tag, swap out ```{{title}}``` for ```{{config.site_title}}```, which we'll pass via ```res.locals``` later.
2. Before the end of the ```head``` tag add ```    <script src="https://js.stripe.com/v3/"></script>```. This is Stripe's browser client. We only need this for the checkout form, however Stripe reccomends including it on every page to aid in fraud detection.
3. Include Bootstrap. Somewhere in the ```head``` tag add ```    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />``` and right before the end of the ```body``` tag add
```
<script src="https://code.jquery.com/jquery-3.2.1.min.js"
    integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4="
    crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
```
The Main layout now looks like this:

```handlebars
<!-- views/layouts/main.handlebars -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <title>{{config.site_title}}</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />
    {{#if ENV_DEVELOPMENT}}
      <script src="http://localhost:35729/livereload.js"></script>
    {{/if}}
    <script src="https://js.stripe.com/v3/"></script>

  </head>
  <body>


  {{{body}}}

  <script
    src="https://code.jquery.com/jquery-3.2.1.min.js"
    integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4="
    crossorigin="anonymous"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
  </body>
</html>
```

**The Header Partial:**

Handlebars expects partials to be found in the ```/views/partials``` directory by default so we'll make ```header.handlebars``` there. It will look like this:

```handlebars
<header>
  <div class="container">
    <div class="row">
      <div class="col-xs-12 text-center">
        <h1>{{config.site_title}}</h1>
      </div>
    </div>
  </div>
</header>

<nav class="navbar navbar-default">
  <div class="container-fluid">
    <div class="navbar-header">
      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse-header" aria-expanded="false">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
    </div>

    <div class="collapse navbar-collapse" id="navbar-collapse-header">
      <ul class="nav navbar-nav">
        <li {{#if route_posts}}class="active"{{/if}}><a href="/posts">Posts<span class="sr-only">(current)</span></a></li>
        <li><a href="/premium">Premium Content</a></li>
      </ul>
      <ul class="nav navbar-nav navbar-right">
        {{#if logged_in}}
          <li class="navbar-text text-center">Welcome Back, {{user.first_name}}!</li>
          <li><a href="/logout">Logout</a></li>
        {{/if}}

        {{#unless logged_in}}
          <li {{#if route_login}}class="active"{{/if}}><a href="/login">Login</a></li>
          <li {{#if route_signup}}class="active"{{/if}}><a href="/plans">Sign Up</a></li>
        {{/unless}}
      </ul>
    </div>
  </div>
</nav>
```

**Note:** In the header partial we take advantage of Handlebars' built in ```if``` and ```unless``` helpers to make parts of our code route-specific. The we'll pass the relative booleans later in the route handlers.

**The Posts View**

On the Posts page we want to:
1. Display the header
2. Show an error message if the user is trying to access premium posts without an account
3. Abstract the post display logic to it's own partial to make our code cleaner and modular.

For the error message, we'll rely on Handlebars' ```if``` helper as we did before. For showing summaries of the posts, we'll be passing the posts to the view as an array of post objects. This lets us use the Handlebars ```each``` block helper to iterate over that array (each post being accessible as ```this```). Our Posts view will then look like this:

```handlebars
{{> header}}
<div class="container">
  <div class="row">
    {{#if error}}
      <div class="alert alert-danger" role="alert">
        {{error}}
      </div>
    {{/if}}
    {{#each posts}}
      {{> post-container this}}
    {{/each}}
  </div>
</div>
```

**The Post Container partial:**

The next obvious step is to build the container to show summaries of each post on the Posts page. Beyond displaying the post's title and content (which is easily accessed with ```this.title```, etc.) we want to show the user if the post is premium, as well as a truncation of the post's body and it's creation date.

We'll again turn to the ```if``` helper to show a star beside the post if ```this.metadata.premium``` returns ```true```, which is simple enough. For the blurb and creation date, we need to modify the ```content``` and ```created_at``` properties of the Post object; in the first place, to shorten it, in the latter, because Cosmic stores the date in ISO datetime format. To keep display logic out of our views, Handlebars provides us with functionality to write own helpers. 

First, get the view code in place:

```handlebars
<!-- /views/partials/post-container.handlebars -->

<div style="border-bottom: 3px solid #337ab7" class="col-xs-12 col-md-8 col-md-offset-2">
  <h2>
    {{#if this.metadata.premium}}
      <span style="font-size: 0.5em" class="glyphicon glyphicon-star"></span>
    {{/if}}
    <a href="/post/{{this.slug}}">{{this.title}}</a>
  </h2>
  <p style="margin: 35px 40px">
    {{truncateText this.content 20}} <a href="/post/{{this.slug}}">Read more</a>
  </p>
  <em style="margin: 20px 0" class="pull-right">
    {{date this.created_at}}
  </em>
</div>
```

(Hint: our handlebars helpers will be named *truncateText* and *date*.)

Open ```app.js``` and find the snippet of code that sets Handlebars as the view engine. ```exphbs``` is a reference to ```express-handlebars``` and the object passed to it contains the parameters used to instantiate the engine. We need to add the ```helpers``` property to that object. The ```helpers``` property will then point to the ```date``` and ```truncateText``` methods as follows:

```javascript
// app.js

// etc...
app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  partialsDir: ['views/partials/'],
  helpers: {
    date: function(date) {
      return dateFormat(new Date(date), "dddd, mmmm dS, yyyy")
    },
    truncateText: function(text, length) {
      return truncate(text, length, { stripTags: true, byWords: true })
    }
  }
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');
// etc...
```

To illustrate, ```{{truncateText this.content 20}}``` tells Handlebars to render the result of ```truncate(this.content, 20, {...} )``` .

**The Post View:**

Our users need to be able to read individual posts, so we'll build a simple view that get's passed an array that's one post long. (In the future, outside the scope of this guide, we may find it useful to use the view to display multiple full posts in succession.)

We'll also display an error if the post isn't found. Create your post view like so:

```handlebars
<!-- /views/post.handlebars -->

{{> header}}
{{#if not_found}}
  <div class="container">
    <div class="row text-center">
      <div class="col-xs12 col-md-6 col-md-offset-3">
        <div class="alert alert-danger">
          Post Not Found!
        </div>
        <a href="/posts">See All Posts</a>
      </div>
    </div>
  </div>
{{/if}}

{{#each post}}
  <article class="container">
    <div class="row">
      <div class="col-xs-12 col-sm-8 col-sm-offset-2">
        <h1>{{this.title}}</h1>
        <div class="lead" style="font-size: 1.5em">
          {{{this.content}}}
        </div>
        <em class="pull-right">
          <time>{{date this.created_at}}</time>
        </em>
      </div>
    </div>
  </article>
{{/each}}
```

**The Login Page:**

The login page will be the simplest yet - a basic form that POSTs to a login route.

```handlebars
<!-- /views/login.handlebars -->

{{> header}}

<div class="container">
  <div class="row">
    <div class="col-xs-12 col-sm-4 col-sm-offset-4">
      <h1>Log In</h1>
      <p class="text-muted">
        Log in to view premium content.
      </p>

      <form method="post">
        <input class="form-control" type="email" name="email" placeholder="Email" required/>
        <input type="password" class="form-control" name="password" placeholder="Password" required />
        <button class="btn btn-lg btn-primary btn-block submit-btn" type="submit">Log in</button>
      </form>
    </div>
  </div>
</div>

<style>
  form > input, button {
    margin-top: 12px;
  }
</style>
```

**The Plans Page:**

Obviously, our users will need to be able to signup before they can login, but since we're giving them the option to choose one of three subscription plans we'll build out a view that shows them their options just before checking out. Later, we'll need to pass the Subscriptions object to this view so we can set the plan prices from Cosmic, rather than hard coding them. The view will look like this:

```handlebars
<!-- /views/plans.handlebars -->

{{> header}}

<div class="container">
  <div class="row text-center lead">
    <h1>Choose a Plan to Read Premium Content</h1>
    <p>
      Sign up to view Premium Content on {{config.site_title}}
    </p>
  </div>

  <div class="row">
    <div class="col-sm-4">
      <h3 class="text-center text-muted">
        Monthly
      </h3>
      <p class="text-center">
        <strong>Billed every month</strong>
      </p>
      <h1 class="text-center text-success">{{subscriptions.monthly_price}}</h1 class="text-center text-success">
      <ul class="list-unstyled lead" style="padding: 0 20px">
        <li>
          <span class="glyphicon glyphicon-ok text-success"></span>Here's a good benefit
        </li>
        <li>
          <span class="glyphicon glyphicon-ok text-success"></span>A reason to buy
        </li>
        <li>
          <span class="glyphicon glyphicon-ok text-success"></span>Why you have to have it
        </li>
        <li>
          <span class="glyphicon glyphicon-ok text-success"></span>Why you shouldn't miss out
        </li>
        <li>
          <span class="glyphicon glyphicon-ok text-success"></span>Believe it.
        </li>
      </ul>
      <a href="/signup?plan=monthly"><button class="btn btn-block btn-default btn-lg">Sign Up</button></a>
    </div>
    <div class="col-sm-4" style="border: 2px solid #3c763d">
      <h3 style="background: #3c763d;color: white;padding: 7px 0" class="text-center text-success">
        Yearly
      </h3>
      <p class="text-center">
        <strong>Billed every 12 months</strong>
      </p>
      <h1 class="text-center text-success">{{subscriptions.yearly_price}}</h1>
        <ul class="list-unstyled lead" style="padding: 0 20px">
          <li>
            <span class="glyphicon glyphicon-ok text-success"></span>Here's a good benefit
          </li>
          <li>
            <span class="glyphicon glyphicon-ok text-success"></span>A reason to buy
          </li>
          <li>
            <span class="glyphicon glyphicon-ok text-success"></span>Why you have to have it
          </li>
          <li>
            <span class="glyphicon glyphicon-ok text-success"></span>Why you shouldn't miss out
          </li>
          <li>
            <span class="glyphicon glyphicon-ok text-success"></span>Believe it.
          </li>
        </ul>
        <a href="/signup?plan=yearly"><button class="btn btn-block btn-default btn-lg">Sign Up</button></a>
    </div>
    <div class="col-sm-4">
      <h3 class="text-center text-muted">
        Quarterly
      </h3>
      <p class="text-center">
        <strong>Billed every 3 months</strong>
      </p>
      <h1 class="text-center text-success">{{subscriptions.quarterly_price}}</h1 class="text-center text-success">
        <ul class="list-unstyled lead" style="padding: 0 30px">
          <li>
            <span class="glyphicon glyphicon-ok text-success"></span>Here's a good benefit
          </li>
          <li>
            <span class="glyphicon glyphicon-ok text-success"></span>A reason to buy
          </li>
          <li>
            <span class="glyphicon glyphicon-ok text-success"></span>Why you have to have it
          </li>
          <li>
            <span class="glyphicon glyphicon-ok text-success"></span>Why you shouldn't miss out
          </li>
          <li>
            <span class="glyphicon glyphicon-ok text-success"></span>Believe it.
          </li>
        </ul>
        <a href="/signup?plan=quarterly"><button class="btn btn-block btn-default btn-lg">Sign Up</button></a>
    </div>
  </div>
</div>



<style>
  form > input, button {
    margin-top: 12px;
  }
  ul.lead {
    margin-top: 40px
  }
  .lead > li {
    margin: 8px 0
  }
  .glyphicon {
    margin-right: 12px
  }
  .btn {
    margin: 35px 0px;
  }
</style>
```

*Notice that each Sign Up button links to the ```signup``` route, passing a query paramter associated with the plan selected. I.e. ```/signup?plan={:plan}```*

**The Signup Page:**

Last, but certainly not least - the money maker. We've saved our most complicated view for last. These are our requirements:

1. We need to pass the plan chosen on the page before in ```planName```. (Later we'll do this in a URL query string)
2. We need to use the Stripe Elements API for collecting credit card information. This is what we included ```Stripe.js``` in the Main layout earlier. At the end of our checkout form we need two ```div```s; one ID'd ```card-element``` and the other ID'd ```card-errors``` for ```Stripe.js``` to inject into after the initial DOM rendering.
3. We need to pass our publishable stripe key to make it all work.

Starting with the HTML we have:

```handlebars
<!-- /views/signup.handlebars -->
{{>header}}

<div class="container">
  <div class="row">
    <form method="post" id="payment-form">
      <div class="col-xs-12 text-center">
        <h4 class="lead"><em>You're one step away from a <u>{{planName}}</u> subscription to {{config.site_title}}!</em></h4>
      </div>
    </div>
    <div class="row"  style="margin-top: 30px">
      <div class="col-md-8 col-md-offset-2">
        <h4>Enter your account details and payment information</h4>

        <label for="first_name">First name:</label>
        <input type="text" name="first_name" class="form-control" placeholder="First name" required />
        <label for="last_name">Last name:</label>
        <input type="text" name="last_name" class="form-control" placeholder="Last name" required />
        <label for="email">Email:</label>
        <input type="email" name="email" class="form-control" placeholder="Email" required />
        <label for="password">Password</label>
        <input type="password" name="password" class="form-control" placeholder="Password" required />
        <label for="card-element">Credit or debit card</label>
        <div class="form-control" id="card-element"></div>
        <div id="card-errors" role="alert"></div>
        <button id="submit-button" class="btn-success btn btn-lg btn-block btn-default" >Submit Payment</button>

      </div>
    </div>
    </form>
</div> 
```

  Then, for simplicity, we'll follow this with an inline script that integrates Stripe:

```javascript
<!-- views/signup.handlebars -->

<script>
  var stripe = Stripe('{{stripeKeyPublishable}}')
  var elements = stripe.elements()
  var card = elements.create('card')
  var style = {
      base: {
        color: '#32325d',
        lineHeight: '24px',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

  card.mount('#card-element', {style: style})

  // Handle real-time validation errors from the card Element.
card.addEventListener('change', function(event) {
  var displayError = document.getElementById('card-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
});

// Handle form submission
var form = document.getElementById('payment-form');
var submitButton = document.getElementById('submit-button');
form.addEventListener('submit', function(event) {
  event.preventDefault();
  submitButton.disabled=true
  stripe.createToken(card).then(function(result) {
    if (result.error) {
      // Inform the user if there was an error
      var errorElement = document.getElementById('card-errors');
      errorElement.textContent = result.error.message;
      submitButton.disabled=false
    } else {
      // Send the token to your server
      stripeTokenHandler(result.token);
    }
  });
});

function stripeTokenHandler(token) {
  // Insert the token ID into the form so it gets submitted to the server
  var form = document.getElementById('payment-form');
  var hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'stripeToken');
  hiddenInput.setAttribute('value', token.id);
  form.appendChild(hiddenInput);
  // Submit the form
  form.submit();
}
</script>

<style>
  label,button {
    margin-top: 22px;
  }
</style>
```

Here's what's going on:

1. We instantiate Stripe with the Publishable key we passed, assign its ```elements``` library to it's own variable, use that to create a ```card``` element, and finally mount that to the ```<div id="card-element">``` we created earlier. The card object handles card validation, comes packaged with good UX features, and reports errors back to the user in real time.
2. We attach an event listener to the card object that responds to any change in either the user-inputted card number, CCV, or expiration date. It mounts that error on ```<div id="card-errors">```
3. We handle the form submission manually. First, we prevent the default action and disable multiple submissions. Then, barring no errors, we attach a hidden field to the form that contains Stripe's validation token, provided by ```Stripe.js```, and *then* submit the form to the ```Signup``` route.

---

### 7. Build the Routes

With our views built, we know exactly what routes our application needs. Namely:

- Posts
- Post
- Premium
- Login
- Logout
- Signup
- Plans

By default, your app has a ```Users``` route and an ```Index``` route. Delete ```Users``` and make ```Index``` redirect to ```Posts``` like so:

```javascript
// /routes/index.js

var express = require('express')
var router = express.Router()

router.get('/', function(req, res) {
  res.redirect('/posts')
});

module.exports = router
```

**The Posts Route:**

Posts will use ```async``` to string together a series of async functions: one using the CosmicJS client to get our Posts, the next using Cosmic to get the site config and render the ```posts``` view, passing in the relevant locals. If the user is not in an authenticated session, we'll use ```lodash``` to filter out the posts returned from Cosmic which *have not* been labelled premium (and are therefore free to read). We'll pass the Posts, Config, and route-specific view data via ```res.locals```.

```javascript
var express = require('express');
var router = express.Router();
var cosmic = require('cosmicjs');
var async = require('async');
var _ = require('lodash')

router.get('/', function(req, res) {
  async.series([
    function(cb) {
      cosmic.getObjectType(req.app.locals.config, { type_slug: 'posts' }, function(err, response) {
        (req.session.user) ? res.locals.posts = response.objects.all : res.locals.posts = _.filter(response.objects.all, function(post) {
          return !post.metadata.premium
        })
        cb()
      })
    },
    function(cb) {
      cosmic.getObject(req.app.locals.config, { slug: 'site' }, function(err, response) {
        res.locals.config = response.object.metadata
        res.locals.user = req.session.user
        res.locals.route_posts = true
        if (req.session.user) res.locals.logged_in = true
        return res.render('posts.handlebars')
      })=
    }
  ])
});

module.exports = router;
```

**The Post Route:** 

Having a route for all posts, we'll need a companion route for a singular post that takes the post slug as a URL parameter and returns that post if it's found, utilizing similar logic as the ```Posts``` route.

```javascript
// routes/post.js

var express = require('express');
var router = express.Router();
var cosmic = require('cosmicjs');
var async = require('async');
var _ = require('lodash')

router.get('/:slug', function(req, res) {
  async.series([
    function(cb) {
      cosmic.getObjectType(req.app.locals.config, { type_slug: 'posts' }, function(err, response) {
        res.locals.post = _.filter(response.objects.all, function(post) {
          return post.slug === req.params.slug
        })
        if (!res.locals.post) res.locals.not_found = true
        cb()
      })
    },
    function(cb) {
      cosmic.getObject(req.app.locals.config, { slug: 'site' }, function(err, response) {
        res.locals.config = response.object.metadata
        res.locals.user = req.session.user
        return res.render('post.handlebars')
      })
    }
  ])
});

module.exports = router
```

**The Login Route:**

To let users have access to premium posts, we'll need to collect their login information, hash their password with bcrypt, and check it against the password associated with the email address stored in Cosmic.

A GET request will render the login form. We then handle the form's POST request by retrieiving all users from Cosmic and iteratating over all users with a series of two async functions: one using bcrypt to compare password hashes, the next saving the user's data into a session if they're found.

```javascript
// routes/login.js

var express = require('express');
var router = express.Router();
var cosmic = require('cosmicjs');
var async = require('async');
var _ = require('lodash')
var bcrypt = require('bcrypt')

router.get('/', function(req, res) {
  async.series([
    function(cb) {
      cosmic.getObject(req.app.locals.config, { slug: 'site' }, function(err, response) {
        res.locals.config = response.object.metadata
        res.locals.route_login = true
        return res.render('login.handlebars')
      })
    }
  ])
});

router.post('/', function(req, res) {
  cosmic.getObjectType(req.app.locals.config, { type_slug: 'users' }, function (err, response) {
    if (err) res.status(500).json({ status: 'error', data: response })
    else {
      async.eachSeries(response.objects.all, function (user, eachCb) {
        if (!_.find(user.metafields, { key: 'email', value: req.body.email.trim().toLowerCase() }))
          return eachCb()
        const stored_password = _.find(user.metafields, { key: 'password' }).value
        bcrypt.compare(req.body.password, stored_password, function (err, correct) {
          if (correct) res.locals.user_found = user
          eachCb()
        })
      }, function () {
        if (res.locals.user_found) {
          req.session.user = {
            first_name: res.locals.user_found.metafield.first_name.value,
            last_name: res.locals.user_found.metafield.last_name.value,
            email: res.locals.user_found.metafield.email.value
          }
          req.session.save()
          return res.redirect('/posts')
        }
        return res.status(404).json({ status: 'error', message: 'User not found' })
      })
    }
  })
})

module.exports = router
```

**The Plans Route:**

Before a user can log in, we need a sign up form so we can have users in the first place. As said before, we'll show them their subscription options right before the signup form. This does nothing more than pass the Site and Subscription configs before rendering the view:

```javascript
var express = require('express');
var router = express.Router();
var cosmic = require('cosmicjs');
var async = require('async')

router.get('/', function(req, res) {
  async.series([
    function(cb) {
      cosmic.getObject(req.app.locals.config, { slug: 'site' }, function(err, response) {
        res.locals.config = response.object.metadata
        res.locals.route_signup = true
        cb()
      })
    },
    function(cb) {
      cosmic.getObject(req.app.locals.config, { slug: 'subscriptions' }, function(err, response) {
        res.locals.subscriptions = response.object.metadata
        res.render('plans.handlebars')
      })
    }
  ])
});

module.exports = router;
```

**The Signup Route:**

As you might have guessed, the signup route has the most going on out of them all. Here's what we need to implement:

1. On a GET request, render the signup form and pass our publishable Stripe key through ```res.locals``` for Stripe.js to work.
2. On a Post request:
   1. Instantiate Stripe server-side with our secret key
   2. If a user's already logged in, redirect them.
   3. Run a series of two *named* async functions (so we can use their return values after both have completed) to fetch our subscription data from Cosmic and hash the password.
   4. Having completed Step 3, we use the Stripe API to create a new customer, associating their payment method via the Stripe token we passed from the signup form.
   5. We then charge that customer based on the plan selected and create a new subscription (again, via Stripe) so recurring payments are processed automatically.
   6. We create a new User object based on our Cosmic schema, add that to our bucket, and once that's succesful we create a new session for the user and redirect them to the ```Posts``` route, where they'll now be able to view premium content.

All complete, it will look like this:

```javascript
// routes/signup.js

var express = require('express');
var router = express.Router();
var cosmic = require('cosmicjs');
var async = require('async');
var bcrypt = require('bcrypt')

router.get('/', function(req, res) {
  if (req.session.user) res.redirect('/')
  async.series([
    function(cb) {
      cosmic.getObject(req.app.locals.config, { slug: 'site' }, function(err, response) {
        res.locals.config = response.object.metadata
        res.locals.route_signup = true
        cb()
      })
    },
    function(cb) {
      cosmic.getObject(req.app.locals.config, { slug: 'subscriptions' }, function(err, response) {
        res.locals.subscriptions = response.object.metadata
        res.locals.stripeKeyPublishable = req.app.locals.stripeKeyPublishable
        res.locals.planName = req.query.plan
        res.render('signup.handlebars')
      })
    }
  ])
});

router.post('/', function(req, res) {
  var stripe = require('stripe')(req.app.locals.stripeKeySecret)
  if (req.session.user) res.redirect('/')

  async.series({
    subscriptions: function(callback) {
      cosmic.getObject(req.app.locals.config, { slug: 'subscriptions' }, function(err, response) {
        callback(null, response.object.metadata)
      })
    },
    hash: function (callback) {
      bcrypt.hash(req.body.password, 10, function (err, hash) {
        callback(null, hash)
      })
    }
  }, function (err, results) {

    stripe.customers.create({
      email: req.body.email,
      source: req.body.stripeToken
    }).then(function (customer) {
      return stripe.charges.create({
        amount: results.subscriptions[req.query.plan + "_price"].replace(/[$]/,'') + '00',
        currency: "usd",
        customer: customer.id
      })
    }).then(function (charge) {
      stripe.subscriptions.create({
        customer: charge.customer,
        items: [
          {
            plan: 'subscription-' + req.query.plan
          }
        ]
      })
      var object = {
        type_slug: 'users',
        title: req.body.first_name + ' ' + req.body.last_name,
        metafields: [
          {
            title: 'First name',
            key: 'first_name',
            type: 'text',
            value: req.body.first_name
          },
          {
            title: 'Last name',
            key: 'last_name',
            type: 'text',
            value: req.body.last_name
          },
          {
            title: 'Password',
            key: 'password',
            type: 'text',
            value: results.hash
          },
          {
            title: 'Email',
            key: 'email',
            type: 'text',
            value: req.body.email
          },
          {
            title: 'Stripe Id',
            key: 'stripe_id',
            type: 'text',
            value: charge.customer
          },
          {
            title: 'Subscription Type',
            key: 'subscription_type',
            type: 'text',
            value: req.query.plan
          }
        ]
      }
      if (req.app.locals.config.bucket.write_key) object.write_key = req.app.locals.config.bucket.write_key
      cosmic.addObject(req.app.locals.config, object, function (err, reponse) {
        if (err)
          res.status(500).json({ data: reponse })
        else {
          req.session.user = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email
          }
          req.session.save()
          res.redirect('/posts')
        }
      })
    })
  })
})

module.exports = router
```

**The Logout Route:**

To be user friendly we'll need to give our users a chance to log out. All this requires is a POST request to ```/logout``` and a quick ```session.destroy()``` call.

```javascript
var express = require('express')
var router = express.Router()

/* GET home page. */

router.get('/', function(req, res) {
  req.session.destroy()
  return res.redirect('/')
});

module.exports = router
```

**Wiring Them All Together:**

Having all of our routes built and ready to work as we need them to, we'll ```require``` them all in our app and point their associated enpoints to them via ```app.use()```

```javascript
// app.js

var routes = require('./routes/index');
var posts = require('./routes/posts');
var post = require('./routes/post')
var login = require('./routes/login')
var logout = require('./routes/logout')
var signup = require('./routes/signup')
var plans = require('./routes/plans')
var premium = require('./routes/premium')
var api = require('./routes/api')

app.use('/', routes);
app.use('/post', post)
app.use('/posts', posts)
app.use('/login', login)
app.use('/logout', logout)
app.use('/signup', signup)
app.use('/plans', plans)
app.use('/premium', premium)
app.use('/api', api)
```

**Moving On to the Extension:**

If you've done everything right up until this point, your blog now works exactly as you'd expect it to. To test, go ahead and run ```npm start```, create a few posts in Cosmic and verify that they're being fetched. Then create a dummy account and make sure it's being stored in Cosmic and registered by Stripe. Then, we'll build our dashboard extension for Cosmic.

---

# Part 2: Building the Extension

Stripe provides us with an impressive amount of analytics, however we want a central location to get a quick glance at a list of all of our users, what subscription plan they're on, and three key metrics about our blog: revenue to date, active subscriptions, and cancellations to date.

CosmicJS gives us the ability to do this by utilizing it's extension feature, which lets us upload a SPA with ```index.html``` as an entry point that gets loaded into a frame in our Cosmic dashboard. Bucket keys are then provided to it via URL query strings.

We'll be building the extension with React, namely because our extension only requires a view layer.

### Setup

To keep ourselves organized we'll store our app under our ```CosmicUserBlog``` directory. Our tree will look like this:

```
CosmicUserBlog
|
|--extensions
|    |--subscription-management
|    |            |--client
|    |            |    |--components
|    |            |    |--index.js
|    |            |    |--index.html
|    |            |--dist
```

Once you have your directory structure in place, run ```yarn init``` and we'll move onto installaitons.

### Installations

We need these packages:

- async
- axios
- babel-preset-2015
- Babel-preset-2016
- cosmicjs
- html-webpack-plugin - for generating our html with webpack
- lodash
- query-string - an easy way to parse bucket keys
- path
- react
- react-dom
- react-loading
- webpack
- babel-core
- babel-loader
- babel-preset-react

Run ```yarn add async axios babel-preset-2015 babel-preset-2016 cosmicjs html-webpack-plugin lodash query-string path react react-dom react-loading webpack babel-core babel-loader-babel-preset-react```, then we'll dive in.

### Configure Webpack and Babel

First, make ```.babelrc``` in the root folder and tell it how to transpile our code:

```json
// .babelrc

{
  "presets": [
    "es2016", "es2015", "react"
  ]
}

```

Then, again under ```CosmicUserBlog/extensions/subscription-management```, make ```webpack.config.js``` so we can tell Webpack how to package our modules.

```javascript
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './client/index.js',
  output: {
    path: path.resolve('dist'),
    filename: 'index_bundle.js'
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './client/index.html',
      filename: 'index.html',
      inject: 'body'
    })
  ]
}

```

```dist``` will contain all of our output files (those being ```index_bundle.js``` and ```index.html```) and we'll ultimately compress ```dist``` to upload as our extension. html-webpack-plugin will take our html template from ```client/index.html``` and link to our compiled javascript in ```dist/index.html``` upon building.

### Create an Entry File

We want to use Boostrap and we need a ```div``` (which we'll ID as ```root```) for our React App to mount onto. ```client/index.html``` should look like this:

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />
  </head>
  <body>
    <div id="root">
      <script
        src="https://code.jquery.com/jquery-3.2.1.min.js"
        integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4="
        crossorigin="anonymous"></script>
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
  </body>
</html>

```

### Build the React App

**1. Create an Entry Point**

We have everything in place to start getting our hands dirty. We'll use ```client/index.js``` as an entry point for our React app. We'll import React, set it as a global, pass our cosmic keys to it in it's props, and mount the App component (which we'll make next) to ```<div id="root">```.

```javascript
import React from 'react'
import ReactDom from 'react-dom'
import App from './components/App'
import QueryString from 'query-string'

window.React = React
const url = QueryString.parse(location.search)

const cosmic = { bucket: {
    slug: url.bucket_slug,
    write_key: url.write_key,
    read_key: url.read_key
  }
}

ReactDom.render(
  <App cosmic={cosmic}/>,
  document.getElementById('root')
)

```

**2. Build the App Component**

To keep our app modular, we'll have a tiered component structure that looks like this:

```
components
|
|--App.js
|--Header.js
|--SubscriberData
|        |
|        |--SubscriberContainer.js
|		 |--Loader.js
|		 |--StatsContainer.js
|		 |--StatTicker.js
|		 |--UserList.js
```

```Header``` and ```SubscriberContainer``` will be immediate children of ```App```. ```Loader```, ```UserList```, and ```StatsContainer``` will all be immediate children of ```SubcriberContainer```. Finally, ```StatsContainer``` will be composed of ```StatTicker```s. 

Aside from keeping an organized project, this structure allows us to maximize our number of *stateless functional components* which are not React classes and also happen to be <u>fast</u>.

Starting at the top of the heirarchy, we'll build an App  component that stores our Cosmic keys in it's state and renders a ```Header``` and a ```SubscriberContainer```.

```javascript
// components/App.js

import { Component } from 'react'
import Header from './Header'
import SubscriberContainer from './SubscriberData/SubscriberContainer'

export default class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      cosmic: this.props.cosmic
    }
  }

  render() {
    return (
      <div>
        <Header
          bucket={this.state.cosmic.bucket.slug} />
        <SubscriberContainer
          cosmic={this.state.cosmic} />
      </div>
    )
  }
}
```

The next obvious step is to build out the Header component.

**Build the Header:**

Header will be our first stateless functional component, taking only our bucket slug as a prop:

````javascript
const Header = ({ bucket }) =>
  <nav className="navbar navbar-default">
    <div className="container-fluid">
      <ul className="nav navbar-nav">
        <li className="navbar-text"><strong>Managing Subscriptions for: </strong><em>{bucket}</em></li>
      </ul>
    </div>
  </nav>

export default Header

````

**Build the Subscriber Container:**

```SubscriberContainer``` will handle all of the logic associated with our subscriber data and render ```StatsContainer``` and ```UserList``` to display the data it processes.

```SubscriberContainer``` will be a stateful React class containing the following:

1. A constructor that initializes ```SubscriberContainer```'s state to contain our Cosmic keys (which we've passed as props) and reflect our subscriber data. We intialize the Revenue, Users, and Cancellations stats to ```'Loading…'``` and their loading state to ```true```.
2. An override for ```componentDidMount()``` to get our component to fetch the data we need after it mounts to the DOM, and then refresh that data every minute.
3. A ```getRevenue()``` method to fetch (in an admittedly hack-ish way) our revenue by iterating over the subscription types of our active users from Cosmic and storing the calculated revenue in the state.
4. A ```getUsers()``` method to fetch all of our users from Cosmic and store them in an array in the state, as well as their total.
5. A ```getCancellations()``` method to grab the amount of cancelled subscriptions from our ```Subscriptions``` config object. (Later we'll be updating that number with a webhook from Stripe.)
6. A ```render()``` method to render our ```Loader``` component (only if we're fetching data), ```StatsContainer```, and ```UserList```.

All put together, we have this:

```javascript
import { Component } from 'react'
import Cosmic from 'cosmicjs'
import async from 'async'
import _ from 'lodash'
import StatsContainer from './StatsContainer'
import Loader from './Loader'
import UserList from './UserList'

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
})

export default class App extends Component {
 
  constructor(props) {
    super(props)
    this.state = {
      cosmic: this.props.cosmic,
      stats: {
        revenue: 'Loading...',
        users: 'Loading...',
        cancellations: 'Loading...'
      },
      users: [],
      fetchingRevenue: true,
      fetchingUsers: true,
    }
  }

  fetchData() {
    this.getRevenue();this.getUsers();this.getCancellations()
  }

  componentDidMount() {
    this.fetchData()
    setInterval(() => {
      this.fetchData()
    }, 60000)
  }

  getRevenue(cosmic) {
    this.setState({ fetchingRevenue: true})
    async.series([
      callback => {
        Cosmic.getObject(this.state.cosmic, { slug: 'subscriptions' }, (err, response) => {
          callback(null, response.object)
        })
      },
      callback => {
        Cosmic.getObjectType(this.state.cosmic, { type_slug: 'users' }, (err, response) => {
          callback(null, response.objects.all)
        })
      }
    ], (err, results) => {
      let subscriptions = results[0], users = results[1];
      let currentStats = this.state.stats
      currentStats.revenue = formatter.format(users.map(user =>
        parseInt(subscriptions.metadata[`${user.metadata.subscription_type}_price`].replace('$', ''))
      )
      .reduce((sum, val) => sum + val))
      this.setState({ stats: currentStats })
      this.setState({ fetchingRevenue: false })
    })
  }

  getUsers(cosmic) {
    this.setState({ fetchingUsers: true })
    Cosmic.getObjectType(this.state.cosmic, { type_slug: 'users' }, (err, response) => {
      if (err) {
        currentStats = this.state.stats
        currentStats.users = 'Error'
        this.setState({ stats: currentStats })
      } else {
        let currentStats = this.state.stats
        currentStats.users = isNaN(response.total) ? 0 : response.total
        this.setState({ stats: currentStats })
        this.setState({ users: response.objects.all })
        this.setState({ fetchingUsers: false })
      }
    })
  }

  getCancellations(cosmic) {
    this.setState({ fetchingCancellations: true})
    Cosmic.getObject(this.state.cosmic, { slug: 'subscriptions' }, (err, response) => {
      if (err) {
        currentStats = this.state.stats
        currentStats.users = 'Error'
        this.setState({ stats: currentStats })
      } else {
        let currentStats = this.state.stats
        currentStats.cancellations = isNaN(response.object.metadata.cancellations) ? 0: response.object.metadata.cancellations
        this.setState({ stats: currentStats })
        this.setState({ fetchingCancellations: false })
      }
    })
  }

  render() {
    return (
      <div className="container">
        <Loader loadingState={this.state.fetchingUsers || this.state.fetchingRevenue || this.state.fetchingCancellations} />
        <StatsContainer stats={this.state.stats} />
        <UserList users={this.state.users}/>
      </div>
    )
  }
}
```

We're now left with four stateless functional components to build out. These are:

**1. Loader:**

```javascript
import ReactLoading from 'react-loading'

const Loader = ({ loadingState }) =>
  <div className="row" style={{display: loadingState ? 'block' : 'none' }}>
    <div className="col-xs-12">
      <div className="pull-right">
        <ReactLoading height='20px' width='20px' type="spin" color="#444" />
      </div>
    </div>
  </div>

export default Loader
```

Which makes use of the handy ```react-loading``` package.

**2. StatsContainer:**

```javascript
import StatTicker from './StatTicker'

const StatsContainer = ({ stats }) =>
  <div className="row">{Object.keys(stats).map((key, index) =>
      <div key={index} className="col-md-4 text-center"><StatTicker name={key} value={stats[key]} /></div>
    )}
  </div>


export default StatsContainer
```

**3. StatTicker:**

```javascript
const StatTicker = ({ name, value }) =>
  <div><h3 className="lead text-muted">{name}</h3><h1 className="text-primary">{value}</h1></div>

export default StatTicker
```

and finally...

**4. UserList:**

```javascript
const UserList = ({ users, deleteUser }) =>
  <div style={{marginTop: 50 + 'px'}} className="row">
    <div className="col-xs-12">
      <h4 className="pull-left lead">All Users:</h4>
      <table className="table table-responsive table-hover">
        <thead>
          <tr>
            <th>Stripe ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) =>
            <tr key={index}>
              <td>{user.metadata.stripe_id}</td>
              <td>{user.metadata.first_name}</td>
              <td>{user.metadata.last_name}</td>
              <td>{user.metadata.email}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>


export default UserList

```

### Integrate Stripe Webhooks

To get our cancelled subscriber count, we'll udpate a ```cancellations``` metafield in our Cosmic ```Subscriptions``` object. To do this, we'll receive a webhook from Stripe through our Express app every time we delete a subscription on Stripe. 

1. Set up webhooks in Stripe and point them to the domain your Express app is deployed to.
2. Create an ``api`` route at ```CosmicUserBlog/routes/api.js``` and ```require``` it in ```App.js```.
3. Handle POST requests with a ```switch``` statement acting on ```req.body```. When Stripe sends us a subscription cancellation webhook, ```req.body.type``` will be ```customer.subscription.deleted```.
4. Delete the User object from Cosmic, get the Subscription object from Cosmic, shallow copy the object, increment ```metadata.cancellations```, then use Cosmic's REST API to push the changes to the object.
5. Respond with a ```200``` code so Stripe can confirm receipt of the webhook.

Here's the finshed product:

```javascript
var express = require('express')
var router = express.Router()
var cosmic = require('cosmicjs')
var axios = require('axios')

router.post('/', function(req, res) {
  event = req.body
  switch (event.type) {
    case 'customer.subscription.deleted':
      cosmic.deleteObject(req.app.locals.config, { slug: 'user', write_key: req.app.locals.config.bucket.slug }, function (err, response) {
        cosmic.getObject(req.app.locals.config, { slug: 'subscriptions' }, function (err, response) {
          var currentObject = response.object
          currentObject.metadata.cancellations = currentObject.metadata.cancellations + 1
          currentObject.metafield.cancellations.value = currentObject.metadata.cancellations + 1
          currentObject.write_key = req.app.locals.config.bucket.write_key
          axios({
            method: 'put',
            url: `https://api.cosmicjs.com/v1/${req.app.locals.config.bucket.slug}/edit-object`,
            data: currentObject
          }).then(function (axRes) {
            console.log('Success')
          }).catch(function (axError) {
            console.log('Error')
          })
        })
      })
      return res.json({ received: true})
      break;
    default:
      return res.json({ received: false })
  }
});

module.exports = router

```

### Deploy

To tell Cosmic what your extension is, you'll need to add ```extension.json``` to your ```dist``` folder. We'll configure our extension like this:

```json
// dist/extension.json

{
  "title": "Subscription Management",
  "font_awesome_class": "fa-gears",
  "image_url": ""
}
```

# Conclusion

Using CosmicJS, Express, Stripe, and React, we've built both a monetizable blog that lets our readers subscribe to read premium content and a convenient dashboard to view data about our blog. We've integrated Stripe for secure payments and we've built an app that does as much as we want it to do with room to grow.

With how quickly we've been able to build our app and with the simplicity of deploying and maintaining it, it's clear that CosmicJS is one of a kind in its API first approach to content management. Clearly, CosmisJS is a money maker.

---

*Matt Cain builds smart web applications and writes about the tech used to build them. You can learn more about him on his [portfolio](http://mattcain.io)*.