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
    const html = renderFn({ items: friends.items, isLeft: true });
    const result = document.querySelector('.friends-list-left');
    result.innerHTML = html;
    leftListArray = friends.items;
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

// фильтрация друзей

const inputLeft = document.querySelector('.drugofilter-input-left');
const inputRight = document.querySelector('.drugofilter-input-right');

const isMatching = (full, chunk) => {
  return full.toLowerCase().indexOf(chunk.toLowerCase()) > -1;
};

// Обработка инпутов левого списка и правого списка
inputLeft.addEventListener('keyup', e => {
  const value = inputLeft.value;

  if(!value) {
    return renderFriends(leftListArray, true);
  }

  const filterFriends = leftListArray.filter(friend => isMatching(`${friend.first_name} ${friend.last_name}`, value));

  return renderFriends(filterFriends, true);
});

inputRight.addEventListener('keyup', e => {
  const value = inputRight.value;

  if(!value) {
    return renderFriends(rightListArray, false);
  }

  const filterFriends = rightListArray.filter(friend => isMatching(`${friend.first_name} ${friend.last_name}`, value));

  return renderFriends(filterFriends, false);
});

// Добавление друзей
const renderFriends = (array, isLeft) => {

  if(isLeft) {
    const leftFriendHTML = renderFn({ items: array, isLeft: true });
    return leftZone.innerHTML = leftFriendHTML;
  }

  else {
    const rightFriendHTML = renderFn({ items: array, isLeft: false });
    return rightZone.innerHTML = rightFriendHTML;
  }
};
