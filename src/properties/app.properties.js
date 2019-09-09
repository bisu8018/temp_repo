export const APP_PROPERTIES = {
  ssr: process.env.APP_ENV === 'server',
  env: (!process.env.NODE_ENV_SUB) ? 'local':process.env.NODE_ENV_SUB,
  debug: (!process.env.NODE_ENV_SUB && false),
  domain:function(){
    if(this.env === 'production')
      return APP_PROPERTIES.production.domain;
    else if(this.env === 'development')
      return APP_PROPERTIES.dev.domain;
    else if(this.env === 'ssr_local')
      return APP_PROPERTIES.ssr_local.domain;
    else
      return APP_PROPERTIES.local.domain;
  },
  local:{
    domain:{
      mainHost: 'http://localhost:8000',
      image: 'https://thumb.share.decompany.io',
      api: "https://api.share.decompany.io/rest",
      email: "https://api.share.decompany.io/ve",
      profile: "https://profile.share.decompany.io/",
      embed: "https://embed.share.decompany.io/",
      viewer: "https://viewer.share.decompany.io/",
      bounty: "https://api.share.decompany.io/bounty/",
    }
  },
  ssr_local:{
    domain:{
      mainHost: 'http://localhost:80',
      image: 'https://thumb.share.decompany.io',
      api: "https://api.share.decompany.io/rest",
      email: "https://api.share.decompany.io/ve",
      profile: "https://profile.share.decompany.io/",
      embed: "https://embed.share.decompany.io/",
      viewer: "https://viewer.share.decompany.io/",
      bounty: "https://api.share.decompany.io/bounty/",
    }
  },
  dev:{
    domain:{
      mainHost: 'https://share.decompany.io',
      image: 'https://thumb.share.decompany.io',
      api: "https://api.share.decompany.io/rest",
      email: "https://api.share.decompany.io/ve",
      profile: "https://profile.share.decompany.io/",
      embed: "https://embed.share.decompany.io/",
      viewer: "https://viewer.share.decompany.io/",
      bounty: "https://api.share.decompany.io/bounty/"
    }
  },
  production:{
    domain:{
      mainHost: 'https://www.polarishare.com',
      image: 'https://res.polarishare.com',
      api: "https://api.polarishare.com/rest",
      email: "https://api.polarishare.com/ve",
      profile: "https://res.polarishare.com/",
      viewer: "https://viewer.polarishare.com/",
      embed: "https://embed.polarishare.com/",
    }
  }
};
