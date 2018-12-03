import './style/main.scss';
import renderFn from './friendsTemplate.hbs';

let leftListArray = [];
let rightListArray = [];
const leftZone = document.querySelector('.friends-list-left');
const rightZone = document.querySelector('.friends-list-right');
const drugofilter = document.querySelector('.drugofilter');

// VK

VK.init({
  apiId: 6766432
});

function auth() {
  return new Promise((resolve, reject) => {
    VK.Auth.login(data => {
      if(data.session) {
        resolve();
      } else {
        reject(new Error('не удалось авторизоваться'));
      }
    }, 2);
  });
}

function callAPI(method, params) {
  params.v = '5.76';

  return new Promise((resolve, reject) => {
    VK.api(method, params, (data) => {
      if(data.error) {
        reject(data.error);
      } else {
        resolve(data.response);
      }
    });
  });
}

auth()
  .then(() => {
    return callAPI('friends.get', { fields: 'photo_50' });
  })
  .then(friends => {
    const html = renderFn(friends);
    leftListArray = friends;
    const result = document.querySelector('.friends-list-left');
    result.innerHTML = html;
  });

// обработчики добавление, удаление friend

drugofilter.addEventListener('click', (e) => {
  if(!(e.target.classList.contains('friend__close'))) return;
});

drugofilter.addEventListener('click', (e) => {
  if(!(e.target.classList.contains('friend__plus'))) return;
});

// DnD

makeDnD([leftZone, rightZone]);

function makeDnD(zones) {
  let currentDrag;

  zones.forEach(zone => {

    zone.addEventListener('dragstart', e => {
      currentDrag = { sourse: zone, node: e.target };
    });

    zone.addEventListener('dragover', e => {
      e.preventDefault();
    });

    zone.addEventListener('drop', e => {

      if(currentDrag) {
        e.preventDefault();

        if(currentDrag.sourse !== zone) {

          if(e.target.classList.contains('friend')) {
            zone.appendChild(currentDrag.node, e.target.nextElementSibling);
          } else {
            zone.appendChild(currentDrag.node, zone.lastElementChild);
          }

        }

      }
    });

  });
};
