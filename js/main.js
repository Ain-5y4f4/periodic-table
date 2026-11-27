import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';

import { CONFIG } from './config.js';
import { setupGoogleLogin, signOut } from './auth.js';
import { fetchSheetPeople, loadDemoPeople } from './data.js';
import { LAYOUTS, CAPACITY } from './layouts.js';

const $ = (id) => document.getElementById(id);
const isDemo = new URLSearchParams(location.search).has('demo');

let camera, scene, renderer, controls;
let objects = [];
let google, accessToken;

/* ---------------- Boot ---------------- */
init();

async function init() {
  if (isDemo) { await startApp(await loadDemoPeople(), { name: 'Demo mode' }); return; }

  const configured = !CONFIG.GOOGLE_CLIENT_ID.startsWith('YOUR_');
  if (!configured) showLoginError('Set GOOGLE_CLIENT_ID and SHEET_ID in js/config.js (see README).');

  try {
    google = await setupGoogleLogin({
      button: $('google-btn'),
      onError: (e) => showLoginError(e.message),
      onSignedIn: async ({ accessToken: token, user }) => {
        accessToken = token;
        try {
          $('login-error').hidden = true;
          const people = await fetchSheetPeople(token, CONFIG.SHEET_ID);
          await startApp(people, user);
        } catch (e) {
          const hint = e.status === 403 || e.status === 404
            ? ' Make sure this Google account has access to the sheet.' : '';
          showLoginError(`Could not load the sheet: ${e.message}.${hint}`);
        }
      },
    });
  } catch (e) { showLoginError(e.message); }
}

function showLoginError(msg) {
  const el = $('login-error'); el.textContent = msg; el.hidden = false;
}

/* ---------------- App ---------------- */
async function startApp(people, user) {
  $('login').hidden = true;
  $('app').hidden = false;
  if (!people.length) { showLoginError('The sheet contains no rows.'); return; }

  $('user-name').textContent = user.name || user.email || '';
  if (user.picture) $('user-pic').src = user.picture; else $('user-pic').hidden = true;
  $('signout').onclick = () => { signOut(google, accessToken); location.reload(); };
  if (isDemo) $('signout').hidden = true;

  buildScene(people.slice(0, CAPACITY));
  bindButtons();
  transform('table', 2000);
  animate();
}

function createTile(p) {
  const el = document.createElement('div');
  el.className = 'tile';
  el.style.setProperty('--c', p.color);

  const country = Object.assign(document.createElement('div'), { className: 'country', textContent: p.country });
  const age = Object.assign(document.createElement('div'), { className: 'age', textContent: p.age });
  const img = Object.assign(document.createElement('img'), { src: p.photo, alt: p.name, loading: 'lazy' });
  const name = Object.assign(document.createElement('div'), { className: 'name', textContent: p.name });
  const interest = Object.assign(document.createElement('div'), { className: 'interest', textContent: p.interest });
  el.title = `${p.name} – $${p.netWorth.toLocaleString()}`;
  el.append(country, age, img, name, interest);
  return el;
}

function buildScene(people) {
  camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 1, 10000);
  camera.position.z = 3200;
  scene = new THREE.Scene();

  objects = people.map((p) => {
    const obj = new CSS3DObject(createTile(p));
    obj.position.set(Math.random() * 4000 - 2000, Math.random() * 4000 - 2000, Math.random() * 4000 - 2000);
    scene.add(obj);
    return obj;
  });

  renderer = new CSS3DRenderer();
  renderer.setSize(innerWidth, innerHeight);
  $('container').appendChild(renderer.domElement);

  controls = new TrackballControls(camera, renderer.domElement);
  controls.minDistance = 500;
  controls.maxDistance = 7000;

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}

function bindButtons() {
  document.querySelectorAll('#menu button[data-layout]').forEach((btn) => {
    btn.addEventListener('click', () => transform(btn.dataset.layout, 2000));
  });
}

const dummy = new THREE.Object3D();

function transform(layoutName, duration) {
  const targets = LAYOUTS[layoutName](objects.length);
  TWEEN.removeAll();

  document.querySelectorAll('#menu button[data-layout]').forEach((b) =>
    b.classList.toggle('active', b.dataset.layout === layoutName));

  objects.forEach((obj, i) => {
    const t = targets[i];
    dummy.position.set(t.x, t.y, t.z);
    dummy.rotation.set(0, 0, 0);
    if (t.look) dummy.lookAt(t.look.x, t.look.y, t.look.z);

    new TWEEN.Tween(obj.position)
      .to({ x: t.x, y: t.y, z: t.z }, Math.random() * duration + duration)
      .easing(TWEEN.Easing.Exponential.InOut).start();
    new TWEEN.Tween(obj.rotation)
      .to({ x: dummy.rotation.x, y: dummy.rotation.y, z: dummy.rotation.z }, Math.random() * duration + duration)
      .easing(TWEEN.Easing.Exponential.InOut).start();
  });
}

function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();
  controls.update();
  renderer.render(scene, camera);
}
