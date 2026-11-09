#!/usr/bin/env ruby
# Regenerate the template's native collection pages.
require 'yaml'
require 'fileutils'
root = File.expand_path('..', __dir__)
papers = YAML.load_file(File.join(root, '_data/publications.yml'))
FileUtils.mkdir_p(File.join(root, '_publications'))
papers.each do |paper|
  metadata = {
    'title' => paper['title'], 'collection' => 'publications',
    'permalink' => "/publications/#{paper['id']}/",
    'date' => paper['date'], 'year' => paper['year'],
    'venue' => paper['venue'], 'authors' => paper['authors'].map { |a| a['name'] }.join(', '),
    'paperurl' => paper['paper'], 'excerpt' => paper['description'],
    'author_profile' => true,
    'featured' => paper['selected'],
    'category' => %w[ICML AAAI NeurIPS 3DV].include?(paper['venue']) ? 'conferences' : 'manuscripts'
  }
  %w[code project].each { |key| metadata["#{key}url"] = paper[key] if paper[key] }
  body = "\n#{paper['description']}\n\n"
  body += "![Research overview](#{paper['image']})\n\n" if paper['image']
  File.write(File.join(root, "_publications/#{paper['id']}.md"), metadata.to_yaml + "---\n" + body)
  FileUtils.rm_f(File.join(root, "files/#{paper['id']}.bib"))
end
puts "Synced #{papers.length} collection pages."
