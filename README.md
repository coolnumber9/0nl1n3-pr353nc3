<img width="1920" height="1080" alt="925_1x_shots_so" src="https://github.com/user-attachments/assets/cf557618-643b-48b6-b27e-b1a743e24ca4" />

# kdamora — online CV & portfolio

Two modes. One person.

The default mode is a CV. The other mode is a story — it opens from the
terminal (`press /`) with a key. Keys are issued personally; if we've talked,
you may have one.

```
$ kda install story --key <code>
```

## Stack

Vite + vanilla JS + GSAP. No framework, no analytics, no backend. Story
content ships only as an AES-256-GCM encrypted payload; access codes derive
the wrapping keys via PBKDF2 (600k iterations). The plaintext never touches
this repository — so no, reading the source won't get you in, though you're
welcome to read `src/story/crypto.js` and `tools/seal.mjs` to check the
approach. If you find a hole in it, I'd honestly like to hear about it.

## Local build and production deploy commands

```bash
npm install
npm run dev          # localhost
npm run dev:https    # LAN preview (Web Crypto needs a secure context)
npm run seal         # re-encrypt story content (requires private inputs)
npm run build        # production build to dist/
```

Deploys to GitHub Pages via Actions on push to `main`.

## License

Split license — see [LICENSE](./LICENSE):

- **Code:** MIT. The terminal, the seal tooling, the scrollytelling renderer —
  take what's useful.
- **Content:** © Kristoffer Dominic Amora, all rights reserved. CV text, story
  content (encrypted or not), photos, and write-ups are not open source.
