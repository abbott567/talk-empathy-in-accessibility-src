document.addEventListener('keydown', function (e) {
  var prev = document.getElementById('prev')
  var next = document.getElementById('next')

  // if left arrow pressed
  if (e.keyCode === 37 && prev !== null) {
    prev.click()
  }
  // if right arrow pressed
  if (e.keyCode === 39 && next !== null) {
    next.click()
  }
})
