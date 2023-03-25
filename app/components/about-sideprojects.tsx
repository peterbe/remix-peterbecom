import React from "react";
import type { ReactNode } from "react";
import { Link } from "@remix-run/react";

type SideProject = {
  id: string;
  title: string;
  image: {
    url: string;
    width: number;
    height: number;
  };

  url: string;
  nofollow?: boolean;
  body: ReactNode | string;
};

export const sideProjects: SideProject[] = [];

sideProjects.push({
  id: "youshouldwatch",
  title: "You Should Watch",
  image: {
    url: "/images/about/youshouldwatch.png",
    width: 110,
    height: 110,
  },
  url: "https://ushdwat.ch",
  body: (
    <p>
      You Should Watch is a mobile-friendly web app for remembering and sharing
      movies and TV shows you should watch. Like a to-do list to open when you
      finally sit down with the remote in your hand.
      <br />
      <Link to="/plog/announcing-you-should-watch">
        Blog post about it here
      </Link>
      .{" "}
      <Link to="/plog/the-technology-behind-you-should-watch">
        Blog post about the technology used
      </Link>
      .
    </p>
  ),
});

sideProjects.push({
  id: "docsql",
  title: "docsQL",
  image: {
    url: "/images/about/docsql.png",
    width: 100,
    height: 100,
  },
  url: "https://github.com/peterbe/docsql",
  body: (
    <p>
      A web app where you bring your own data. Where the data is a repository of
      Markdown files. Then, you can query all of this Markdown data with SQL
      queries.{" "}
      <a href="https://github.com/peterbe/docsql#screenshots-as-of-mar-2022">
        Screenhots in the README
      </a>
      .
      <br />
      <Link to="/plog/introducing-docsql">Blog post about it here</Link>.
    </p>
  ),
});

sideProjects.push({
  id: "thatsgroce",
  title: "That's Groce!",
  image: {
    url: "/images/about/thatsgroce.png",
    width: 120,
    height: 120,
  },
  url: "https://thatsgroce.web.app/about",
  body: (
    <p>
      A grocery shopping and meal planning app. Built in{" "}
      <a href="https://github.com/preactjs/preact-cli">Preact</a> on the{" "}
      <a href="https://firebase.google.com/">Firebase platform</a>.
      <br />
      It&apos;s built specifically as <b>mobile web app</b> with service workers
      and server-side rendered pages for{" "}
      <a href="https://twitter.com/peterbe/status/1300881801611706370">
        optimal web performance
      </a>
      .<br />
      <Link to="/plog/thats-groce-app">Blog post about it here</Link>.
    </p>
  ),
});

sideProjects.push({
  id: "sockshootout",
  title: "WebSockets vs. XHR (2019)",
  image: {
    url: "/images/about/sockshootout-scr.png",
    width: 120,
    height: 93,
  },
  url: "https://sockshootout.app",
  body: (
    <p>
      WebSockets are promising because the connection is kept open so that
      sending new data has lower overheads than a regular XHR request. This app
      is a demo/playground to really test this in a production-grade setting.
      You can run your own test from <i>your</i> location and it will
      effectively give you an insight into the latency vs. overheads balance.
      <br />
      This is{" "}
      <Link to="/plog/websockets-vs-xhr-2019">
        the full blog post about the experiment
      </Link>
      . The code{" "}
      <a href="https://github.com/peterbe/sockshootout2019">
        github.com/peterbe/sockshootout2019
      </a>{" "}
      is a mix of React, Tornado, and Django.
    </p>
  ),
});

sideProjects.push({
  id: "minimalcssapp",
  title: "minimalcss web app",
  image: {
    url: "/images/about/minimalcss-scr.png",
    width: 120,
    height: 110,
  },
  url: "https://minimalcss.app",
  body: (
    <p>
      <a href="https://www.npmjs.com/package/minimalcss">
        <code>minimalcss</code>
      </a>{" "}
      is Node app that can analyze a URL and extract the minimal CSS needed for
      a first render (with JavaScript executed) and this is a web app that
      allows you to test it in a browser by simply typing in a URL. The
      front-end is a single-page React app that sends the URL into a{" "}
      <a href="https://www.npmjs.com/package/minimalcss-server">
        <code>minimalcss-server</code>
      </a>{" "}
      and then displays the results with some graphs.
    </p>
  ),
});

sideProjects.push({
  id: "workon",
  title: "Things To Work On",
  image: {
    url: "/images/about/workonapp-scr.png",
    width: 120,
    height: 110,
  },
  nofollow: true,
  url: "https://workon.app",
  body: (
    <p>
      Everybody has to make a todo list app. This is my take. I wanted to build
      something exactly like I want/need it.
      <br />
      The data is stored in <code>IndexedDB</code> using{" "}
      <a href="https://kintojs.readthedocs.io/en/latest/">kinto.js</a> and for
      remote storage I run a{" "}
      <a href="http://kinto.readthedocs.io">Kinto server</a> on my personal
      server. The authentication is done with{" "}
      <a href="https://auth0.com/docs/libraries/auth0js">auth0js</a> and the
      front end is React and MobX.
    </p>
  ),
});

sideProjects.push({
  id: "howsmywifi",
  title: "How's my WiFi?",
  image: {
    url: "/images/about/howsmywifi-scr.png",
    width: 110,
    height: 94,
  },
  // nofollow: true,
  url: "https://www.npmjs.com/package/howsmywifi",
  body: (
    <p>
      A fun little <b>Node</b> script that uses{" "}
      <a href="https://github.com/GoogleChrome/puppeteer">puppeteer</a> to open{" "}
      <a href="https://fast.com">https://fast.com</a> in a headless browser,
      extracts your current broadband speed and then draws an ASCII graph of the
      measurements plus a rolling average.
      <br />
      This is a real project, solving a real problem, but the code is a hack
      built in a day (plus some paperwork to clean it up and put it on
      npmjs.com)
    </p>
  ),
});

sideProjects.push({
  id: "podcasttime",
  title: "Podcast Time",
  image: {
    url: "/images/about/podcasttime-scr.png",
    width: 100,
    height: 178,
  },
  nofollow: true,
  url: "https://podcasttime.io",
  body: (
    <p>
      This started as me trying to figure out how much content
      <i>my</i> preferred podcasts require me to listen to to keep up and not
      fall behind. Later I structured it with a real database and a web app to
      display it. Then in early 2017 I re-wrote the front-end entirely in React
      and added Elasticsearch on the back-end for better search.
      <br />
      The{" "}
      <a href="https://github.com/peterbe/podcasttime2">
        front-end code is here
      </a>{" "}
      and the{" "}
      <a href="https://github.com/peterbe/django-peterbecom/tree/master/peterbecom/podcasttime">
        back-end code is here
      </a>
      .{" "}
      <Link to="/plog/podcasttime.io">Blogged about how it was built too</Link>.
    </p>
  ),
});

sideProjects.push({
  id: "battleshits",
  title: "Battleshits",
  image: {
    url: "/images/about/battleshits-scr.png",
    width: 100,
    height: 170,
  },
  // nofollow: true,
  url: "https://btlsh.it",
  body: (
    <p>
      A mobile web game app where you play battleships against friends. With the
      silly name, iconography and sounds. The first prototype of this is simply
      a website but styled specifically for mobile use using{" "}
      <a href="https://bulma.io/">Bulma</a>.<br />
      You can either play against the computer, against a friend asynchronously
      or against a friend in real-time. <br />
      The front-end is written in <b>ReactJS</b> and the real-time traffic is
      handled partly in <b>Django</b> with{" "}
      <a href="https://fanout.io">Fanout.io</a> to handle the <b>WebSockets</b>.
      <br />
      Next step is to try to submit this to the Apple App Store and see if they
      appreciate the name of the app.
    </p>
  ),
});

sideProjects.push({
  id: "headsupper",
  title: "Headsupper",
  image: {
    url: "/images/about/headsupper-scr.png",
    width: 110,
    height: 87,
  },
  nofollow: true,
  url: "https://headsupper.io",
  body: (
    <p>
      A GitHub Webhook receiver app that sends an email to certain people when a
      git commit comes in that contains the trigger word <code>headsup:</code>.
      More <Link to="/plog/headsupper.io">extended blog post</Link> here and{" "}
      <a href="https://github.com/peterbe/headsupper">code on GitHub</a>
      .<br />
      The back end is written in <b>Django</b>, the front-end written in{" "}
      <b>React</b> and it uses <b>GitHub as an OAuth</b> provider.
    </p>
  ),
});

sideProjects.push({
  id: "whatsdeployed",
  title: "Whatsdeployed",
  image: {
    url: "/images/about/whatsdeployed-scr.png",
    width: 110,
    height: 82,
  },
  // nofollow: true,
  url: "https://whatsdeployed.io",
  body: (
    <p>
      You enter the GitHub URL to a project and for each deployment target (e.g.
      &quot;dev&quot;, &quot;stage&quot;, &quot;production&quot;) you enter a
      URL that points to a file that contains the git sha that is deployed
      there. Then you get an overview of what git commits been and not been
      deployed across those deployments.{" "}
      <a href="https://whatsdeployed.io/?owner=mozilla&repo=socorro&name[]=Stage&amp;url[]=https://crash-stats.allizom.org/status/revision/&amp;name[]=Prod&amp;url[]=https://crash-stats.mozilla.com/status/revision/">
        For
      </a>{" "}
      <a href="https://whatsdeployed.io/?owner=mozilla&repo=airmozilla&name[]=Dev&amp;url[]=https%3A%2F%2Fair-dev.allizom.org%2Fmedia%2Frevision&amp;name[]=Stage&amp;url[]=https%3A%2F%2Fair.allizom.org%2Fmedia%2Frevision&amp;name[]=Prod&amp;url[]=https%3A%2F%2Fair.mozilla.org%2Fmedia%2Frevision">
        example
      </a>
      . Written in <b>Flask</b>.
    </p>
  ),
});

sideProjects.push({
  id: "premailer.io",
  title: "Premailer.io",
  image: {
    url: "/images/about/premailer-scr.png",
    width: 110,
    height: 73,
  },
  // nofollow: true,
  url: "https://whatsdeployed.io",
  body: (
    <p>
      A webapp that makes it possible to test the popular{" "}
      <a href="https://github.com/peterbe/premailer">
        premailer python library
      </a>
      which you use to prepare HTML for being sent as HTML emails. This site
      uses <a href="http://falconframework.org/">Falcon</a> for the server and
      AngularJS for the front-end. The client-side build system uses{" "}
      <a href="http://linemanjs.com/">Lineman.js</a>.
    </p>
  ),
});

sideProjects.push({
  id: "autocompeter",
  title: "Autocompeter",
  image: {
    url: "/images/about/autocompeter-scr.png",
    width: 110,
    height: 88,
  },
  nofollow: true,
  url: "https://autocompeter.com",
  body: (
    <p>
      An autocomplete widget where you put some CSS and JS on your site and let
      autcompeter.com host the data. The server is written in{" "}
      <a href="http://golang.org/">
        <b>Go</b>
      </a>{" "}
      and the Javascript is pure without any dependency on a framework.{" "}
      <a href="https://github.com/peterbe/autocompeter">Code on GitHub</a>.
    </p>
  ),
});

sideProjects.push({
  id: "htmltree",
  title: "HTML Tree",
  image: {
    url: "/images/about/htmltree-scr.png",
    width: 110,
    height: 87,
  },
  nofollow: true,
  url: "https://autocompeter.com",
  body: (
    <p>
      It started when I was optimizing a website whose HTML files were massive.
      Clearly the HTML contained too many DOM nodes. But where are these big
      clusters of nodes?! HTML Tree takes a URL, converts it to a tree in JSON
      which when combined with a{" "}
      <a href="http://d3js.org/">
        <b>D3</b>
      </a>{" "}
      collapsible tree becomes easier to navigate.{" "}
      <a href="https://github.com/peterbe/htmltree">Code on GitHub</a>.
    </p>
  ),
});

sideProjects.push({
  id: "nodomains",
  title: "Number of Domains",
  image: {
    url: "/images/about/nodomains-scr.png",
    width: 110,
    height: 103,
  },
  nofollow: true,
  url: "https://www.peterbe.com/nodomains/",
  body: (
    <p>
      Using your network panel in your browser Web Console you can track how
      incredibly many requests many sites depend on. But, to find out how many
      different domains that spans you have to manually count each unique
      domain. Or use this tool. <br />
      What this proves is that DNS is still incredibly important for web
      performance.{" "}
      <Link to="/plog/number-of-domains">Blogged about it here</Link> and the
      relevant{" "}
      <a href="https://github.com/peterbe/django-peterbecom/blob/master/peterbecom/nodomains/count.js">
        <b>Node</b> code is here
      </a>
      .
    </p>
  ),
});

sideProjects.push({
  id: "github-pr-triage",
  title: "GitHub Pull Request Triage",
  image: {
    url: "/images/about/github-pr-triage-scr.png",
    width: 120,
    height: 84,
  },
  nofollow: true,
  url: "http://prs.mozilla.io",
  body: (
    <p>
      This is a mashup using the{" "}
      <a href="https://developer.github.com/v3/">GitHub API</a> to make a
      dashboard over all open Pull Requests on a GitHub project. It&apos;s a
      Flask backend for doing proxy caching of requests and an AngularJS front
      end. I <Link to="/plog/github-pr-triage">blogged about it</Link> in more
      detail and the code is{" "}
      <a href="https://github.com/peterbe/github-pr-triage">
        available on GitHub
      </a>
      .
    </p>
  ),
});

sideProjects.push({
  id: "buggy",
  title: "Buggy",
  image: {
    url: "/images/about/buggy-scr.png",
    width: 110,
    height: 75,
  },
  nofollow: true,
  url: "http://buggy.peterbe.com",
  body: (
    <p>
      Buggy is a singe-page webapp that relies entirely on the{" "}
      <a href="https://bugzilla.mozilla.org">Bugzilla</a> native REST API. The
      app is entirely client side and written in AngularJS and is entirely
      served from a CDN. I have <Link to="/plog/buggy">blogged about it</Link>{" "}
      in more detail on my blog and the code is{" "}
      <a href="https://github.com/peterbe/buggy">available on GitHub</a>.
    </p>
  ),
});

sideProjects.push({
  id: "wishlistgranted",
  title: "Wish List Granted",
  image: {
    url: "/images/about/wishlistgranted-scr.png",
    width: 110,
    height: 88,
  },
  nofollow: true,
  url: "http://buggy.peterbe.com",
  body: (
    <p>
      Makes it possible for you to &quot;crowdfund&quot; your presents.
      Integrates with Amazon.com&trade;&apos;s{" "}
      <a href="https://www.amazon.com/gp/registry/wishlist/" rel="nofollow">
        Wish List
      </a>{" "}
      functionality mashed with{" "}
      <a href="https://www.balancedpayments.com/" rel="nofollow">
        Balanced Payments
      </a>
      . My first side-project with a full and real payment solution. Code
      written in Django with PostgreSQL.
    </p>
  ),
});

sideProjects.push({
  id: "hugepic",
  title: "HUGEpic",
  image: {
    url: "/images/about/hugepic-scr.png",
    width: 100,
    height: 91,
  },
  nofollow: true,
  url: "http://hugepic.io",
  body: (
    <p>
      This app combined <a href="https://leafletjs.com/">Leaflet</a> with{" "}
      <a href="https://www.filepicker.io/">Filepicker.io</a> with{" "}
      <a href="http://aws.amazon.com/s3/">Amazon S3</a> to let you upload
      massive pictures and draw annotations on them to be able to zoom in, pan
      and share specific regions without having to download the whole image. And
      it works great on mobile too!
      <br />
      <br />
      All the code is open source and{" "}
      <a href="https://github.com/peterbe/tiler">available here</a> and
      it&apos;s a Tornado app that relies very heavily on{" "}
      <a href="http://python-rq.org/">RQ</a>.
    </p>
  ),
});

sideProjects.push({
  id: "aroundtheworld",
  title: "Around The World",
  image: {
    url: "/images/about/aroundtheworld-scr.png",
    width: 100,
    height: 81,
  },
  nofollow: true,
  url: "http://aroundtheworldgame.com",
  body: (
    <p>
      If you haven&apos;t already done so, check out my new game:{" "}
      <a href="http://aroundtheworldgame.com/" rel="nofollow">
        Around The World
      </a>{" "}
      which is my spare time project. You can read more{" "}
      <a href="http://aroundtheworldgame.com/about" rel="nofollow">
        about it here
      </a>{" "}
      but the best thing is to just start playing and see if you like it.
    </p>
  ),
});

sideProjects.push({
  id: "uslicensespotter",
  title: "US License Plate spotter",
  image: {
    url: "/images/about/licensespotter-scr.png",
    width: 90,
    height: 135,
  },
  nofollow: true,
  url: "http://aroundtheworldgame.com",
  body: (
    <p>
      It&apos;s for spotting out-of-state license plates in the US and tick them
      off on your smartphone.
      <br />
      This is a work in progress project. I have blogged out it{" "}
      <Link to="/plog/us-license-plate-spotter-part-1">
        first here
      </Link> and{" "}
      <Link to="/plog/us-license-plate-spotter-part-2">then here</Link> about
      the update. It&apos;s an ongoing project to try to build real mobile
      native apps from HTML and Javascript. <br />
      This is also my first ever project that actually uses Facebook&apos;s API
      to facilitate wall posts from the app.
      <br />
      The{" "}
      <a href="https://github.com/peterbe/uslicenseplates/">
        source code is here
      </a>{" "}
      and it&apos;s a bit of a mess because it&apos;s after all just an ongoing
      experiment.
    </p>
  ),
});

sideProjects.push({
  id: "toocoolforme",
  title: "Too Cool For Me?",
  image: {
    url: "/images/about/toocoolforme-screenshot.png",
    width: 127,
    height: 101,
  },
  nofollow: true,
  url: "http://toocoolfor.me",
  body: (
    <p>
      It started as a Bookmarklet so that when you&apos;re visiting twitter.com
      it appends, for each user you follow, whether they also follow you. Later,
      the most useful feature was the{" "}
      <Link to="/plog/too-cool-for-me-everyone">/everybody</Link> page where
      everyone you follow is split half between those who follow you and those
      that are too cool for you. <br />
      <Link to="/plog/too-cool-for-me">blogged about it here</Link> and{" "}
      <a href="https://github.com/peterbe/toocool">source code is here</a>.
    </p>
  ),
});

sideProjects.push({
  id: "peterbecom",
  title: "Peterbe.com",
  image: {
    url: "/images/about/peterbecom-screenshot.png",
    width: 100,
    height: 93,
  },
  // nofollow: true,
  url: "https://www.peterbe.com",
  body: (
    <p>
      In 2012 I re-wrote this site from scratch. Being very fast was important
      to me and I&apos;ve blogged about how I made the{" "}
      <Link to="/plog/secs-sell-frickin-fast-server-side">server-side</Link> and
      <Link to="/plog/secs-sell-frickin-fast-client-side">
        client-side
      </Link>{" "}
      fast.
      <br />
      The code to this site is open source and the{" "}
      <a href="https://github.com/peterbe/django-peterbecom">
        source code is here
      </a>
      .
    </p>
  ),
});

sideProjects.push({
  id: "donecal",
  title: "DoneCal",
  image: {
    url: "/images/about/donecal-screenshot.png",
    width: 127,
    height: 63,
  },
  nofollow: true,
  url: "http://donecal.com",
  body: (
    <p>
      This is a full HTML5 calendar. It&apos;s fast and simple and has a
      practical <a href="http://donecal.com/help/API">API</a>.<br />
      I&apos;ve <Link to="/plog/donecal.com">
        blogged about it here
      </Link> and{" "}
      <a href="https://github.com/peterbe/worklog">source code is here</a>.
    </p>
  ),
});

sideProjects.push({
  id: "tornadogists",
  title: "Tornado Gists",
  image: {
    url: "/images/about/tornadogists-scr.png",
    width: 127,
    height: 63,
  },
  nofollow: true,
  url: "http://tornadogists.org",
  body: (
    <p>
      This is a supporting site for the{" "}
      <a href="https://www.tornadoweb.org/">Tornado Web Server</a> project. It
      uses the GitHub API for authentication and for pulling down{" "}
      <a href="https://gist.github.com/" title="A GitHub service">
        gists
      </a>{" "}
      automatically.
      <br />
      The hosting of this project is actually done by a fellow Tornado
      contributor called <a href="http://feilong.me/">Felinx Lee</a>.
      <br />
      <Link to="/plog/tornadogists.org">Blogged about it here</Link> and{" "}
      <a href="https://github.com/peterbe/tornado_gists">source code is here</a>
      .
    </p>
  ),
});

sideProjects.push({
  id: "kwissle",
  title: "Kwissle",
  image: {
    url: "/images/about/kwissle-screenshot.png",
    width: 110,
    height: 81,
  },
  nofollow: true,
  url: "http://kwissle.com",
  body: (
    <p>
      My first real-time web game. The game is that you get paired up with
      another random player and you have to answer quiz questions as fast and
      accurate as possible. My first web app that let&apos;s Facebook, Twitter,
      Google, Persona all take care of the authentication.
      <br />I first{" "}
      <Link to="/plog/launching-kwissle">blogged about it here</Link> when it
      was launched and here are{" "}
      <Link to="/plog/slides-about-kwissle-lpdojo/slides.html">the slides</Link>{" "}
      which I later{" "}
      <Link to="/plog/slides-about-kwissle-lpdojo">
        presented at PyCon UK 2011
      </Link>
      .
    </p>
  ),
});

sideProjects.push({
  id: "crosstips",
  title: "Crosstips",
  image: {
    url: "/images/about/crosstips-screenshot.png",
    width: 105,
    height: 85,
  },
  nofollow: true,
  url: "http://crosstips.org",
  body: (
    <p>
      Crosstips first started as an experiment to do localization in Django.
      This was also my first ever non-English project.
      <br />
      Not long after, I prepared the English (American and British) version and
      a friend helped me translate the French version too.
      <br />
      <a href="https://github.com/peterbe/kl">Source code available here</a> and
      I&apos;ve{" "}
      <Link to="/search?q=keywords%3Acrosstips">
        blogged about various aspects of it here
      </Link>
      .
    </p>
  ),
});

sideProjects.push({
  id: "tflcameras",
  title: "TFL Cameras",
  image: {
    url: "/images/about/tflcameras-screenshot.png",
    width: 105,
    height: 79,
  },
  nofollow: true,
  url: "http://crosstips.org",
  body: (
    <p>
      Using the recently published{" "}
      <a href="http://data.london.gov.uk/datastore/package/tfl-live-traffic-cameras">
        API from Transport from London
      </a>{" "}
      I put together a Google Maps mashup that plots all the central London
      traffic cameras so you can easily see if your particular road is
      congested. This was my first project using client-side Geolocation.
      <br />
      <Link to="/plog/tflcameras">Blogged about it here</Link> and the{" "}
      <a href="https://github.com/peterbe/tflcameras">source code is here</a>.
    </p>
  ),
});

sideProjects.push({
  id: "mfwc",
  title: "FWC Kungfu Mobile",
  image: {
    url: "/images/about/mfwc-screenshot.png",
    width: 85,
    height: 128,
  },
  nofollow: true,
  url: "http://crosstips.org",
  body: (
    <p>
      This was my first pure mobile web site. It&apos;s for my{" "}
      <a href="http://www.fwckungfu.com/">Fujian White Crane Kung Fu Club</a>{" "}
      that I trained with when I lived in London. This site uses a remote
      database connection and is heavily cached. It&apos;s built taylor made for
      mobile as it goes straight to the basic details you need.
      <br />
      I originally built it because I kept forgetting when various classes
      started and looking it up on a slow 3G connection was a pain.
      <br />
      The <a href="https://github.com/peterbe/fwc_mobile">code is here</a> and I
      blogged about when this was my first site to get{" "}
      <Link to="/plog/first-yslow-grade-a">100 points on YSlow!</Link>.
    </p>
  ),
});
