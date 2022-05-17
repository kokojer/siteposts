const userImg = document.querySelector('.user-img')

const input = document.querySelector('input[value="upload"]')

input.addEventListener('click', () => {
   userImg.classList.add('loading')
})