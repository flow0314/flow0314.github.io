---
layout: academic-home
title: CV
permalink: /cv/
description: "Academic experience and CV of Xingyilang Yin."
redirect_from:
  - /resume/
---
<a class="profile-page-back" href="{{ '/' | relative_url }}">← Homepage</a>
<h1 class="page-heading profile-page-heading">Xingyilang Yin</h1>
<p><a href="mailto:{{ site.author.email }}">{{ site.author.email }}</a> · <a href="{{ site.author.googlescholar }}">Google Scholar</a> · <a href="https://github.com/{{ site.author.github }}">GitHub</a></p>
<section class="home-section">
  <h2>Research Interests</h2>
  <p>Multimodal Understanding &amp; Generation · Multimodal Agents · 3D Vision</p>
</section>
<hr>
<section class="home-section">
  <h2>Education</h2>
  {% include home-experience.html entries=site.data.profile.education %}
</section>
<hr>
<section class="home-section">
  <h2>Research Experience</h2>
  {% include home-experience.html entries=site.data.profile.research %}
</section>
<hr>
<section class="home-section">
  <h2>Academic Service</h2>
  <ul class="service-list">{% for item in site.data.profile.services %}<li>{{ item | escape }}</li>{% endfor %}</ul>
</section>
<hr>
<section class="home-section">
  <h2>Teaching &amp; Awards</h2>
  <ul class="service-list"><li>{{ site.data.profile.teaching | escape }}</li>{% for item in site.data.profile.awards %}<li>{{ item | escape }}</li>{% endfor %}
    <li>{{ site.data.profile.game_interests | escape }}</li></ul>
</section>
<hr>
<section class="home-section">
  <h2>Publications</h2>
  <ol>{% assign papers = site.data.publications | sort: 'sort_key' | reverse %}{% assign agcn = papers | where: 'id', 'agcn' %}{% assign papers = papers | where_exp: 'paper', "paper.id != 'agcn'" | concat: agcn %}{% for paper in papers %}<li><a href="{{ paper.paper }}">{{ paper.title | escape }}</a>. {{ paper.venue | escape }}, {{ paper.year }}.</li>{% endfor %}</ol>
</section>
