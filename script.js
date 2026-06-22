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

function comparePhoto(img, label){
  if(!img) return `<div class="compare-empty">No ${label.toLowerCase()} photo</div>`;
  return `<button class="compare-photo" type="button" data-full="${img.src}" aria-label="Open ${label} image"><img src="${img.src}" alt="${img.alt || label}"></button>`;
}

function detailPanel(p, i){
  const before = p.before || [];
  const after = p.after || [];
  const videos = p.videos || [];
  const pairCount = Math.max(before.length, after.length);
  let comparisons = '';

  if(pairCount){
    comparisons = `<div class="compare-wrap">
      ${Array.from({length: pairCount}).map((_, idx) => `
        <div class="compare-set">
          <div class="compare-col"><h4>Before</h4>${comparePhoto(before[idx], 'Before')}</div>
          <div class="compare-col"><h4>After</h4>${comparePhoto(after[idx], 'After')}</div>
        </div>
      `).join('')}
    </div>`;
  }

  const videoBlock = videos.length ? `<div class="video-list">
    <h4>Jobsite Video</h4>
    ${videos.map(v => `<div class="video-card"><video controls preload="metadata" poster="${v.poster}"><source src="${v.src}" type="video/mp4"></video></div>`).join('')}
  </div>` : '';

  if(!comparisons && !videoBlock) return '';
  return `<div class="project-details" id="project-details-${i}" hidden>${comparisons}${videoBlock}</div>`;
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
  $$('.thumb, .compare-photo').forEach(btn => btn.addEventListener('click', () => {
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


// Inline Netlify form submission: prevents thank-you route 404 and shows success on the same page.
function encodeFormData(formData){
  return new URLSearchParams(formData).toString();
}

const serviceRequestForm = document.getElementById('serviceRequestForm');
if(serviceRequestForm){
  serviceRequestForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = serviceRequestForm.querySelector('button[type="submit"]');
    const successBox = document.getElementById('formSuccess');
    const errorBox = document.getElementById('formError');

    if(successBox) successBox.hidden = true;
    if(errorBox) errorBox.hidden = true;
    if(submitButton){
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    try{
      const formData = new FormData(serviceRequestForm);
      if(!formData.get('form-name')){
        formData.append('form-name', serviceRequestForm.getAttribute('name'));
      }

      const response = await fetch(location.pathname || '/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeFormData(formData)
      });

      if(!response.ok){
        throw new Error('Form submission failed.');
      }

      serviceRequestForm.reset();
      if(successBox){
        successBox.hidden = false;
        successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }catch(error){
      console.warn(error);
      if(errorBox){
        errorBox.hidden = false;
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }finally{
      if(submitButton){
        submitButton.disabled = false;
        submitButton.textContent = 'Send Request';
      }
    }
  });
}
