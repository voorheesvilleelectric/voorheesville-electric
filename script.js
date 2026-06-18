const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

$('.menu')?.addEventListener('click', () => $('.links')?.classList.toggle('open'));

const current = location.pathname.split('/').pop() || 'index.html';
$$('.links a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === current || (current === '' && href === 'index.html')) a.classList.add('active');
});

async function getJSON(path){
  const res = await fetch(path, {cache:'no-store'});
  if(!res.ok) throw new Error(path);
  return res.json();
}

function firstImage(project){
  return project.after?.[0]?.src || project.before?.[0]?.src || 'assets/images/hero-van.jpg';
}

function renderFeatured(projects){
  const holder = $('#featuredProjects');
  if(!holder) return;
  holder.innerHTML = projects.filter(p => p.featured).slice(0,3).map(p => `
    <a class="featured-project" href="projects.html">
      <img src="${firstImage(p)}" alt="${p.title}">
      <div><span>${p.category}</span><h3>${p.title}</h3><p>${p.summary}</p></div>
    </a>
  `).join('');
}

function imgThumb(img){
  return `<button class="thumb" type="button" data-full="${img.src}" aria-label="Open image"><img src="${img.src}" alt="${img.alt || ''}"></button>`;
}

function detailsButton(p, i){
  const hasDetails = (p.before && p.before.length) || (p.after && p.after.length) || (p.videos && p.videos.length);
  return hasDetails ? `<button class="project-toggle" type="button" aria-expanded="false" aria-controls="project-details-${i}">View Details</button>` : '';
}

function detailPanel(p, i){
  const before = p.before?.length ? `<div><h4>Before</h4><div class="gallery-row">${p.before.map(imgThumb).join('')}</div></div>` : '';
  const after = p.after?.length ? `<div><h4>After</h4><div class="gallery-row">${p.after.map(imgThumb).join('')}</div></div>` : '';
  const videos = p.videos?.length ? `<div class="video-list">${p.videos.map(v => `<div class="video-card"><video controls preload="metadata" poster="${v.poster}"><source src="${v.src}" type="video/mp4"></video></div>`).join('')}</div>` : '';
  if(!before && !after && !videos) return '';
  return `<div class="project-details" id="project-details-${i}" hidden>${(before || after) ? `<div class="ba">${before}${after}</div>` : ''}${videos}</div>`;
}

function renderProjectCards(projects, category='All'){
  const holder = $('#projectsGrid');
  if(!holder) return;
  const filtered = category === 'All' ? projects : projects.filter(p => p.category === category);
  holder.innerHTML = filtered.map((p,i) => `
    <article class="project" data-category="${p.category}">
      <div class="project-hero"><img src="${firstImage(p)}" alt="${p.title}"><span class="badge">${p.category}</span></div>
      <div class="project-body">
        <h3>${p.title}</h3>
        <p><strong>${p.location}</strong></p>
        <p>${p.summary}</p>
        ${detailsButton(p,i)}
        ${detailPanel(p,i)}
      </div>
    </article>
  `).join('');
  bindProjectDetails();
  bindLightbox();
}

function bindProjectDetails(){
  $$('.project-toggle').forEach(btn => btn.addEventListener('click', () => {
    const details = document.getElementById(btn.getAttribute('aria-controls'));
    if(!details) return;
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    details.hidden = open;
    btn.textContent = open ? 'View Details' : 'Hide Details';
  }));
}

function renderFilters(projects){
  const tools = $('#projectFilters');
  if(!tools) return;
  const cats = ['All', ...new Set(projects.map(p => p.category))];
  tools.innerHTML = cats.map((c,i) => `<button class="filter ${i===0?'active':''}" type="button" data-cat="${c}">${c}</button>`).join('');
  tools.addEventListener('click', e => {
    if(!e.target.matches('.filter')) return;
    $$('.filter', tools).forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    renderProjectCards(projects, e.target.dataset.cat);
  });
}

function bindLightbox(){
  const lb = $('#lightbox');
  if(!lb) return;
  $$('.thumb').forEach(btn => btn.addEventListener('click', () => {
    $('#lightboxImg').src = btn.dataset.full;
    lb.classList.add('open');
  }));
}
$('#lightboxClose')?.addEventListener('click', () => $('#lightbox')?.classList.remove('open'));
$('#lightbox')?.addEventListener('click', e => { if(e.target.id === 'lightbox') $('#lightbox').classList.remove('open'); });

function renderTestimonials(data){
  const holder = $('#testimonials');
  if(!holder) return;
  holder.innerHTML = data.testimonials.map(t => `<div class="quote"><p>“${t.quote}”</p><b>${t.name}</b></div>`).join('');
}

(async function init(){
  try{
    const data = await getJSON('content/projects.json');
    renderFeatured(data.projects);
    renderFilters(data.projects);
    renderProjectCards(data.projects);
  }catch(e){ console.warn('Project content not loaded yet.', e); }
  try{
    const t = await getJSON('content/testimonials.json');
    renderTestimonials(t);
  }catch(e){ console.warn('Testimonials not loaded yet.', e); }
})();
