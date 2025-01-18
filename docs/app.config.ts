// https://github.com/nuxt-themes/docus/blob/main/nuxt.schema.ts
export default defineAppConfig({
  docus: {
    title: "Moonlink.js",
    description: "Moonlink.js (Reimagined Version) - Envision a sonic adventure where imagination knows no bounds, wrapped in the magical spirit of the festivities.",
    image:
      "https://user-images.githubusercontent.com/904724/185365452-87b7ca7b-6030-4813-a2db-5e65c785bf88.png",
    socials: {
      github: "Ecliptia/moonlink.js",
    },
    github: {
      dir: ".starters/default/content",
      branch: "v4",
      repo: "moonlink.js",
      owner: "1Lucas1apk",
      edit: true,
    },
    aside: {
      level: 0,
      collapsed: false,
      exclude: [],
    },
    main: {
      padded: true,
      fluid: true,
    },
    header: {
      logo: true,
      showLinkIcon: true,
      exclude: [],
      fluid: true,
    },
  },
});
