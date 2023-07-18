
function createElement(elementTag, elementClass) {
  const element = document.createElement(elementTag)
  if (elementClass) element.classList.add(elementClass)
  return element
}

function debounce (fn, ms) {
  let timer
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, ms)
  }
}

const fragment = document.createDocumentFragment()

const app = createElement('div', 'app')
fragment.append(app)

const searchLine = createElement('div', 'search-line')
app.append(searchLine)

const searchInput = createElement('input', 'search-input')
searchLine.append(searchInput)

const searchList = createElement('ul', 'search-list')
searchLine.append(searchList)

const repoList = createElement('div', 'repo-list')
app.append(repoList)

const maxRepo = createElement('div', 'max-repo')
maxRepo.textContent = 'Выбрано максимальное количество!'
app.append(maxRepo)

document.body.append(fragment)

let data

async function searchRepo(e) {
  let userData = null
  if (e.target.value && e.target.value.trim()) userData = e.target.value

  let response = await fetch(`https://api.github.com/search/repositories?q=${userData}&per_page=5`)
  data = await response.json()
  
  let arrJson = []
  data.items.forEach(item => arrJson.push(item.name))
  let arrName = []

  if (userData) {
    arrJson.filter(item => {
      return item.toLowerCase().startsWith(userData.toLowerCase())
    }).forEach(item => {
      item = '<li>' + item + '</li>'
      arrName.push(item)
    })
    searchList.classList.add('visible')

    showSearchList(arrName)    
  } else {
    clearSearch()
  }
  
  if (userData && !document.querySelector('li') && !document.querySelector('.not-found')) notFoundFn()
  if (userData && document.querySelector('li') && arrName.length == 0) {
    notFoundFn()
    clearLi()
  }
  if (userData && document.querySelector('li') && document.querySelector('.not-found')) document.querySelector('.not-found').remove()
}

function showSearchList(list) {
  clearLi()
  let listData
  if (list.length) listData = list.join('')
  if (listData) searchList.insertAdjacentHTML('afterbegin', listData)
}

function clearLi() {
  while (document.querySelector('li')) {
    document.querySelector('li').remove()
  }
}

function clearSearch() {
  searchList.classList.remove('visible')
  searchInput.value = ''
  if (document.querySelector('.not-found')) document.querySelector('.not-found').remove()
  if (document.querySelector('li')) clearLi()
}

function selectedRepo(nameElement, ownerElement, starsElement) {
  const repo = createElement('div', 'selected-repo')
  repo.insertAdjacentHTML('afterbegin', `
    <div class='text'>
      <p><span>Name: </span>${nameElement}</p>
      <p><span>Owner: </span>${ownerElement}</p>
      <p><span>Stars: </span>${starsElement}</p>
    </div>
    <button class='delete-repo'></button>
  `)
  repoList.append(repo)
  return repo
}

function selectRepo(e) {
  let count = document.querySelectorAll('.selected-repo').length
  if (count == 3) {
    maxRepo.classList.add('max-repo-visible')
  } else {
    let nameElement
    let ownerElement
    let starsElement
    for (let value of data.items) {
      if (e.target.textContent == value.name) {
        nameElement = value.name
        ownerElement = value.owner.login
        starsElement = value.stargazers_count
      }
    }
    selectedRepo(nameElement, ownerElement, starsElement)
    clearSearch()
  }
}

function deleteRepo(e) {
  let target = e.target.className
  let removeTag = e.target.closest('div')
  if (target == 'delete-repo') removeTag.remove()
  let count = document.querySelectorAll('.selected-repo').length
  if (count < 3 && document.querySelector('.max-repo-visible')) {
    maxRepo.classList.remove('max-repo-visible')
  }
}

function notFoundFn() {
  let notFound = createElement('div', 'not-found')
  notFound.textContent = 'Ничего не найдено'
  searchList.append(notFound)
}

searchInput.addEventListener('input', debounce(searchRepo, 500))

searchList.addEventListener('click', selectRepo)

repoList.addEventListener('click', deleteRepo)