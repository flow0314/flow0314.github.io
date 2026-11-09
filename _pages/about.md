---
layout: academic-home
permalink: /
title: "Xingyilang Yin (flow)"
description: "Xingyilang Yin researches multimodal understanding, generation, agents, and 3D vision at the University of Macau and GVC Lab, Great Bay University."
author_profile: false
redirect_from:
  - /about/
  - /about.html
---

<header id="about">
  <h1 class="page-heading">Xingyilang Yin <span>(flow)</span></h1>
  <p class="page-subtitle">Ph.D. Student, University of Macau &amp; Great Bay University</p>
</header>
<div class="intro-layout">
  <div class="home-profile">
    <img class="intro-photo" src="{{ '/images/kirito_sqaure.png' | relative_url }}" alt="Xingyilang Yin's Kirito avatar" width="180" height="180">
    <nav class="profile-links" aria-label="Profile links">
      <a href="{{ '/cv/' | relative_url }}">CV</a>
      <a href="{{ site.author.googlescholar }}" target="_blank" rel="noopener noreferrer">Google Scholar</a>
      <a href="https://github.com/{{ site.author.github }}" target="_blank" rel="noopener noreferrer">{% include github-icon.html %} GitHub</a>
    </nav>
  </div>
  <div class="home-about-content">
    <p>Hi! I am a second-year Ph.D student at GVCLab, University of Macau and Great Bay University, advised by <a href="https://vinthony.github.io/academic/" target="_blank" rel="noopener noreferrer">Prof. Xiaodong Cun</a> and <a href="https://cmpun.github.io/" target="_blank" rel="noopener noreferrer">Prof. Chi-Man Pun</a>. Previously, I received my M.S. and B.Sc. degrees from Xidian University.</p>
    <p>I am interested in multimodal agents, understanding and generation, especially multimodal agents / LLMs for game and 3D.</p>
    <p id="contact" class="contact-line">Email: <a href="mailto:{{ site.author.email }}">{{ site.author.email }}</a></p>
  </div>
</div>

<hr class="experience-divider">
<section id="publications" class="home-section home-publications">
  <div class="publication-heading"><h2>Selected Publications</h2><p class="home-section-subtitle">* equal contribution; † corresponding author</p></div>
  {% include home-publications.html mode='selected' %}
</section>

<hr class="experience-divider">
<section id="education" class="home-section">
  <h2>Education</h2>
  {% include home-experience.html entries=site.data.profile.education %}
</section>

<hr class="experience-divider">
<section id="research" class="home-section">
  <h2>Research Experience</h2>
  {% include home-experience.html entries=site.data.profile.research %}
</section>
<hr>
<section id="service" class="home-section">
  <h2>Academic Service</h2>
  <ul class="service-list">{% for item in site.data.profile.services %}<li>{{ item | escape }}</li>{% endfor %}</ul>
</section>

<hr>
<section id="teaching-awards" class="home-section">
  <h2>Teaching &amp; Awards</h2>
  <ul class="service-list">
    <li>{{ site.data.profile.teaching | escape }}</li>
    {% for item in site.data.profile.awards %}<li>{{ item | escape }}</li>{% endfor %}
    <li>{{ site.data.profile.game_interests | escape }}</li>
  </ul>
</section>

{% if site.visitor_globe.enabled %}{% include visitor-globe.html %}{% endif %}

{% include pub-video-script.html %}
{% if site.visitor_globe.enabled %}<script type="module" src="{{ '/assets/js/visitor-globe.js' | relative_url }}"></script>{% endif %}
