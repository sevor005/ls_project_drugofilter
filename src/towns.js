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
    const rightListId = localStorage.getItem("rightListId") || [];
    leftListArray = friends.items.filter(friend => !rightListId.includes(friend.id));
    rightListArray = friends.items.filter(friend => rightListId.includes(friend.id));

    const html = renderFn({ items: leftListArray, isLeft: true });
    const result = document.querySelector('.friends-list-left');
    result.innerHTML = html;

    const resultRight = document.querySelector('.friends-list-right');
    const htmlRight = renderFn({ items: rightListArray, isLeft: false });
    resultRight.innerHTML = htmlRight;
  });

// обработчики добавление, удаление friend
drugofilter.addEventListener('click', (e) => {
  if(!(e.target.classList.contains('friend__close'))) return;

  const currentElement = e.target.parentNode;
  moveOfLeftList(currentElement);
});

drugofilter.addEventListener('click', (e) => {
  if(!(e.target.classList.contains('friend__plus'))) return;
  
  const currentElement = e.target.parentNode;
  moveOfRightList(currentElement);
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

      if (currentDrag) {
        e.preventDefault();
    
        if (currentDrag.sourse !== zone) {
          if(zone === leftZone) {
            const currentElement = currentDrag.node;
            moveOfLeftList(currentElement);
          }
          if(zone === rightZone) {
            const currentElement = currentDrag.node;
            moveOfRightList(currentElement);
          }
        }
      }
    });

  });
};

//перемещение друзей логика рендеринга списков
const moveOfLeftList = currentElement => {
  const id = currentElement.getAttribute('data-id');
  const index = rightListArray.findIndex(friend => friend.id === Number(id));
  const valueRightInput = inputRight.value;
  const valueLeftInput = inputLeft.value;

  leftListArray.push(rightListArray[index]);
  rightListArray.splice(index, 1);

  renderFriends(filterFriends(leftListArray, valueLeftInput), true);
  renderFriends(filterFriends(rightListArray, valueRightInput), false);
};

const moveOfRightList = currentElement => {
  const id = currentElement.getAttribute('data-id');
  const index = leftListArray.findIndex(friend => friend.id === Number(id));
  const valueRightInput = inputRight.value;
  const valueLeftInput = inputLeft.value;

  rightListArray.push(leftListArray[index]);
  leftListArray.splice(index, 1);

  renderFriends(filterFriends(leftListArray, valueLeftInput), true);
  renderFriends(filterFriends(rightListArray, valueRightInput), false);
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

  return renderFriends(filterFriends(leftListArray,value), true);
});

inputRight.addEventListener('keyup', e => {
  const value = inputRight.value;

  if(!value) {
    return renderFriends(rightListArray, false);
  }

  return renderFriends(filterFriends(rightListArray,value), false);
});

const filterFriends = (listFriends, value) => {
  if(!value) return listFriends;
  
  return listFriends.filter(friend => isMatching(`${friend.first_name} ${friend.last_name}`, value));
};

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

// local Storage
drugofilter.addEventListener('click', e => {
  if(e.target.tagName !== 'BUTTON') return;
  const idList = rightListArray.map(elem => elem.id);

  localStorage.setItem("rightListId", JSON.stringify(idList));
  alert('Сохранено');
});
