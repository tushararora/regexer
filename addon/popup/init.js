((window, document) => {
  'use strict'

  let regexElement = document.getElementById('enter-regex')
  let textElement = document.getElementById('enter-text')
  let errorElement = document.getElementById('error-message')
  let resultsElement = document.getElementById('results')
  let buttonElement = document.getElementById('test')

  const regexerInstance = new Regexer()
  window.onload = regexerInstance.init(regexElement, textElement, errorElement, resultsElement, buttonElement)
})(window, document)