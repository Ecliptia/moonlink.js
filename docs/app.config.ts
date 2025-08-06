export default defineAppConfig({
  shadcnDocs: {
    site: {
      name: 'Moonlink.js',
      description:
        'Moonlink.js 🌙🌟 is a stable and feature-rich Lavalink client for Node.js, designed to make building Discord music bots easier 🎵. With an intuitive and easy-to-use API, it provides seamless integration with the Lavalink server, allowing you to manage and control audio playback efficiently and at scale 🚀🎧.',
      ogImage: '/moonlink_banner.png',
      ogImageComponent: 'ShadcnDocs',
      ogImageColor: 'dark',
      umami: {
        enable: true,
        src: 'https://cloud.umami.is/script.js',
        dataWebsiteId: 'be3420a0-c56d-485c-b350-9bf105bd8463',
      },
    },
    theme: {
      customizable: true,
      color: 'blue',
      radius: 0.75,
    },
    header: {
      title: 'Moonlink.js',
      showTitle: true,
      darkModeToggle: true,
      languageSwitcher: {
        enable: true,
        triggerType: 'icon',
        dropdownType: 'select',
      },
      logo: {
        light: '/favicon.svg', // usa do template base
        dark: '/logo.svg',
      },
      nav: [],
      links: [
        {
          icon: 'lucide:github',
          to: 'https://github.com/Ecliptia/moonlink.js',
          target: '_blank',
        },
      ],
    },
    aside: {
      useLevel: true,
      collapse: false,
    },
    main: {
      breadCrumb: true,
      showTitle: true,
    },
    footer: {
      credits: 'Copyright © 2025',
      links: [
        {
          icon: 'lucide:github',
          to: 'https://github.com/Ecliptia/moonlink.js',
          target: '_blank',
        },
      ],
    },
    toc: {
      enable: true,
      title: 'On This Page',
      links: [
        {
          title: 'Star on GitHub',
          icon: 'lucide:star',
          to: 'https://github.com/Ecliptia/moonlink.js',
          target: '_blank',
        },
        {
          title: 'Create Issues',
          icon: 'lucide:circle-dot',
          to: 'https://github.com/Ecliptia/moonlink.js/issues',
          target: '_blank',
        },
      ],
    },
    search: {
      enable: true,
      inAside: false,
    },
    banner: {
      enable: true,
      showClose: true,
      content: 'Star ✨ on GitHub',
      to: 'https://github.com/Ecliptia/moonlink.js',
      target: '_blank',
      border: true,
    },
  },
});
