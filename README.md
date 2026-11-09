# Xingyilang Yin’s academic homepage

This project uses the complete [iTheresaApocalypse academic homepage template](https://github.com/iTheresaApocalypse/itheresaapocalypse.github.io), personalized for [Xingyilang Yin](https://flow0314.github.io). The upstream CSS, fonts, layouts, includes, Sass and build tooling are retained. See [TEMPLATE_UPSTREAM.md](TEMPLATE_UPSTREAM.md) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Maintain personal information

- `_config.yml`: identity, email, Scholar, GitHub and hosting URL.
- `_pages/about.md`: homepage biography and sections, using the template’s original markup and classes.
- `_data/profile.yml`: education, internships, academic service, teaching and awards; reused by the homepage and CV.
- `_data/publications.yml`: all 10 papers, full/short author lists, contribution marks, links and figures. Citation metadata is retained internally and is not published. The 9 selected papers use `selected: true` and follow `selected_order`; the homepage renders these nine papers directly without filter buttons. The separate publication list uses reverse publication-year/date order. The display year/venue preserve the confirmed ICML 2026 acceptances; BibTeX preserves the supplied preprint records where applicable. `sort_key` concatenates display year and original publication date (YYYYYYYYMMDD).
- `_pages/publications.html` and `_pages/cv.md`: complete publication list and synchronized web CV.
- `assets/css/home.css`: unchanged upstream homepage styling. Only text-only paper layout additions live in `assets/css/personal.css`.

No CV or paper from the template author is published. Visitor globe source remains available, disabled by default until an endpoint owned by this site is configured. No upstream analytics/statistics service is contacted.

After editing publication data, run `ruby scripts/sync_publications.rb` to synchronize the template’s native collection detail pages.

## Local development

```sh
bundle install
bundle exec jekyll serve --host 127.0.0.1 --port 4000
```

Build separately from the checked-in generated output:

```sh
bundle exec jekyll build --destination /tmp/flow-template-build
```

The `_site` directory remains tracked for compatibility with this repository and contains only the current generated site. GitHub Pages can build directly from this repository’s source.

## Licenses

The original Academic Pages MIT license is retained in `LICENSE`; the bundled fonts include their original licenses in `assets/fonts/home/`.
