/**
 * Abstract Creative — CMS Integration
 * Connects abstract-creative.com to the Supabase CMS
 * managed via portal.abstract-creative.com
 *
 * Handles:
 *  1. data-cms-key  — swap text/html on any element
 *  2. #cms-work-grid   — dynamic case studies grid
 *  3. #cms-articles-grid — dynamic articles grid
 */

(function () {
  var SUPABASE_URL = 'https://oslpflsugayxydbhnnwb.supabase.co'
  var SUPABASE_KEY = 'sb_publishable_CPohQdjjoKjLds-2TjnbwA_0j_FeKED'

  // ── Fetch helper (no SDK needed) ──────────────────────────────────────────

  function query(table, params) {
    var url = SUPABASE_URL + '/rest/v1/' + table + '?' + params
    return fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
      }
    }).then(function (r) { return r.json() })
  }

  // ── Editable text content (data-cms-key) ─────────────────────────────────

  function applyContentKeys(rows) {
    if (!rows || !rows.length) return
    var map = {}
    rows.forEach(function (r) { map[r.key] = r.value })
    document.querySelectorAll('[data-cms-key]').forEach(function (el) {
      var key = el.getAttribute('data-cms-key')
      if (map[key] !== undefined) {
        if (el.tagName === 'IMG') {
          el.src = map[key]
        } else {
          el.innerHTML = map[key]
        }
      }
    })
  }

  function loadContentKeys() {
    var keys = []
    document.querySelectorAll('[data-cms-key]').forEach(function (el) {
      keys.push(el.getAttribute('data-cms-key'))
    })
    if (!keys.length) return
    var filter = 'key=in.(' + keys.map(function(k){ return '"' + k + '"' }).join(',') + ')'
    query('cms_content', filter + '&select=key,value')
      .then(applyContentKeys)
      .catch(function () {}) // fail silently — keep hardcoded content
  }

  // ── Articles grid ─────────────────────────────────────────────────────────

  function fmtDate(str) {
    if (!str) return ''
    try {
      return new Date(str).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    } catch (e) { return '' }
  }

  function articleCard(art) {
    var slug = art.slug || art.id
    var href = slug + '.html'
    var tags = art.tags || []
    var tagHtml = tags[0]
      ? '<span class="fw-500 primary-color" style="font-size:.85rem;text-transform:uppercase;letter-spacing:.05em;">' + tags[0] + '</span>'
      : ''
    var imgHtml = art.cover_image
      ? '<a href="' + href + '" class="image d-block"><img src="' + art.cover_image + '" alt="' + art.title + ' – Abstract Creative" loading="lazy" decoding="async" style="width:100%;aspect-ratio:16/9;object-fit:cover;" /></a>'
      : ''
    var dateHtml = art.published_at
      ? '<span><i class="fa-regular fa-calendar"></i> ' + fmtDate(art.published_at) + '</span>'
      : ''
    var excerptHtml = art.excerpt
      ? '<p class="mt-10">' + art.excerpt + '</p>'
      : ''

    return '<div class="col">'
      + '<div class="blog__item">'
      + imgHtml
      + '<div class="mt-20">'
      + tagHtml
      + '<h4 class="mt-10"><a href="' + href + '" class="primary-hover">' + art.title + '</a></h4>'
      + excerptHtml
      + (dateHtml ? '<div class="blog-meta mt-15 d-flex align-items-center gap-3">' + dateHtml + '</div>' : '')
      + '<a href="' + href + '" class="fw-500 primary-color d-inline-block mt-15">Read Article <i class="fa-regular fa-arrow-right ml-10"></i></a>'
      + '</div></div></div>'
  }

  function renderArticles() {
    var container = document.getElementById('cms-articles-grid')
    if (!container) return
    query('cms_articles', 'is_published=eq.true&order=published_at.desc&select=*')
      .then(function (articles) {
        if (!articles || !articles.length) return // keep hardcoded fallback
        container.innerHTML = articles.map(articleCard).join('')
      })
      .catch(function () {})
  }

  // ── Case studies / Work grid ──────────────────────────────────────────────

  function caseStudyCard(cs) {
    var slug = cs.slug || cs.id
    var href = slug + '.html'
    var tags = cs.tags || []
    var tagBadges = tags.map(function (t) {
      return '<span style="display:inline-block;background:#f0f0f0;color:#444;padding:2px 8px;border-radius:3px;font-size:11px;margin-right:4px;margin-top:4px;">' + t + '</span>'
    }).join('')
    var imgHtml = cs.cover_image
      ? '<a href="' + href + '" class="image d-block hover-media"><img src="' + cs.cover_image + '" alt="' + cs.title + '" class="thumb-image" loading="lazy" decoding="async" /></a>'
      : ''
    var clientHtml = cs.client
      ? '<span class="fw-500 primary-color" style="font-size:.85rem;text-transform:uppercase;letter-spacing:.05em;">' + cs.client + '</span>'
      : ''
    var summaryHtml = cs.summary
      ? '<p class="mt-10" style="color:#555;line-height:1.6;">' + cs.summary + '</p>'
      : ''

    return '<div class="col-lg-6 col-md-6 col-sm-12 portfolio-card">'
      + '<div class="blog__item">'
      + imgHtml
      + '<div class="mt-20">'
      + clientHtml
      + '<h4 class="mt-10">' + cs.title + '</h4>'
      + summaryHtml
      + (tagBadges ? '<div class="mt-10">' + tagBadges + '</div>' : '')
      + '</div></div></div>'
  }

  function renderCaseStudies() {
    var container = document.getElementById('cms-work-grid')
    if (!container) return
    query('cms_case_studies', 'is_published=eq.true&order=sort_order.asc&select=*')
      .then(function (studies) {
        if (!studies || !studies.length) return // keep hardcoded fallback
        container.innerHTML = studies.map(caseStudyCard).join('')
      })
      .catch(function () {})
  }

  // ── Init ─────────────────────────────────────────────────────────────────

  function init() {
    loadContentKeys()
    renderArticles()
    renderCaseStudies()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

})()
