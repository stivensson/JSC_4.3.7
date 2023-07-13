
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

const app = createElement('div', 'app')
document.body.append(app)

const searchLine = createElement('div', 'search-line')
app.append(searchLine)

const searchInput = createElement('input', 'search-input')
searchLine.append(searchInput)

const searchList = createElement('ul', 'search-list')
searchLine.append(searchList)

const repoList = createElement('div', 'repo-list')
app.append(repoList)

const maxRepo = createElement('div', 'max-repo')
maxRepo.innerHTML = 'Выбрано максимальное количество!'
app.append(maxRepo)

async function searchRepo(e) {
  let userData = null
  if (e.target.value && e.target.value != ' ') userData = e.target.value

  let response = await fetch(`https://api.github.com/search/repositories?q=${userData}`)
  let data = await response.json()
  
  let arrJson = []
  data.items.forEach(item => arrJson.push(item.name))
  let arrName = []

  if (userData) {
    arrName = arrJson.filter(item => {
      return item.toLowerCase().startsWith(userData.toLowerCase())
    })
    arrName = arrName.map(item => {
      return item = '<li>' + item + '</li>'
    })
    searchList.classList.add('visible')

    arrName.length = 5

    showSearchList(arrName)

    searchList.onclick = function(element) {
      let count = document.getElementsByClassName('selected-repo').length
      if (count == 3) {
        maxRepo.classList.add('max-repo-visible')
      } else {
        let nameElement
        let ownerElement
        let starsElement
        for (let value of data.items) {
          if (element.target.textContent == value.name) {
            nameElement = value.name
            ownerElement = value.owner.login
            starsElement = value.stargazers_count
          }
        }
        selectRepo(nameElement, ownerElement, starsElement)
        clearSearch()
      }
    }
  } else {
    clearSearch()
  }
  
  if (userData && !document.querySelector('li')) notFoundFn()
}

function showSearchList(list) {
  let listData
  if (list.length) listData = list.join('')
  searchList.innerHTML = listData
}

function clearSearch() {
  searchList.classList.remove('visible')
  searchList.innerHTML = ''
  searchList.onclick = ''
  searchInput.value = ''
}

function selectRepo(nameElement, ownerElement, starsElement) {
  const repo = createElement('div', 'selected-repo')
  repo.innerHTML = `
    <div class='text' >
      <p><span>Name: </span>${nameElement}</p>
      <p><span>Owner: </span>${ownerElement}</p>
      <p><span>Stars: </span>${starsElement}</p>
    </div>
    <button class='delete-repo'></button>
  `
  repoList.append(repo)
  return repo
}

function deleteRepo(e) {
  let target = e.target.className
  let removeTag = e.target.closest('div')
  if (target == 'delete-repo') removeTag.remove()
  let count = document.getElementsByClassName('selected-repo').length
  if (count < 3 && document.getElementsByClassName('max-repo-visible')) {
    maxRepo.classList.remove('max-repo-visible')
  }
}

function notFoundFn() {
  let notFound = createElement('div', 'not-found')
  notFound.innerHTML = 'Ничего не найдено'
  searchList.append(notFound)
}

searchInput.addEventListener('keyup', debounce(searchRepo, 500))

repoList.addEventListener('click', deleteRepo)