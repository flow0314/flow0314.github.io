# Template provenance

The complete template source was imported from
https://github.com/iTheresaApocalypse/itheresaapocalypse.github.io (master)
on 2026-11-10. Archive: GitHub codeload master tarball.

The original homepage CSS and bundled XCharter/Carlito fonts are retained
unchanged, together with the layouts, includes, Sass, generic JavaScript,
Docker configuration, Gemfile, and frontend package tooling. The existing
repository convention of tracking generated output is preserved.

Personal changes: site/author/navigation configuration; owner profile, papers,
figures and CV; data-driven homepage fragments; isolated text-only CSS;
publication sorting and progressive enhancement. Upstream example content,
private CV files, owner-specific statistics data and scheduled update workflows
were removed. The globe components remain available, disabled until this site
has its own statistics endpoint. No request uses the upstream author's endpoint.

The original MIT license is retained in LICENSE. Font licenses are shipped
in assets/fonts/home/.

Compatibility fixes: root-relative asset includes allow local previews; UTF-8
charsets were added to Sass entrypoints with non-ASCII source; collection page
dates retain the original public date while the venue label uses the confirmed
publication year.
